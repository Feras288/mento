import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  createContentItem: vi.fn(async () => 31),
  createContactMessage: vi.fn(async () => 42),
  createContactAttachment: vi.fn(async () => 88),
  createContactReply: vi.fn(async () => 73),
  getContactMessageById: vi.fn(),
  listAllContent: vi.fn(async () => []),
  listContactMessages: vi.fn(async () => []),
  listContactAttachments: vi.fn(async () => []),
  listContactReplies: vi.fn(async () => []),
  listPublishedContent: vi.fn(async () => []),
  getPublishedContentById: vi.fn(),
  getPublishedEventById: vi.fn(),
  getPublishedDocumentById: vi.fn(),
  incrementDocumentDownload: vi.fn(async () => 18),
  createEventRegistration: vi.fn(async () => 51),
  listEventRegistrations: vi.fn(async () => []),
  markContactMessageRead: vi.fn(async () => undefined),
  markContactMessageReplied: vi.fn(async () => undefined),
  deleteContentItem: vi.fn(async () => undefined),
  updateContentItem: vi.fn(async () => undefined),
}));

const emailMocks = vi.hoisted(() => ({
  sendContactNotification: vi.fn(async () => undefined),
  sendContactReply: vi.fn(async () => undefined),
  sendEventRegistrationConfirmation: vi.fn(async () => undefined),
}));

