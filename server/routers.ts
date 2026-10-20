import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { sendContactNotification, sendContactReply, sendEventRegistrationConfirmation } from "./email";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const contentImageUrl = z.union([
  z.string().url(),
  z.string().regex(/^\/(?:storage|manus-storage|images)\/[A-Za-z0-9._/-]+$/, "Invalid stored image path"),
]);

const contentInput = z.object({
  type: z.enum(["news", "event", "achievement", "document"]),
  title: z.string().trim().min(5).max(240),
  summary: z.string().trim().min(15).max(3000),
  body: z.string().trim().max(15_000).optional().or(z.literal("")),
  imageUrl: contentImageUrl.optional().or(z.literal("")),
  documentCategory: z.enum(["governance", "annual_report"]).optional().nullable(),
  documentYear: z.number().int().min(2000).max(2100).optional().nullable(),
  status: z.enum(["draft", "published"]),
  eventStartsAt: z.number().int().positive().optional().nullable(),
  eventLocation: z.string().trim().max(240).optional().or(z.literal("")),
});

const MAX_ATTACHMENT_COUNT = 3;
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedAttachmentTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

const attachmentInput = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(allowedAttachmentTypes),
  size: z.number().int().positive().max(MAX_ATTACHMENT_SIZE),
  base64: z.string().min(4).max(7_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

const allowedContentImageTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const allowedDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const contentImageInput = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(allowedContentImageTypes),
  size: z.number().int().positive().max(MAX_CONTENT_IMAGE_SIZE),
  base64: z.string().min(4).max(7_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
});
const documentFileInput = z.object({
  name: z.string().trim().min(1).max(255),
  type: z.enum(allowedDocumentTypes),
  size: z.number().int().positive().max(MAX_DOCUMENT_SIZE),
  base64: z.string().min(4).max(14_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/),
});

const surveyQuestionInput = z.object({
  prompt: z.string().trim().min(4).max(500),
  helpText: z.string().trim().max(500).optional().or(z.literal("")),
  type: z.enum(["single_choice", "rating", "text"]),
  options: z.array(z.string().trim().min(1).max(120)).max(10).default([]),
  isRequired: z.boolean().default(true),
}).superRefine((question, context) => {
  if (question.type === "single_choice" && question.options.length < 2) {
    context.addIssue({ code: "custom", message: "Single-choice questions need at least two options", path: ["options"] });
  }
});

const surveyInput = z.object({
  title: z.string().trim().min(5).max(240),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]),
  questions: z.array(surveyQuestionInput).min(1).max(50),
});

const toSafeFileName = (fileName: string) =>
  fileName.replace(/[^A-Za-z0-9._-]/g, "_").replace(/_+/g, "_").slice(0, 180);

const hasMatchingImageSignature = (file: Buffer, mimeType: (typeof allowedContentImageTypes)[number]) => {
  if (mimeType === "image/jpeg") return file.length >= 3 && file[0] === 0xff && file[1] === 0xd8 && file[2] === 0xff;
  if (mimeType === "image/png") return file.length >= 8 && file.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return file.length >= 12 && file.subarray(0, 4).toString("ascii") === "RIFF" && file.subarray(8, 12).toString("ascii") === "WEBP";
};

