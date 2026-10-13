import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getPublishedSurvey: vi.fn(),
  createSurveyResponse: vi.fn(async () => 91),
  createSurveyWithQuestions: vi.fn(async () => 73),
  updateSurveyWithQuestions: vi.fn(async () => undefined),
  listSurveysForAdmin: vi.fn(async () => []),
  getSurveyForAdmin: vi.fn(),
  getSurveyResults: vi.fn(async () => ({ responses: [], answers: [] })),
  deleteSurvey: vi.fn(async () => undefined),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./email", () => ({ sendContactNotification: vi.fn(), sendContactReply: vi.fn(), sendEventRegistrationConfirmation: vi.fn() }));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const administratorContext = {
  user: { id: 1, openId: "admin", email: "info@acsd.sa", name: "مدير", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  req: { protocol: "https", headers: {} },
  res: { clearCookie: vi.fn() },
} as unknown as TrpcContext;
const publicContext = { user: null, req: { protocol: "https", headers: {} }, res: { clearCookie: vi.fn() } } as unknown as TrpcContext;

const activeSurvey = {
  survey: { id: 73, title: "استبيان احتياجات المستفيدين", description: null, status: "published", createdAt: new Date(), updatedAt: new Date() },
  questions: [
    { id: 12, surveyId: 73, prompt: "كيف تقيّم وضوح الخدمات؟", helpText: null, type: "rating", optionsJson: null, isRequired: "yes", position: 0 },
    { id: 13, surveyId: 73, prompt: "ما المجال الأكثر أهمية؟", helpText: null, type: "single_choice", optionsJson: "[\"التدريب\",\"الإرشاد\"]", isRequired: "yes", position: 1 },
  ],
} as const;

describe("survey procedures", () => {
  beforeEach(() => { vi.clearAllMocks(); dbMocks.getPublishedSurvey.mockResolvedValue(activeSurvey); });

  it("allows an administrator to create a published survey with ordered questions", async () => {
    const caller = appRouter.createCaller(administratorContext);
    const result = await caller.surveys.create({
      title: "استبيان احتياجات المستفيدين",
      description: "استبيان معتمد لقياس الاحتياجات ذات الأولوية.",
      status: "published",
      questions: [{ prompt: "كيف تقيّم وضوح الخدمات؟", helpText: "اختر من 1 إلى 5", type: "rating", options: [], isRequired: true }],
    });
    expect(result).toEqual({ surveyId: 73 });
    expect(dbMocks.createSurveyWithQuestions).toHaveBeenCalledWith(
      expect.objectContaining({ status: "published" }),
      [expect.objectContaining({ position: 0, type: "rating", isRequired: "yes" })],
    );
  });

  it("stores valid public answers without storing a raw device token", async () => {
    const caller = appRouter.createCaller(publicContext);
    const result = await caller.surveys.submit({
      surveyId: 73,
      respondentToken: "cc82b973-10c6-4c8e-9376-48aa1296cd7d",
      answers: [{ questionId: 12, value: "5" }, { questionId: 13, value: "التدريب" }],
    });
    expect(result).toEqual({ success: true, responseId: 91 });
    expect(dbMocks.createSurveyResponse).toHaveBeenCalledWith(73, expect.stringMatching(/^[a-f0-9]{64}$/), [{ questionId: 12, value: "5" }, { questionId: 13, value: "التدريب" }]);
  });

  it("rejects a repeated response from the same device", async () => {
    dbMocks.createSurveyResponse.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });
    const caller = appRouter.createCaller(publicContext);
    await expect(caller.surveys.submit({
      surveyId: 73,
      respondentToken: "cc82b973-10c6-4c8e-9376-48aa1296cd7d",
      answers: [{ questionId: 12, value: "5" }, { questionId: 13, value: "التدريب" }],
    })).rejects.toMatchObject({ code: "CONFLICT", message: "SURVEY_ALREADY_COMPLETED" } satisfies Partial<TRPCError>);
  });
});
