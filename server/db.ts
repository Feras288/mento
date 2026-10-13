import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import fs from "node:fs";
import path from "node:path";
import {
  contactAttachments,
  contactReplies,
  contactMessages,
  contentItems,
  eventRegistrations,
  surveyAnswers,
  surveyQuestions,
  surveyResponses,
  surveys,
  InsertContactMessage,
  InsertContactAttachment,
  InsertContactReply,
  InsertContentItem,
  InsertEventRegistration,
  InsertSurvey,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect to MySQL:", error);
      _db = null;
    }
  }
  return _db;
}

// =============================================================================
// Local File-Based Data Store (Fallback for Offline / Local Development)
// =============================================================================
const DATA_DIR = path.resolve(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

interface LocalStore {
  users: Array<any>;
  contentItems: Array<any>;
  eventRegistrations: Array<any>;
  contactMessages: Array<any>;
  contactAttachments: Array<any>;
  contactReplies: Array<any>;
  surveys: Array<any>;
  surveyQuestions: Array<any>;
  surveyResponses: Array<any>;
  surveyAnswers: Array<any>;
  counters: {
    users: number;
    contentItems: number;
    eventRegistrations: number;
    contactMessages: number;
    contactAttachments: number;
    contactReplies: number;
    surveys: number;
    surveyQuestions: number;
    surveyResponses: number;
    surveyAnswers: number;
  };
}

function getInitialStore(): LocalStore {
  const now = new Date();
  const past3Days = new Date(now.getTime() - 86400000 * 3);
  const past7Days = new Date(now.getTime() - 86400000 * 7);
  const future14Days = new Date(now.getTime() + 86400000 * 14);

  return {
    users: [
      {
        id: 1,
        openId: "admin",
        name: "مدير الجمعية",
        email: ENV.adminEmail,
        loginMethod: "local",
        role: "admin",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      },
    ],
    contentItems: [
      {
        id: 1,
        type: "news",
        title: "تدشين المبادرة التعاونية لتطوير المدرجات الزراعية",
        summary: "أطلقت الجمعية التعاونية الزراعية للتطوير والاستدامة مبادرة نوعية لدعم المزارعين في تأهيل المدرجات وحصاد مياه الأمطار.",
        body: "تستهدف المبادرة تمكين المزارعين المحليين من تطبيق أفضل الممارسات في الحفاظ على التربة واستصلاح الأراضي الزراعية وفق أعلى معايير الاستدامة البيئية والإنتاجية.",
        imageUrl: "/storage/content-images/news-terraces.jpg",
        documentCategory: null,
        documentYear: null,
        downloadCount: 0,
        status: "published",
        publishedAt: past3Days,
        updatedAt: past3Days,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 2,
        type: "news",
        title: "ورشة عمل متقدمة في الإرشاد الزراعي وإدارة الموارد المائية",
        summary: "نظمت الجمعية لقاءً تدريبيًا بمشاركة نخبة من الخبراء الزراعيين لاستعراض أحدث تقنيات الري الحديث وترشيد استهلاك المياه.",
        body: "شهدت الورشة تفاعلاً واسعاً من مزارعي المنطقة، حيث تم استعراض حلول عملية لرفع كفاءة استهلاك المياه وزيادة الإنتاجية المحصولية مع الحفاظ على التوازن البيئي.",
        imageUrl: "/storage/content-images/news-training.jpg",
        documentCategory: null,
        documentYear: null,
        downloadCount: 0,
        status: "published",
        publishedAt: past7Days,
        updatedAt: past7Days,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 3,
        type: "event",
        title: "الملتقى السنوي الأول للتنمية الزراعية المستدامة",
        summary: "ملتقى يجمع المزارعين والمختصين لتبادل الخبرات واستعراض الفرص الاستثمارية في القطاع الزراعي التعاوني.",
        body: "محاور الملتقى تتناول الابتكار الزراعي، سلاسل الإمداد، والتسويق التعاوني للمنتجات الزراعية المحلية.",
        imageUrl: "/storage/content-images/event-conference.jpg",
        documentCategory: null,
        documentYear: null,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: future14Days,
        eventLocation: "مركز الفعاليات الزراعية - القاعة الرئيسية",
      },
      {
        id: 4,
        type: "achievement",
        title: "تأهيل 150 مزرعة محلية وتطبيق أنظمة الري الذكي",
        summary: "نجحت الجمعية في دعم وتأهيل أكثر من 150 مزرعة لتطبيق تقنيات الري المرشد والزراعة العضوية المستدامة.",
        body: null,
        imageUrl: null,
        documentCategory: null,
        documentYear: null,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 5,
        type: "document",
        title: "تقرير الحوكمة والشفافية لعام 2025",
        summary: "التقرير السنوي الشامل حول تطبيق معايير الحوكمة والامتثال المؤسسي والشفافية المالية في الجمعية.",
        body: null,
        imageUrl: "/storage/governance-documents/report_2025.pdf",
        documentCategory: "governance",
        documentYear: 2025,
        downloadCount: 42,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
    ],
    eventRegistrations: [],
    contactMessages: [],
    contactAttachments: [],
    contactReplies: [],
    surveys: [
      {
        id: 1,
        title: "استبيان قياس احتياجات المزارعين وتطوير الخدمات التعاونية",
        description: "نهدف من خلال هذا الاستبيان إلى معرفة احتياجاتكم وتطوير البرامج والمبادرات الزراعية بما يحقق أهداف التنمية المستدامة.",
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
    ],
    surveyQuestions: [
      {
        id: 1,
        surveyId: 1,
        prompt: "ما نوع النشاط الزراعي الرئيسي في مزرعتكم؟",
        helpText: "يرجى تحديد النشاط الأساسي",
        type: "single_choice",
        optionsJson: JSON.stringify(["محاصيل حقلية وخضروات", "أشجار الفاكهة والنخيل", "زراعة بيوت محمية", "تربية نحل ومواشي"]),
        isRequired: "yes",
        position: 0,
      },
      {
        id: 2,
        surveyId: 1,
        prompt: "كيف تقيمون مستوى خدمات الدعم والإرشاد الزراعي المقدمة؟",
        helpText: "1 يعني غير راضٍ تماماً، و5 يعني راضٍ جداً",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 1,
      },
      {
        id: 3,
        surveyId: 1,
        prompt: "ما هي أبرز المقترحات أو التحديات التي ترغبون في إيصالها لإدارة الجمعية؟",
        helpText: "ملاحظاتكم تسهم في تطوير برامجنا",
        type: "text",
        optionsJson: "[]",
        isRequired: "no",
        position: 2,
      },
    ],
    surveyResponses: [],
    surveyAnswers: [],
    counters: {
      users: 1,
      contentItems: 5,
      eventRegistrations: 0,
      contactMessages: 0,
      contactAttachments: 0,
      contactReplies: 0,
      surveys: 1,
      surveyQuestions: 3,
      surveyResponses: 0,
      surveyAnswers: 0,
    },
  };
}

let _localStore: LocalStore | null = null;

function loadLocalStore(): LocalStore {
  if (_localStore) return _localStore;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      _localStore = JSON.parse(raw);
      // Restore date objects
      _localStore!.contentItems.forEach(item => {
        if (item.publishedAt) item.publishedAt = new Date(item.publishedAt);
        if (item.updatedAt) item.updatedAt = new Date(item.updatedAt);
        if (item.eventStartsAt) item.eventStartsAt = new Date(item.eventStartsAt);
      });
      _localStore!.users.forEach(u => {
        if (u.createdAt) u.createdAt = new Date(u.createdAt);
        if (u.updatedAt) u.updatedAt = new Date(u.updatedAt);
        if (u.lastSignedIn) u.lastSignedIn = new Date(u.lastSignedIn);
      });
      _localStore!.contactMessages.forEach(m => {
        if (m.createdAt) m.createdAt = new Date(m.createdAt);
      });
      _localStore!.contactReplies.forEach(r => {
        if (r.sentAt) r.sentAt = new Date(r.sentAt);
      });
      _localStore!.eventRegistrations.forEach(e => {
        if (e.createdAt) e.createdAt = new Date(e.createdAt);
      });
      return _localStore!;
    } catch {
      _localStore = getInitialStore();
      saveLocalStore();
      return _localStore;
    }
  }

  _localStore = getInitialStore();
  saveLocalStore();
  return _localStore;
}

function saveLocalStore() {
  if (!_localStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(_localStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[Database] Failed to write local store file:", err);
  }
}

// =============================================================================
// Exported Repository Operations (Dual-Mode: MySQL or Local Store)
// =============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (db) {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach(f => {
      const v = user[f];
      if (v !== undefined) {
        values[f] = v;
        updateSet[f] = v;
      }
    });
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === "admin" || user.openId === ENV.adminEmail) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
    return;
  }

  // Local store fallback
  const store = loadLocalStore();
  const existing = store.users.find(u => u.openId === user.openId);
  const now = new Date();
  if (existing) {
    if (user.name !== undefined) existing.name = user.name;
    if (user.email !== undefined) existing.email = user.email;
    if (user.loginMethod !== undefined) existing.loginMethod = user.loginMethod;
    if (user.role !== undefined) existing.role = user.role;
    existing.lastSignedIn = user.lastSignedIn || now;
    existing.updatedAt = now;
  } else {
    store.counters.users += 1;
    store.users.push({
      id: store.counters.users,
      openId: user.openId,
      name: user.name || null,
      email: user.email || null,
      loginMethod: user.loginMethod || "local",
      role: user.role || (user.openId === "admin" ? "admin" : "user"),
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn || now,
    });
  }
  saveLocalStore();
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  }

  const store = loadLocalStore();
  return store.users.find(u => u.openId === openId);
}