const storageMocks = vi.hoisted(() => ({
  storagePut: vi.fn(async () => ({ key: "contact-messages/42/verification.pdf", url: "/manus-storage/contact-messages/42/verification.pdf" })),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./email", () => emailMocks);
vi.mock("./storage", () => storageMocks);

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const administratorContext = {
  user: {
    id: 1,
    openId: "association-admin",
    email: "info@acsd.sa",
    name: "مدير الجمعية",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as unknown as TrpcContext;

const publicContext = {
  user: null,
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as unknown as TrpcContext;

describe("content and contact procedures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows an administrator to create a published event", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.content.create({
      type: "event",
      title: "ورشة الممارسات الزراعية المستدامة",
      summary: "جلسة عملية لمشاركة المعرفة حول إدارة الموارد الزراعية بكفاءة.",
      imageUrl: "",
      status: "published",
      eventStartsAt: Date.now() + 86_400_000,
      eventLocation: "مقر الجمعية",
    });

    expect(result).toEqual({ id: 31 });
    expect(dbMocks.createContentItem).toHaveBeenCalledWith(expect.objectContaining({ type: "event", status: "published" }));
  });

  it("allows an administrator to create a published achievement", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.content.create({
      type: "achievement",
      title: "محطة أثر معتمدة",
      summary: "يوثّق هذا الإنجاز المعتمد أثر مبادرة الجمعية بعد اكتمال مراجعتها الداخلية.",
      imageUrl: "",
      status: "published",
      eventStartsAt: null,
      eventLocation: "",
    });

    expect(result).toEqual({ id: 31 });
    expect(dbMocks.createContentItem).toHaveBeenCalledWith(expect.objectContaining({ type: "achievement", status: "published" }));
  });

  it("allows an administrator to upload a validated content image", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.content.uploadImage({
      name: "field-photo.png",
      type: "image/png",
      size: 8,
      base64: "iVBORw0KGgo=",
    });

    expect(result).toEqual({ url: "/manus-storage/contact-messages/42/verification.pdf", fileName: "field-photo.png" });
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringMatching(/^content-images\/.+-field-photo\.png$/), expect.any(Buffer), "image/png");
  });

  it("allows an administrator to upload a validated governance document", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.content.uploadDocument({
      name: "governance-report.pdf",
      type: "application/pdf",
      size: 5,
      base64: "JVBERi0=",
    });

    expect(result).toEqual({ url: "/manus-storage/contact-messages/42/verification.pdf", fileName: "governance-report.pdf" });
    expect(storageMocks.storagePut).toHaveBeenCalledWith(expect.stringMatching(/^governance-documents\/.+-governance-report\.pdf$/), expect.any(Buffer), "application/pdf");
  });

  it("allows an administrator to publish a linked governance document", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.content.create({
      type: "document",
      title: "تقرير الحوكمة السنوي",
      summary: "وثيقة معتمدة تشرح إطار الحوكمة ومسار الإفصاح المؤسسي للجمعية.",
      imageUrl: "/manus-storage/governance-documents/governance-report.pdf",
      status: "published",
      eventStartsAt: null,
      eventLocation: "",
    });

    expect(result).toEqual({ id: 31 });
    expect(dbMocks.createContentItem).toHaveBeenCalledWith(expect.objectContaining({ type: "document" }));
  });

  it("records a public document download and returns the updated count", async () => {
    dbMocks.getPublishedDocumentById.mockResolvedValue({
      id: 71,
      type: "document",
      imageUrl: "/manus-storage/governance-documents/governance-report.pdf",
    });
    const caller = appRouter.createCaller(publicContext);

    const result = await caller.content.recordDocumentDownload({ id: 71 });

    expect(result).toEqual({ downloadCount: 18 });
    expect(dbMocks.incrementDocumentDownload).toHaveBeenCalledWith(71);
  });

  it("accepts a stored image path when publishing content", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.content.create({
      type: "news",
      title: "خبر مصور من لوحة الجمعية",
      summary: "يختبر هذا الخبر حفظ مسار صورة مرفوعة من لوحة الإدارة ضمن المحتوى المنشور.",
      imageUrl: "/manus-storage/content-images/field-photo.png",
      status: "published",
      eventStartsAt: null,
      eventLocation: "",
    });

    expect(result).toEqual({ id: 31 });
    expect(dbMocks.createContentItem).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: "/manus-storage/content-images/field-photo.png" }));
  });

  it("returns a published news item with its full body for the public detail page", async () => {
    dbMocks.getPublishedContentById.mockResolvedValue({
      id: 12,
      type: "news",
      title: "خبر الجمعية التفصيلي",
      summary: "ملخص موجز للخبر المنشور في واجهة الجمعية.",
      body: "الفقرة الأولى من نص الخبر الكامل.\n\nالفقرة الثانية من نص الخبر الكامل.",
      imageUrl: "/manus-storage/content-images/news.jpg",
      status: "published",
      publishedAt: new Date(),
      eventStartsAt: null,
      eventLocation: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const caller = appRouter.createCaller(publicContext);

    const result = await caller.content.publicNewsById({ id: 12 });

    expect(result).toMatchObject({ id: 12, body: expect.stringContaining("الفقرة الأولى") });
    expect(dbMocks.getPublishedContentById).toHaveBeenCalledWith(12);
  });

  it("registers a visitor for a published upcoming event", async () => {
    dbMocks.getPublishedEventById.mockResolvedValue({
      id: 44,
      type: "event",
      title: "ورشة الحوكمة الزراعية",
      eventStartsAt: new Date(Date.now() + 86_400_000),
      eventLocation: "مقر الجمعية",
    });
    const caller = appRouter.createCaller(publicContext);

    const result = await caller.events.register({
      eventId: 44,
      attendeeName: "مستفيد الجمعية",
      attendeeEmail: "visitor@example.com",
      attendeePhone: "0500000000",
    });

    expect(result).toEqual({ success: true, id: 51, confirmationDelivered: true });
    expect(dbMocks.createEventRegistration).toHaveBeenCalledWith({
      eventId: 44,
      attendeeName: "مستفيد الجمعية",
      attendeeEmail: "visitor@example.com",
      attendeePhone: "0500000000",
    });
    expect(emailMocks.sendEventRegistrationConfirmation).toHaveBeenCalledWith(expect.objectContaining({
      recipientName: "مستفيد الجمعية",
      recipientEmail: "visitor@example.com",
      eventTitle: "ورشة الحوكمة الزراعية",
      eventLocation: "مقر الجمعية",
    }));
  });

  it("rejects duplicate registration for the same event and email", async () => {
    dbMocks.getPublishedEventById.mockResolvedValue({
      id: 44,
      type: "event",
      eventStartsAt: new Date(Date.now() + 86_400_000),
    });
    dbMocks.createEventRegistration.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });
    const caller = appRouter.createCaller(publicContext);

    await expect(caller.events.register({
      eventId: 44,
      attendeeName: "مستفيد الجمعية",
      attendeeEmail: "visitor@example.com",
      attendeePhone: "",
    })).rejects.toMatchObject({ code: "CONFLICT", message: "EMAIL_ALREADY_REGISTERED" });
  });

  it("stores an incoming contact message and sends a notification", async () => {
    const caller = appRouter.createCaller(publicContext);
    const result = await caller.contact.submit({
      senderName: "مستفيد تجريبي",
      senderEmail: "visitor@example.com",
      phone: "",
      subject: "استفسار عن مبادرات الجمعية",
      message: "أرغب في معرفة المزيد عن البرامج التدريبية والمبادرات المتاحة للمزارعين.",
    });

    expect(result).toEqual({ success: true, delivered: true, messageId: 42, attachmentCount: 0 });
    expect(dbMocks.createContactMessage).toHaveBeenCalledOnce();
    expect(emailMocks.sendContactNotification).toHaveBeenCalledOnce();
  });

  it("stores an allowed attachment through secure storage", async () => {
    const caller = appRouter.createCaller(publicContext);
    const result = await caller.contact.submit({
      senderName: "مستفيد تجريبي",
      senderEmail: "visitor@example.com",
      phone: "",
      subject: "إرسال وثيقة للمراجعة",
      message: "أرفق هذه الوثيقة للاطلاع عليها ضمن طلب التعاون مع الجمعية.",
      attachments: [{
        name: "verification.pdf",
        type: "application/pdf",
        size: 5,
        base64: "cHJvb2Y=",
      }],
    });

    expect(result).toEqual({ success: true, delivered: true, messageId: 42, attachmentCount: 1 });
    expect(dbMocks.createContactAttachment).toHaveBeenCalledWith(expect.objectContaining({
      messageId: 42,
      fileName: "verification.pdf",
      fileUrl: "/manus-storage/contact-messages/42/verification.pdf",
      mimeType: "application/pdf",
      fileSize: 5,
    }));
  });

  it("rejects contact messages that do not contain enough detail", async () => {
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.contact.submit({
      senderName: "أ",
      senderEmail: "not-an-email",
      phone: "",
      subject: "س",
      message: "قصير",
    })).rejects.toThrow();
  });

  it("records the sent reply and marks its source message as replied", async () => {
    dbMocks.getContactMessageById.mockResolvedValue({
      id: 9,
      senderName: "صاحب الطلب",
      senderEmail: "visitor@example.com",
      subject: "طلب معلومات",
    });
    const caller = appRouter.createCaller(administratorContext);

    const result = await caller.contact.reply({
      id: 9,
      body: "نشكر تواصلكم، وسيقوم فريق الجمعية بالمتابعة معكم قريبًا.",
    });

    expect(result).toEqual({ success: true, replyId: 73 });
    expect(emailMocks.sendContactReply).toHaveBeenCalledOnce();
    expect(dbMocks.createContactReply).toHaveBeenCalledWith({
      messageId: 9,
      body: "نشكر تواصلكم، وسيقوم فريق الجمعية بالمتابعة معكم قريبًا.",
    });
    expect(dbMocks.markContactMessageReplied).toHaveBeenCalledWith(9);
  });
});