const hasMatchingDocumentSignature = (file: Buffer, mimeType: (typeof allowedDocumentTypes)[number]) => {
  if (mimeType === "application/pdf") return file.length >= 5 && file.subarray(0, 5).toString("ascii") === "%PDF-";
  if (mimeType === "application/msword") return file.length >= 8 && file.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return file.length >= 4 && file.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
};

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(
        z.object({
          usernameOrEmail: z.string().trim().min(1),
          password: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await sdk.loginWithCredentials(input.usernameOrEmail, input.password);
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "INVALID_CREDENTIALS",
          });
        }
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "مدير الجمعية",
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        return {
          success: true,
          user,
        } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  content: router({
    publicList: publicProcedure.query(() => db.listPublishedContent()),
    publicNewsById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const item = await db.getPublishedContentById(input.id);
      if (!item || item.type !== "news") throw new TRPCError({ code: "NOT_FOUND", message: "News item not found" });
      return item;
    }),
    adminList: adminProcedure.query(() => db.listAllContent()),
    uploadImage: adminProcedure.input(contentImageInput).mutation(async ({ input }) => {
      const imageBuffer = Buffer.from(input.base64, "base64");
      if (imageBuffer.length !== input.size || imageBuffer.length > MAX_CONTENT_IMAGE_SIZE || !hasMatchingImageSignature(imageBuffer, input.type)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid content image" });
      }
      const fileName = toSafeFileName(input.name);
      const stored = await storagePut(`content-images/${crypto.randomUUID()}-${fileName}`, imageBuffer, input.type);
      return { url: stored.url, fileName } as const;
    }),
    uploadDocument: adminProcedure.input(documentFileInput).mutation(async ({ input }) => {
      const documentBuffer = Buffer.from(input.base64, "base64");
      if (documentBuffer.length !== input.size || documentBuffer.length > MAX_DOCUMENT_SIZE || !hasMatchingDocumentSignature(documentBuffer, input.type)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid document file" });
      }
      const fileName = toSafeFileName(input.name);
      const stored = await storagePut(`governance-documents/${crypto.randomUUID()}-${fileName}`, documentBuffer, input.type);
      return { url: stored.url, fileName } as const;
    }),
    create: adminProcedure.input(contentInput).mutation(async ({ input }) => {
      return {
        id: await db.createContentItem({
          ...input,
        body: input.body || null,
        imageUrl: input.imageUrl || null,
        documentCategory: input.type === "document" ? input.documentCategory ?? null : null,
        documentYear: input.type === "document" ? input.documentYear ?? null : null,
        eventLocation: input.eventLocation || null,
          eventStartsAt: input.eventStartsAt ? new Date(input.eventStartsAt) : null,
        }),
      };
    }),
    update: adminProcedure.input(contentInput.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const { id, ...item } = input;
      await db.updateContentItem(id, {
        ...item,
        body: item.body || null,
        imageUrl: item.imageUrl || null,
        documentCategory: item.type === "document" ? item.documentCategory ?? null : null,
        documentYear: item.type === "document" ? item.documentYear ?? null : null,
        eventLocation: item.eventLocation || null,
        eventStartsAt: item.eventStartsAt ? new Date(item.eventStartsAt) : null,
      });
      return { success: true } as const;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await db.deleteContentItem(input.id);
      return { success: true } as const;
    }),
    recordDocumentDownload: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const document = await db.getPublishedDocumentById(input.id);
      if (!document?.imageUrl) throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
      const downloadCount = await db.incrementDocumentDownload(input.id);
      return { downloadCount } as const;
    }),
  }),
  events: router({
    register: publicProcedure.input(z.object({
      eventId: z.number().int().positive(),
      attendeeName: z.string().trim().min(2).max(160),
      attendeeEmail: z.string().trim().email().max(320),
      attendeePhone: z.string().trim().max(48).optional().or(z.literal("")),
    })).mutation(async ({ input }) => {
      const event = await db.getPublishedEventById(input.eventId);
      if (!event?.eventStartsAt || event.eventStartsAt.getTime() <= Date.now()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Event registration is unavailable" });
      }
      try {
        const id = await db.createEventRegistration({
          eventId: input.eventId,
          attendeeName: input.attendeeName,
          attendeeEmail: input.attendeeEmail,
          attendeePhone: input.attendeePhone || null,
        });
        let confirmationDelivered = false;
        try {
          await sendEventRegistrationConfirmation({
            recipientName: input.attendeeName,
            recipientEmail: input.attendeeEmail,
            eventTitle: event.title,
            eventStartsAt: event.eventStartsAt,
            eventLocation: event.eventLocation,
          });
          confirmationDelivered = true;
        } catch (error) {
          console.error("[Events] Registration stored but confirmation email failed", error);
        }
        return { success: true, id, confirmationDelivered } as const;
      } catch (error) {
        const databaseCode = (error as { code?: string; cause?: { code?: string } }).code
          ?? (error as { cause?: { code?: string } }).cause?.code;
        if (databaseCode === "ER_DUP_ENTRY") {
          throw new TRPCError({ code: "CONFLICT", message: "EMAIL_ALREADY_REGISTERED" });
        }
        throw error;
      }
    }),
    adminRegistrations: adminProcedure.query(() => db.listEventRegistrations()),
  }),
  surveys: router({
    publicActive: publicProcedure.query(() => db.getPublishedSurvey()),
    submit: publicProcedure.input(z.object({
      surveyId: z.number().int().positive(),
      respondentToken: z.string().regex(/^[a-f0-9-]{36}$/i),
      answers: z.array(z.object({ questionId: z.number().int().positive(), value: z.string().trim().max(2000) })).max(50),
    })).mutation(async ({ input }) => {
      const active = await db.getPublishedSurvey();
      if (!active || active.survey.id !== input.surveyId) throw new TRPCError({ code: "NOT_FOUND", message: "SURVEY_UNAVAILABLE" });

      const questionMap = new Map(active.questions.map(question => [question.id, question]));
      const submittedValues = new Map(input.answers.map(answer => [answer.questionId, answer.value]));
      if (submittedValues.size !== input.answers.length || Array.from(submittedValues.keys()).some(questionId => !questionMap.has(questionId))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_SURVEY_ANSWERS" });
      }

      const acceptedAnswers = active.questions.flatMap(question => {
        const value = submittedValues.get(question.id)?.trim() ?? "";
        if (question.isRequired === "yes" && !value) throw new TRPCError({ code: "BAD_REQUEST", message: "REQUIRED_SURVEY_ANSWER" });
        if (!value) return [];
        if (question.type === "rating" && !["1", "2", "3", "4", "5"].includes(value)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_SURVEY_RATING" });
        }
        if (question.type === "single_choice") {
          const options = JSON.parse(question.optionsJson ?? "[]") as string[];
          const isAllowed = options.includes(value) || (options.some(opt => opt.includes("أخرى")) && value.startsWith("أخرى"));
          if (!isAllowed) throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_SURVEY_OPTION" });
        }
        return [{ questionId: question.id, value }];
      });

      try {
        const respondentTokenHash = createHash("sha256").update(input.respondentToken).digest("hex");
        const responseId = await db.createSurveyResponse(input.surveyId, respondentTokenHash, acceptedAnswers);
        return { success: true, responseId } as const;
      } catch (error) {
        const databaseCode = (error as { code?: string; cause?: { code?: string } }).code
          ?? (error as { cause?: { code?: string } }).cause?.code;
        if (databaseCode === "ER_DUP_ENTRY") throw new TRPCError({ code: "CONFLICT", message: "SURVEY_ALREADY_COMPLETED" });
        throw error;
      }
    }),
    adminList: adminProcedure.query(() => db.listSurveysForAdmin()),
    adminGet: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const survey = await db.getSurveyForAdmin(input.id);
      if (!survey) throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
      return survey;
    }),
    adminResults: adminProcedure.input(z.object({ surveyId: z.number().int().positive() })).query(async ({ input }) => {
      const survey = await db.getSurveyForAdmin(input.surveyId);
      if (!survey) throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
      const results = await db.getSurveyResults(input.surveyId);
      return { ...survey, ...results };
    }),
    create: adminProcedure.input(surveyInput).mutation(async ({ input }) => {
      const surveyId = await db.createSurveyWithQuestions(
        { title: input.title, description: input.description || null, status: input.status },
        input.questions.map((question, position) => ({ ...question, helpText: question.helpText || null, optionsJson: question.type === "single_choice" ? JSON.stringify(question.options) : null, isRequired: question.isRequired ? "yes" : "no", position })),
      );
      return { surveyId } as const;
    }),
    update: adminProcedure.input(surveyInput.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await db.updateSurveyWithQuestions(
        input.id,
        { title: input.title, description: input.description || null, status: input.status },
        input.questions.map((question, position) => ({ ...question, helpText: question.helpText || null, optionsJson: question.type === "single_choice" ? JSON.stringify(question.options) : null, isRequired: question.isRequired ? "yes" : "no", position })),
      );
      return { success: true } as const;
    }),
    delete: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await db.deleteSurvey(input.id);
      return { success: true } as const;
    }),
  }),
  contact: router({
    submit: publicProcedure.input(z.object({
      senderName: z.string().trim().min(2).max(160),
      senderEmail: z.string().trim().email().max(320),
      phone: z.string().trim().max(48).optional().or(z.literal("")),
      subject: z.string().trim().min(3).max(240),
      message: z.string().trim().min(10).max(5000),
      attachments: z.array(attachmentInput).max(MAX_ATTACHMENT_COUNT).default([]),
    })).mutation(async ({ input }) => {
      const { attachments, ...contactInput } = input;
      const messageId = await db.createContactMessage({
        ...contactInput,
        phone: contactInput.phone || null,
      });

      for (const attachment of attachments) {
        const fileBuffer = Buffer.from(attachment.base64, "base64");
        if (fileBuffer.length !== attachment.size || fileBuffer.length > MAX_ATTACHMENT_SIZE) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid attachment size" });
        }

        const fileName = toSafeFileName(attachment.name);
        const stored = await storagePut(
          `contact-messages/${messageId}/${crypto.randomUUID()}-${fileName}`,
          fileBuffer,
          attachment.type,
        );
        await db.createContactAttachment({
          messageId,
          fileName,
          storageKey: stored.key,
          fileUrl: stored.url,
          mimeType: attachment.type,
          fileSize: fileBuffer.length,
        });
      }

      let delivered = false;
      try {
        await sendContactNotification(contactInput);
        delivered = true;
      } catch (error) {
        console.error("[Contact] Message stored but email notification failed", error);
      }

      return { success: true, delivered, messageId, attachmentCount: attachments.length } as const;
    }),
    adminList: adminProcedure.query(() => db.listContactMessages()),
    adminAttachments: adminProcedure.query(() => db.listContactAttachments()),
    adminReplies: adminProcedure.query(() => db.listContactReplies()),
    markRead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      await db.markContactMessageRead(input.id);
      return { success: true } as const;
    }),
    reply: adminProcedure.input(z.object({
      id: z.number().int().positive(),
      body: z.string().trim().min(5).max(5000),
    })).mutation(async ({ input }) => {
      const message = await db.getContactMessageById(input.id);
      if (!message) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Contact message not found" });
      }

      await sendContactReply({
        recipientName: message.senderName,
        recipientEmail: message.senderEmail,
        originalSubject: message.subject,
        body: input.body,
      });
      const replyId = await db.createContactReply({ messageId: input.id, body: input.body });
      await db.markContactMessageReplied(input.id);
      return { success: true, replyId } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