export async function listPublishedContent() {
  const db = await getDb();
  if (db) {
    return db
      .select()
      .from(contentItems)
      .where(eq(contentItems.status, "published"))
      .orderBy(desc(contentItems.eventStartsAt), desc(contentItems.publishedAt));
  }

  const store = loadLocalStore();
  return store.contentItems
    .filter(item => item.status === "published")
    .sort((a, b) => {
      const aTime = (a.eventStartsAt || a.publishedAt || new Date(0)).getTime();
      const bTime = (b.eventStartsAt || b.publishedAt || new Date(0)).getTime();
      return bTime - aTime;
    });
}

export async function listAllContent() {
  const db = await getDb();
  if (db) {
    return db.select().from(contentItems).orderBy(desc(contentItems.updatedAt));
  }

  const store = loadLocalStore();
  return [...store.contentItems].sort((a, b) => {
    const aTime = (a.updatedAt || new Date(0)).getTime();
    const bTime = (b.updatedAt || new Date(0)).getTime();
    return bTime - aTime;
  });
}

export async function getPublishedContentById(id: number) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(contentItems).where(eq(contentItems.id, id)).limit(1);
    const item = result[0];
    return item?.status === "published" ? item : undefined;
  }

  const store = loadLocalStore();
  const item = store.contentItems.find(i => i.id === id);
  return item?.status === "published" ? item : undefined;
}

