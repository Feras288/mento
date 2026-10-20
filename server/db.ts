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
        title: "الخطة الاستراتيجية للجمعية التعاونية الزراعية (2026 - 2031م)",
        summary: "الخطة الاستراتيجية الخمسية للجمعية التعاونية الزراعية للتطوير والاستدامة (2026 - 2031م)، تحدد الرؤية المستقبلية والرسالة والأهداف الاستراتيجية ومؤشرات الأداء ومسارات التنمية الزراعية المستدامة.",
        body: "رمز الوثيقة: ACSD-STRAT-2026 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ الاعتماد: 2026م. تتضمن الخطة: التوجهات الاستراتيجية، المبادرات التنموية، مستهدفات تمكين المزارعين، وتطوير سلاسل القيمة الزراعية.",
        imageUrl: "/storage/governance-documents/acsd-strategic-plan-2026-2031.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 6,
        type: "document",
        title: "الملف التعريفي الرسمي للجمعية (ACSD Profile)",
        summary: "ملف تعريفي شامل يوضح مسيرة الجمعية التعاونية الزراعية للتطوير والاستدامة، رسالتها، خدماتها للمزارعين، وأبرز الإنجازات والمبادرات الزراعية المنفذة.",
        body: "رمز الوثيقة: ACSD-PRF-001 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. يتضمن: نبذة عن التأسيس، الهيكل التنظيمي، الأنشطة والبرامج الميدانية، والتحالفات الاستراتيجية.",
        imageUrl: "/storage/governance-documents/acsd-institutional-profile.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 7,
        type: "document",
        title: "ملف الجمعية المؤسسي والاستثماري (ACSD Investment Portfolio)",
        summary: "ملف استثماري مؤسسي متقدم يعرض الفرص الاستثمارية في القطاع الزراعي التعاوني، المزايا التنافسية، الشراكات الاستراتيجية، ونماذج العوائد التنموية للمستثمرين.",
        body: "رمز الوثيقة: ACSD-INV-001 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. يتضمن: الفرص الاستثمارية الزراعية، سلاسل الإمداد، مشروعات التأهيل، ودراسات الجدوى المبدئية.",
        imageUrl: "/storage/governance-documents/acsd-institutional-investment-portfolio.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 8,
        type: "document",
        title: "دليل الحوكمة المؤسسية الشامل (ACSD-MAN-001)",
        summary: "المرجع التأسيسي الشامل لحوكمة الجمعية التعاونية الزراعية للتطوير والاستدامة، يحدد هياكل الحوكمة، مسؤوليات الجمعية العمومية ومجلس الإدارة، مصفوفة الصلاحيات وقواعد الإفصاح والشفافية.",
        body: "رمز الوثيقة: ACSD-MAN-001 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. يتضمن: الهيكل التنظيمي للحوكمة، لجان المجلس، مهام الإدارة التنفيذية، وقواعد الإشراف والرقابة المؤسسية.",
        imageUrl: "/storage/governance-documents/acsd-man-001-governance-manual.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 9,
        type: "document",
        title: "دليل الإدارة والضوابط المالية (ACSD-MAN-002)",
        summary: "الدليل المنظم لكافة المعاملات المالية والمحاسبية، إدارة الخزينة والحسابات البنكية، المشتريات والمناقصات، والرقابة الداخلية على الأصول والتدقيق المحاسبي المعتمد.",
        body: "رمز الوثيقة: ACSD-MAN-002 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. يتضمن: الدورات المستندية، صلاحيات التوقيع المالي، إجراءات الصرف، والرقابة المالية الوقائية.",
        imageUrl: "/storage/governance-documents/acsd-man-002-financial-controls-manual.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 10,
        type: "document",
        title: "لائحة الموارد البشرية المنظمة للعمل (ACSD-MAN-003)",
        summary: "اللائحة المعتمدة لتنظيم شؤون الموظفين والعاملين بالجمعية، وتحديد الحقوق والواجبات، سياسات الاستقطاب والتعيين، تقييم الأداء، سلم الرواتب والمزايا، وقواعد الانضباط والترقيات.",
        body: "رمز الوثيقة: ACSD-MAN-003 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: بنود نظام العمل ولوائح القطاع غير الربحي، الإجازات، والتدريب والتطوير الوظيفي المستمر.",
        imageUrl: "/storage/governance-documents/acsd-man-003-human-resources-bylaws.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 11,
        type: "document",
        title: "سياسة تعارض المصالح (ACSD-POL-001)",
        summary: "وضع قواعد وضوابط محددة لتحديد حالات تعارض المصالح الفعلية أو المحتملة لأعضاء مجلس الإدارة والإدارة التنفيذية والعاملين، وكيفية الإفصاح الدوري عنها وإدارتها بحيادية ونزاهة.",
        body: "رمز الوثيقة: ACSD-POL-001 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: التزامات الإفصاح السنوي واللحظي، سجل الإفصاحات، وقواعد الامتناع عن التصويت عند وجود مصلحة.",
        imageUrl: "/storage/governance-documents/acsd-pol-001-conflict-of-interest.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 12,
        type: "document",
        title: "سياسة السلوك المهني وأخلاقيات العمل (ACSD-POL-002)",
        summary: "تحدد المعايير السلوكية والأخلاقية الرفيعة وقواعد الأمانة والمهنية الواجب الالتزام بها من كافة ممثلي الجمعية لترسيخ بيئة تعاونية موثوقة ونزيهة.",
        body: "رمز الوثيقة: ACSD-POL-002 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: واجبات النزاهة، احترام الزملاء والمستفيدين، الحفاظ على ممتلكات الجمعية، والتعامل العادل.",
        imageUrl: "/storage/governance-documents/acsd-pol-002-code-of-conduct.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 13,
        type: "document",
        title: "سياسة مكافحة الاحتيال والفساد (ACSD-POL-003)",
        summary: "إطار وقائي ورقابي استباقي لمنع واكتشاف والتصدي لأي ممارسات احتيال أو فساد مالي أو إداري، وضمان التحقيق الفوري ومساءلة المتجاوزين وحماية أصول الجمعية.",
        body: "رمز الوثيقة: ACSD-POL-003 | الإصدار: V1.0 | التصنيف: مقيد - RES | تاريخ السريان: 2026م. تتضمن: تعريفات الاحتيال، آليات التبليغ والتحقيق المستقل، والتنسيق مع الجهات القضائية والرقابية.",
        imageUrl: "/storage/governance-documents/acsd-pol-003-anti-fraud-corruption.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 14,
        type: "document",
        title: "سياسة الإبلاغ عن المخالفات وحماية المبلغين (ACSD-POL-004)",
        summary: "تنظيم إجراءات وقنوات الإبلاغ الآمن عن التجاوزات أو الانتهاكات مع منح الحماية القانونية والسرية التامة للمبلّغين ضد أي أضرار أو تصرفات انتقامية.",
        body: "رمز الوثيقة: ACSD-POL-004 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: قنوات الإبلاغ المباشرة، لجان المراجعة والتحقيق، وسرية معلومات المبلغ وسلامته الوظيفية.",
        imageUrl: "/storage/governance-documents/acsd-pol-004-whistleblower-protection.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 15,
        type: "document",
        title: "سياسة الهدايا والضيافة والمزايا (ACSD-POL-005)",
        summary: "وضع معايير وضوابط محددة لقبول أو تقديم الهدايا والضيافة والمزايا العينية والنقدية، لضمان استقلالية القرارات المؤسسية ومنع أي شبهة استمالة أو محاباة.",
        body: "رمز الوثيقة: ACSD-POL-005 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: سقف الهدايا الرمزية المسموحة، إجراءات التسجيل في سجل الهدايا، وآليات التصرف بها لصالح الجمعية.",
        imageUrl: "/storage/governance-documents/acsd-pol-005-gifts-hospitality.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 16,
        type: "document",
        title: "سياسة حماية البيانات وسرية المعلومات (ACSD-POL-006)",
        summary: "إرساء منظومة حماية البيانات الشخصية للمزارعين والمساهمين والموظفين، وضمان سرية السجلات والوثائق الرقمية وفق نظام حماية البيانات الشخصية السعودي (PDPL).",
        body: "رمز الوثيقة: ACSD-POL-006 | الإصدار: V1.0 | التصنيف: مقيد - RES | تاريخ السريان: 2026م. تتضمن: تصنيف البيانات، حقوق أصحاب البيانات، إجراءات التشفير، وبروتوكولات الإبلاغ عن التسريبات.",
        imageUrl: "/storage/governance-documents/acsd-pol-006-data-protection-privacy.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 17,
        type: "document",
        title: "سياسة إدارة الوثائق والسجلات (ACSD-POL-007)",
        summary: "تنظيم دورة حياة الوثائق والسجلات المؤسسية منذ إنشائها، تصنيفها، أرشفتها الورقية والإلكترونية، وحتى إتلافها الآمن وفق مدد الحفظ النظامية المعتمدة.",
        body: "رمز الوثيقة: ACSD-POL-007 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: معايير الأرشفة، صلاحيات الاطلاع، جداول مدد الاستبقاء، وإجراءات النسخ الاحتياطي.",
        imageUrl: "/storage/governance-documents/acsd-pol-007-document-records-management.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 18,
        type: "document",
        title: "سياسة إدارة المخاطر (ACSD-POL-008)",
        summary: "إطار متكامل لتحديد وتحليل وتقييم المخاطر التشغيلية والمالية والبيئية والاستراتيجية، وتحديد مستويات التقبل وخطط الاستجابة والمعالجة للحد من آثارها السلبية.",
        body: "رمز الوثيقة: ACSD-POL-008 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: مصفوفة تقييم المخاطر، سجل المخاطر العام، ودور لجنة المراجعة والمخاطر في المتابعة.",
        imageUrl: "/storage/governance-documents/acsd-pol-008-risk-management.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 19,
        type: "document",
        title: "سياسة الرقابة الداخلية (ACSD-POL-009)",
        summary: "بناء وتطبيق نظام رقابة داخلية فعال يضمن حماية أصول الجمعية، دقة السجلات والقوائم المالية، وفاعلية العمليات الميدانية والتشغيلية وفق المعايير المحاسبية.",
        body: "رمز الوثيقة: ACSD-POL-009 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: آليات المراجعة الدورية، الفصل بين الصلاحيات، والتقارير الرقابية المرفوعة لمجلس الإدارة.",
        imageUrl: "/storage/governance-documents/acsd-pol-009-internal-control.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 20,
        type: "document",
        title: "سياسة الامتثال والالتزام (ACSD-POL-010)",
        summary: "ترسيخ ثقافة الامتثال التام لكافة القوانين واللوائح التنظيمية الصادرة عن الجهات الحكومية المشرفة، ومواءمة سياسات الجمعية الداخلية مع متطلبات الحوكمة الرسمية.",
        body: "رمز الوثيقة: ACSD-POL-010 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: مصفوفة الالتزامات النظامية، برامج التوعية والتدريب، والتقييم السنوي لمستوى الالتزام.",
        imageUrl: "/storage/governance-documents/acsd-pol-010-compliance.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 21,
        type: "document",
        title: "سياسة استمرارية الأعمال (ACSD-POL-011)",
        summary: "السياسة الحاكمة لضمان صمود الجمعية وقدرتها على استئناف العمليات الزراعية والخدمية الحرجة عند حدوث أي أزمات أو طوارئ تشغيلية دون انقطاع ممتد.",
        body: "رمز الوثيقة: ACSD-POL-011 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: تحديد الأولويات الحيوية، اشتراطات التعافي، وربط السياسة بالإجراء التشغيلي ACSD-SOP-BCM-001.",
        imageUrl: "/storage/governance-documents/acsd-pol-011-business-continuity.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 22,
        type: "document",
        title: "سياسة إدارة الأزمات والطوارئ (ACSD-POL-012)",
        summary: "تحديد آليات تشكيل قيادة فريق إدارة الأزمات، بروتوكولات الإخلاء والسلامة المهنية، والتواصل مع الجهات الرسمية لضمان سلامة الأرواح وحماية المزارع والممتلكات.",
        body: "رمز الوثيقة: ACSD-POL-012 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: خطط الإخلاء، قنوات الاتصال الطارئة، وتوزيع المهام الميدانية أثناء الكوارث الطبيعية أو الحوادث.",
        imageUrl: "/storage/governance-documents/acsd-pol-012-crisis-emergency-management.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 23,
        type: "document",
        title: "سياسة مكافحة غسل الأموال وتمويل الإرهاب (ACSD-POL-013)",
        summary: "تطبيق أعلى معايير العناية الواجبة والتحقق من مصادر الأموال والتعاملات المالية والتبرعات للوقاية من مخاطر غسل الأموال ومكافحة تمويل الإرهاب وفق الأنظمة الوطنية.",
        body: "رمز الوثيقة: ACSD-POL-013 | الإصدار: V1.0 | التصنيف: مقيد - RES | تاريخ السريان: 2026م. تتضمن: إجراءات اعرف عميلك (KYC)، مراقبة التحويلات البنكية، والإبلاغ عن العمليات المشبوهة.",
        imageUrl: "/storage/governance-documents/acsd-pol-013-aml-cft.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 24,
        type: "document",
        title: "سياسة قبول الهبات والتبرعات (ACSD-POL-014)",
        summary: "تنظيم شروط وضوابط قبول وتوثيق الهبات والتبرعات النقدية والعينية والمنح الوقفية، والتأكد من توافقها التام مع أهداف الجمعية ومبادئ الشفافية والمساءلة.",
        body: "رمز الوثيقة: ACSD-POL-014 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: معايير قبول المنح المشروطة وغير المشروطة، إصدار السندات الرسمية، وتخصيص أموال التبرعات.",
        imageUrl: "/storage/governance-documents/acsd-pol-014-donations-grants.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 25,
        type: "document",
        title: "سياسة تنظيم العلاقة مع أعضاء الجمعية العمومية وتقديم الخدمات (ACSD-POL-015)",
        summary: "تحديد آليات التواصل مع أعضاء الجمعية العمومية والمساهمين، وضمان حقهم في المشاركة والتصويت والحصول على الخدمات الزراعية والتعاونية بعدالة ومساواة.",
        body: "رمز الوثيقة: ACSD-POL-015 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: حقوق المساهمين، إجراءات توجيه الدعوات لاجتماعات الجمعية، ومعايير توزيع العوائد والخدمات.",
        imageUrl: "/storage/governance-documents/acsd-pol-015-general-assembly-relations.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 26,
        type: "document",
        title: "سياسة المكافآت والامتيازات (ACSD-POL-016)",
        summary: "وضع معايير وضوابط موضوعية لمنح المكافآت والبدلات والمزايا لأعضاء مجلس الإدارة واللجان المنبثقة والإدارة التنفيذية بما يحفز الأداء ويعزز المسؤولية.",
        body: "رمز الوثيقة: ACSD-POL-016 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: حدود المكافآت السنوية، بدلات حضور الجلسات، ومعايير ربط المكافأة بالأداء والإنجاز الفعلي.",
        imageUrl: "/storage/governance-documents/acsd-pol-016-rewards-privileges.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 27,
        type: "document",
        title: "سياسة الصرف للبرامج والأنشطة (ACSD-POL-017)",
        summary: "حوكمة الصرف المالي لمشروعات ومبادرات الجمعية، وتحديد مستويات التفويض والاعتماد المالي لكل برنامج ومطابقة بنود الصرف مع الخطط المعتمدة.",
        body: "رمز الوثيقة: ACSD-POL-017 | الإصدار: V1.0 | التصنيف: داخلي - INT | تاريخ السريان: 2026م. تتضمن: مصفوفة تفويض الصلاحيات المالية، شروط صرف السلف المؤقتة، والتقارير الختامية للمشاريع.",
        imageUrl: "/storage/governance-documents/acsd-pol-017-expenditure-programs.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 28,
        type: "document",
        title: "سياسة الاستثمار وتنمية العوائد (ACSD-POL-018)",
        summary: "تحديد المبادئ الاستثمارية والأوعية المعتمدة لاستثمار فوائض أموال الجمعية لضمان تنمية الموارد الذاتية وتحقيق عوائد مالية مستقرة مع تقليل المخاطر.",
        body: "رمز الوثيقة: ACSD-POL-018 | الإصدار: V1.0 | التصنيف: عام - PUB | تاريخ السريان: 2026م. تتضمن: استراتيجيات المحافظ الاستثمارية، حظر المضاربات عالية المخاطر، ودور لجنة الاستثمار.",
        imageUrl: "/storage/governance-documents/acsd-pol-018-investment.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 29,
        type: "document",
        title: "إجراء الإفصاحات والنزاهة والبلاغات والامتثال (ACSD-SOP-COM-001)",
        summary: "إجراء تشغيلي معياري موحد (SOP) لاستقبال وتقييم وإحالة ومعالجة ومتابعة وإغلاق الإفصاحات والبلاغات المتعلقة بتعارض المصالح، الهدايا، والمخالفات وسلوك المهنة.",
        body: "رمز الوثيقة: ACSD-SOP-COM-001 | الإصدار: V1.0 | التصنيف: مقيد - RES | مالك الإجراء: الإدارة التنفيذية | تاريخ السريان: 13 / 09 / 2026م | السياسات المرجعية: ACSD-POL-001 إلى ACSD-POL-005 | النماذج المرتبطة: ACSD-FRM-COM-001 إلى ACSD-FRM-COM-004.",
        imageUrl: "/storage/governance-documents/acsd-sop-com-001-integrity-compliance.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 30,
        type: "document",
        title: "إجراء استمرارية الأعمال وإدارة الحوادث والأزمات (ACSD-SOP-BCM-001)",
        summary: "إجراء تشغيلي معياري موحد (SOP) لتعزيز قدرة الجمعية على مواصلة عملياتها وخدماتها ذات الأولوية أثناء الأزمات والتعطل وتحليل أثر الأعمال BIA وإدارة خطط الاستجابة والتعافي.",
        body: "رمز الوثيقة: ACSD-SOP-BCM-001 | الإصدار: V1.0 | التصنيف: داخلي - INT | مالك الإجراء: الإدارة التنفيذية | تاريخ السريان: 13 / 09 / 2026م | السياسة المرجعية: ACSD-POL-011 | النموذج المرتبط: ACSD-FRM-BCM-001.",
        imageUrl: "/storage/governance-documents/acsd-sop-bcm-001-business-continuity.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 31,
        type: "document",
        title: "إجراء إدارة الوثائق والسجلات وضبط الإصدارات (ACSD-SOP-GOV-001)",
        summary: "إجراء تشغيلي معياري (SOP) يحدد خطوات ترميز وتدقيق ومراجعة واعتماد وتعميم وثائق الحوكمة، وإدارة مصفوفة ضبط التغييرات وسجلات الأرشفة والإتلاف المنظم.",
        body: "رمز الوثيقة: ACSD-SOP-GOV-001 | الإصدار: V1.0 | التصنيف: داخلي - INT | مالك الإجراء: إدارة الحوكمة | تاريخ السريان: 13 / 09 / 2026م | السياسة المرجعية: ACSD-POL-007 | النماذج: ACSD-FRM-GOV-001 إلى 003.",
        imageUrl: "/storage/governance-documents/acsd-sop-gov-001-document-records-control.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        eventStartsAt: null,
        eventLocation: null,
      },
      {
        id: 32,
        type: "document",
        title: "إجراء إدارة المخاطر والرقابة والمتابعة (ACSD-SOP-RSK-001)",
        summary: "إجراء تشغيلي معياري (SOP) لتطبيق خطوات التقييم الدوري للمخاطر التشغيلية والمالية، تسجيلها في مصفوفة المخاطر، وتنفيذ الضوابط الرقابية الوقائية ورفع تقارير الرقابة.",
        body: "رمز الوثيقة: ACSD-SOP-RSK-001 | الإصدار: V1.0 | التصنيف: داخلي - INT | مالك الإجراء: إدارة المخاطر والمراجعة الداخلية | تاريخ السريان: 13 / 09 / 2026م | السياسات المرجعية: ACSD-POL-008 و ACSD-POL-009.",
        imageUrl: "/storage/governance-documents/acsd-sop-rsk-001-risk-monitoring-control.pdf",
        documentCategory: "governance",
        documentYear: 2026,
        downloadCount: 0,
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
        title: "استبيان قياس رضا المستفيدين وأصحاب العلاقة",
        description: "تحرص الجمعية التعاونية الزراعية للتطوير والاستدامة على تطوير خدماتها وتحسين تجربة المستفيدين وأعضاء الجمعية والشركاء. نأمل تخصيص دقيقة واحدة للإجابة على هذا الاستبيان، وتُستخدم النتائج لأغراض التحسين والتطوير المؤسسي.",
        status: "published",
        createdAt: now,
        updatedAt: now,
      },
    ],
    surveyQuestions: [
      {
        id: 1,
        surveyId: 1,
        prompt: "صفتك بالنسبة للجمعية:",
        helpText: "أولاً: بيانات عامة",
        type: "single_choice",
        optionsJson: JSON.stringify(["عضو / مساهم", "مستفيد", "عميل", "شريك أو جهة متعاونة", "زائر", "مورد / مقدم خدمة", "أخرى (يرجى التحديد)"]),
        isRequired: "yes",
        position: 0,
      },
      {
        id: 2,
        surveyId: 1,
        prompt: "ما الغرض الرئيسي من تواصلك مع الجمعية؟",
        helpText: "أولاً: بيانات عامة",
        type: "single_choice",
        optionsJson: JSON.stringify(["الحصول على خدمة", "استفسار", "عضوية / مساهمة", "شراكة أو تعاون", "مشروع / استثمار", "شكوى أو مقترح", "أخرى"]),
        isRequired: "yes",
        position: 1,
      },
      {
        id: 3,
        surveyId: 1,
        prompt: "سهولة التواصل مع الجمعية والوصول إلى الجهة المختصة.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 2,
      },
      {
        id: 4,
        surveyId: 1,
        prompt: "سرعة الاستجابة للاستفسارات والطلبات.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 3,
      },
      {
        id: 5,
        surveyId: 1,
        prompt: "وضوح المعلومات والإجراءات المطلوبة للحصول على الخدمة.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 4,
      },
      {
        id: 6,
        surveyId: 1,
        prompt: "جودة الخدمة أو التعامل المقدم من الجمعية.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 5,
      },
      {
        id: 7,
        surveyId: 1,
        prompt: "مستوى الشفافية والوضوح في التعامل.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 6,
      },
      {
        id: 8,
        surveyId: 1,
        prompt: "مدى اهتمام الجمعية بالمقترحات والشكاوى وملاحظات أصحاب العلاقة.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 7,
      },
      {
        id: 9,
        surveyId: 1,
        prompt: "سهولة الوصول إلى المعلومات من خلال الموقع الإلكتروني والقنوات الرقمية.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 8,
      },
      {
        id: 10,
        surveyId: 1,
        prompt: "تقييمك العام لتجربتك مع الجمعية.",
        helpText: "ثانياً: قياس مستوى الرضا",
        type: "rating",
        optionsJson: "[]",
        isRequired: "yes",
        position: 9,
      },
      {
        id: 11,
        surveyId: 1,
        prompt: "ما مدى احتمال أن توصي بالتعامل أو التعاون مع الجمعية؟",
        helpText: "ثالثاً: التوصية والتطوير",
        type: "single_choice",
        optionsJson: JSON.stringify(["بالتأكيد", "غالباً", "ربما", "غير مرجح", "لا أوصي"]),
        isRequired: "yes",
        position: 10,
      },
      {
        id: 12,
        surveyId: 1,
        prompt: "ما الجانب الذي ترى أنه يحتاج إلى تحسين؟",
        helpText: "اكتب رأيك هنا ...",
        type: "text",
        optionsJson: "[]",
        isRequired: "no",
        position: 11,
      },
      {
        id: 13,
        surveyId: 1,
        prompt: "هل لديك مقترح أو ملاحظة إضافية؟",
        helpText: "اكتب مقترحك أو ملاحظتك هنا ...",
        type: "text",
        optionsJson: "[]",
        isRequired: "no",
        position: 12,
      },
      {
        id: 14,
        surveyId: 1,
        prompt: "هل ترغب في أن تتواصل معك الجمعية بخصوص ملاحظتك؟",
        helpText: "رابعاً: التواصل الاختياري",
        type: "single_choice",
        optionsJson: JSON.stringify(["نعم", "لا"]),
        isRequired: "yes",
        position: 13,
      },
      {
        id: 15,
        surveyId: 1,
        prompt: "بيانات التواصل (في حال اختيار نعم):",
        helpText: "الاسم، رقم الجوال، البريد الإلكتروني (اختياري)",
        type: "text",
        optionsJson: "[]",
        isRequired: "no",
        position: 14,
      },
    ],
    surveyResponses: [],
    surveyAnswers: [],
    counters: {
      users: 1,
      contentItems: 7,
      eventRegistrations: 0,
      contactMessages: 0,
      contactAttachments: 0,
      contactReplies: 0,
      surveys: 1,
      surveyQuestions: 15,
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