export async function getPublishedEventById(id: number) {
  const item = await getPublishedContentById(id);
  return item?.type === "event" ? item : undefined;
}

export async function getPublishedDocumentById(id: number) {
  const item = await getPublishedContentById(id);
  return item?.type === "document" ? item : undefined;
}

export async function incrementDocumentDownload(id: number) {
  const db = await getDb();
  if (db) {
    await db.update(contentItems).set({ downloadCount: sql`${contentItems.downloadCount} + 1` }).where(eq(contentItems.id, id));
    const result = await db.select({ downloadCount: contentItems.downloadCount }).from(contentItems).where(eq(contentItems.id, id)).limit(1);
    return result[0]?.downloadCount ?? 0;
  }

  const store = loadLocalStore();
  const item = store.contentItems.find(i => i.id === id);
  if (item) {
    item.downloadCount = (item.downloadCount || 0) + 1;
    saveLocalStore();
    return item.downloadCount;
  }
  return 0;
}

export async function createContentItem(item: InsertContentItem) {
  const db = await getDb();
  if (db) {
    const result = await db.insert(contentItems).values(item);
    return Number(result[0].insertId);
  }

  const store = loadLocalStore();
  store.counters.contentItems += 1;
  const now = new Date();
  const newItem = {
    id: store.counters.contentItems,
    ...item,
    downloadCount: item.downloadCount ?? 0,
    publishedAt: now,
    updatedAt: now,
  };
  store.contentItems.unshift(newItem);
  saveLocalStore();
  return newItem.id;
}

export async function updateContentItem(id: number, item: Partial<InsertContentItem>) {
  const db = await getDb();
  if (db) {
    await db.update(contentItems).set(item).where(eq(contentItems.id, id));
    return;
  }

  const store = loadLocalStore();
  const index = store.contentItems.findIndex(i => i.id === id);
  if (index !== -1) {
    store.contentItems[index] = {
      ...store.contentItems[index],
      ...item,
      updatedAt: new Date(),
    };
    saveLocalStore();
  }
}

export async function deleteContentItem(id: number) {
  const db = await getDb();
  if (db) {
    await db.delete(contentItems).where(eq(contentItems.id, id));
    return;
  }

  const store = loadLocalStore();
  store.contentItems = store.contentItems.filter(i => i.id !== id);
  saveLocalStore();
}

export async function createEventRegistration(registration: InsertEventRegistration) {
  const db = await getDb();
  if (db) {
    const result = await db.insert(eventRegistrations).values(registration);
    return Number(result[0].insertId);
  }

  const store = loadLocalStore();
  const exists = store.eventRegistrations.some(
    r => r.eventId === registration.eventId && r.attendeeEmail.toLowerCase() === registration.attendeeEmail.toLowerCase()
  );
  if (exists) {
    const err = new Error("Duplicate registration");
    (err as any).code = "ER_DUP_ENTRY";
    throw err;
  }

  store.counters.eventRegistrations += 1;
  const newReg = {
    id: store.counters.eventRegistrations,
    ...registration,
    createdAt: new Date(),
  };
  store.eventRegistrations.push(newReg);
  saveLocalStore();
  return newReg.id;
}

export async function listEventRegistrations() {
  const db = await getDb();
  if (db) {
    return db.select().from(eventRegistrations).orderBy(desc(eventRegistrations.createdAt));
  }

  const store = loadLocalStore();
  return [...store.eventRegistrations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (db) {
    const result = await db.insert(contactMessages).values(message);
    return Number(result[0].insertId);
  }

  const store = loadLocalStore();
  store.counters.contactMessages += 1;
  const newMsg = {
    id: store.counters.contactMessages,
    ...message,
    status: "new",
    createdAt: new Date(),
  };
  store.contactMessages.unshift(newMsg);
  saveLocalStore();
  return newMsg.id;
}

export async function listContactMessages() {
  const db = await getDb();
  if (db) {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  const store = loadLocalStore();
  return [...store.contactMessages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getContactMessageById(id: number) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  const store = loadLocalStore();
  return store.contactMessages.find(m => m.id === id);
}

export async function markContactMessageRead(id: number) {
  const db = await getDb();
  if (db) {
    await db.update(contactMessages).set({ status: "read" }).where(eq(contactMessages.id, id));
    return;
  }

  const store = loadLocalStore();
  const msg = store.contactMessages.find(m => m.id === id);
  if (msg && msg.status === "new") {
    msg.status = "read";
    saveLocalStore();
  }
}

export async function listContactReplies() {
  const db = await getDb();
  if (db) {
    return db.select().from(contactReplies).orderBy(desc(contactReplies.sentAt));
  }

  const store = loadLocalStore();
  return [...store.contactReplies].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
}

export async function createContactReply(reply: InsertContactReply) {
  const db = await getDb();
  if (db) {
    const result = await db.insert(contactReplies).values(reply);
    return Number(result[0].insertId);
  }

  const store = loadLocalStore();
  store.counters.contactReplies += 1;
  const newReply = {
    id: store.counters.contactReplies,
    ...reply,
    sentAt: new Date(),
  };
  store.contactReplies.unshift(newReply);
  saveLocalStore();
  return newReply.id;
}

export async function markContactMessageReplied(id: number) {
  const db = await getDb();
  if (db) {
    await db.update(contactMessages).set({ status: "replied" }).where(eq(contactMessages.id, id));
    return;
  }

  const store = loadLocalStore();
  const msg = store.contactMessages.find(m => m.id === id);
  if (msg) {
    msg.status = "replied";
    saveLocalStore();
  }
}

export async function createContactAttachment(attachment: InsertContactAttachment) {
  const db = await getDb();
  if (db) {
    const result = await db.insert(contactAttachments).values(attachment);
    return Number(result[0].insertId);
  }

  const store = loadLocalStore();
  store.counters.contactAttachments += 1;
  const newAtt = {
    id: store.counters.contactAttachments,
    ...attachment,
    uploadedAt: new Date(),
  };
  store.contactAttachments.push(newAtt);
  saveLocalStore();
  return newAtt.id;
}

export async function listContactAttachments() {
  const db = await getDb();
  if (db) {
    return db.select().from(contactAttachments).orderBy(desc(contactAttachments.uploadedAt));
  }

  const store = loadLocalStore();
  return [...store.contactAttachments].sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

export type SurveyQuestionDraft = {
  prompt: string;
  helpText: string | null;
  type: "single_choice" | "rating" | "text";
  optionsJson: string | null;
  isRequired: "yes" | "no";
  position: number;
};

export async function listSurveysForAdmin() {
  const db = await getDb();
  if (db) {
    return db.select().from(surveys).orderBy(desc(surveys.updatedAt));
  }

  const store = loadLocalStore();
  return [...store.surveys].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getPublishedSurvey() {
  const db = await getDb();
  if (db) {
    const [survey] = await db.select().from(surveys).where(eq(surveys.status, "published")).orderBy(desc(surveys.updatedAt)).limit(1);
    if (!survey) return undefined;
    const questions = await db.select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, survey.id)).orderBy(asc(surveyQuestions.position));
    return { survey, questions };
  }

  const store = loadLocalStore();
  const survey = store.surveys.find(s => s.status === "published");
  if (!survey) return undefined;
  const questions = store.surveyQuestions
    .filter(q => q.surveyId === survey.id)
    .sort((a, b) => a.position - b.position);
  return { survey, questions };
}

export async function getSurveyForAdmin(surveyId: number) {
  const db = await getDb();
  if (db) {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
    if (!survey) return undefined;
    const questions = await db.select().from(surveyQuestions).where(eq(surveyQuestions.surveyId, surveyId)).orderBy(asc(surveyQuestions.position));
    return { survey, questions };
  }

  const store = loadLocalStore();
  const survey = store.surveys.find(s => s.id === surveyId);
  if (!survey) return undefined;
  const questions = store.surveyQuestions
    .filter(q => q.surveyId === surveyId)
    .sort((a, b) => a.position - b.position);
  return { survey, questions };
}

export async function getSurveyResults(surveyId: number) {
  const db = await getDb();
  if (db) {
    const responses = await db.select().from(surveyResponses).where(eq(surveyResponses.surveyId, surveyId)).orderBy(desc(surveyResponses.submittedAt));
    if (!responses.length) return { responses, answers: [] };
    const answers = await db.select().from(surveyAnswers).where(inArray(surveyAnswers.responseId, responses.map(response => response.id))).orderBy(desc(surveyAnswers.id));
    return { responses, answers };
  }

  const store = loadLocalStore();
  const responses = store.surveyResponses
    .filter(r => r.surveyId === surveyId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const responseIds = new Set(responses.map(r => r.id));
  const answers = store.surveyAnswers.filter(a => responseIds.has(a.responseId));
  return { responses, answers };
}

export async function createSurveyWithQuestions(
  survey: Pick<InsertSurvey, "title" | "description" | "status">,
  questions: SurveyQuestionDraft[]
) {
  const db = await getDb();
  if (db) {
    return db.transaction(async tx => {
      if (survey.status === "published") {
        await tx.update(surveys).set({ status: "draft" }).where(eq(surveys.status, "published"));
      }
      const result = await tx.insert(surveys).values(survey);
      const surveyId = Number(result[0].insertId);
      if (questions.length) {
        await tx.insert(surveyQuestions).values(questions.map(question => ({ ...question, surveyId })));
      }
      return surveyId;
    });
  }

  const store = loadLocalStore();
  const now = new Date();
  if (survey.status === "published") {
    store.surveys.forEach(s => {
      if (s.status === "published") s.status = "draft";
    });
  }
  store.counters.surveys += 1;
  const surveyId = store.counters.surveys;
  store.surveys.unshift({
    id: surveyId,
    ...survey,
    createdAt: now,
    updatedAt: now,
  });

  questions.forEach(q => {
    store.counters.surveyQuestions += 1;
    store.surveyQuestions.push({
      id: store.counters.surveyQuestions,
      ...q,
      surveyId,
    });
  });

  saveLocalStore();
  return surveyId;
}

export async function updateSurveyWithQuestions(
  surveyId: number,
  survey: Pick<InsertSurvey, "title" | "description" | "status">,
  questions: SurveyQuestionDraft[]
) {
  const db = await getDb();
  if (db) {
    return db.transaction(async tx => {
      if (survey.status === "published") {
        await tx.update(surveys).set({ status: "draft" }).where(eq(surveys.status, "published"));
      }
      await tx.update(surveys).set(survey).where(eq(surveys.id, surveyId));
      await tx.delete(surveyQuestions).where(eq(surveyQuestions.surveyId, surveyId));
      if (questions.length) {
        await tx.insert(surveyQuestions).values(questions.map(question => ({ ...question, surveyId })));
      }
    });
  }

  const store = loadLocalStore();
  const now = new Date();
  if (survey.status === "published") {
    store.surveys.forEach(s => {
      if (s.id !== surveyId && s.status === "published") s.status = "draft";
    });
  }
  const existing = store.surveys.find(s => s.id === surveyId);
  if (existing) {
    Object.assign(existing, survey, { updatedAt: now });
  }

  store.surveyQuestions = store.surveyQuestions.filter(q => q.surveyId !== surveyId);
  questions.forEach(q => {
    store.counters.surveyQuestions += 1;
    store.surveyQuestions.push({
      id: store.counters.surveyQuestions,
      ...q,
      surveyId,
    });
  });

  saveLocalStore();
}

export async function deleteSurvey(surveyId: number) {
  const db = await getDb();
  if (db) {
    await db.delete(surveys).where(eq(surveys.id, surveyId));
    return;
  }

  const store = loadLocalStore();
  store.surveys = store.surveys.filter(s => s.id !== surveyId);
  store.surveyQuestions = store.surveyQuestions.filter(q => q.surveyId !== surveyId);
  saveLocalStore();
}

export async function createSurveyResponse(
  surveyId: number,
  respondentTokenHash: string,
  answers: Array<{ questionId: number; value: string }>
) {
  const db = await getDb();
  if (db) {
    return db.transaction(async tx => {
      const result = await tx.insert(surveyResponses).values({ surveyId, respondentTokenHash });
      const responseId = Number(result[0].insertId);
      if (answers.length) {
        await tx.insert(surveyAnswers).values(answers.map(answer => ({ ...answer, responseId })));
      }
      return responseId;
    });
  }

  const store = loadLocalStore();
  const alreadyAnswered = store.surveyResponses.some(
    r => r.surveyId === surveyId && r.respondentTokenHash === respondentTokenHash
  );
  if (alreadyAnswered) {
    const error = new Error("Duplicate survey response");
    (error as any).code = "ER_DUP_ENTRY";
    throw error;
  }

  store.counters.surveyResponses += 1;
  const responseId = store.counters.surveyResponses;
  store.surveyResponses.push({
    id: responseId,
    surveyId,
    respondentTokenHash,
    submittedAt: new Date(),
  });

  answers.forEach(a => {
    store.counters.surveyAnswers += 1;
    store.surveyAnswers.push({
      id: store.counters.surveyAnswers,
      responseId,
      questionId: a.questionId,
      value: a.value,
    });
  });

  saveLocalStore();
  return responseId;
}
