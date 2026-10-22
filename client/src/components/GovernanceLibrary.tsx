import { FALLBACK_GOVERNANCE_DOCS } from "@/data/governanceDocumentsFallback";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileBarChart2,
  FileCheck2,
  FileText,
  Filter,
  Info,
  Layers,
  Loader2,
  Maximize2,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const NEW_DOCUMENT_WINDOW_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export interface PreviewDocument {
  id: number;
  title: string;
  url: string;
  year?: number | null;
  summary?: string | null;
  body?: string | null;
  documentCategory?: "governance" | "annual_report" | null;
}

interface DocumentMeta {
  code: string;
  classification: {
    label: string;
    tag: "restricted" | "internal" | "public";
    badgeClass: string;
    description: string;
  };
  categoryGroup: "manual" | "policy" | "sop" | "strategy" | "annual_report";
  typeLabel: string;
  version: string;
  effectiveDate: string;
  pages: number;
  isSop: boolean;
  referencePolicy?: string;
  relatedForms?: string;
  operationalTracks?: string[];
  sectionsOutline?: { title: string; subtitle: string; page: number }[];
}

const DOCUMENTS_METADATA_REGISTRY: Record<
  string,
  {
    code: string;
    categoryGroup: "manual" | "policy" | "sop" | "strategy" | "annual_report";
    typeLabel: string;
    version: string;
    effectiveDate: string;
    pages: number;
    isSop: boolean;
    referencePolicy: string;
    relatedForms: string;
    operationalTracks: string[];
    sectionsOutline: { title: string; subtitle: string; page: number }[];
  }
> = {
  // --- SOPs (4 Procedures) ---
  "ACSD-SOP-COM-001": {
    code: "ACSD-SOP-COM-001",
    categoryGroup: "sop",
    typeLabel: "إجراء تشغيلي معياري (SOP)",
    version: "V1.0",
    effectiveDate: "13 / 09 / 2026م",
    pages: 4,
    isSop: true,
    referencePolicy: "ACSD-POL-001 إلى ACSD-POL-005",
    relatedForms: "ACSD-FRM-COM-001 إلى ACSD-FRM-COM-004",
    operationalTracks: [
      "تعارض المصالح (COM-001)",
      "الالتزام والسلوك المهني (COM-002)",
      "البلاغات والمخالفات (COM-003)",
      "الهدايا والضيافة والمزايا (COM-004)",
    ],
    sectionsOutline: [
      { title: "بيانات ضبط الوثيقة والغرض والنطاق", subtitle: "المسارات التشغيلية ومصفوفة السياسات المرجعية", page: 1 },
      { title: "الأدوار والمسؤوليات ومسارات الإفصاح", subtitle: "مسار تعارض المصالح ومسار الهدايا والضيافة والتسجيل والحفظ", page: 2 },
      { title: "البلاغات والمخالفات ومعالجة الاشتباه", subtitle: "السرية وحماية المبلغ، التقييم الأولي، الإحالة وشروط الإغلاق", page: 3 },
      { title: "الالتزام والرقابة والمتابعة والإغلاق", subtitle: "الإجراءات التصحيحية، إدارة السجلات، ودورة الإجراء المتكاملة", page: 4 },
    ],
  },
  "ACSD-SOP-BCM-001": {
    code: "ACSD-SOP-BCM-001",
    categoryGroup: "sop",
    typeLabel: "إجراء تشغيلي معياري (SOP)",
    version: "V1.0",
    effectiveDate: "13 / 09 / 2026م",
    pages: 4,
    isSop: true,
    referencePolicy: "ACSD-POL-011 (سياسة استمرارية الأعمال)",
    relatedForms: "ACSD-FRM-BCM-001 (تحليل أثر الأعمال BIA)",
    operationalTracks: [
      "تحليل أثر الأعمال BIA وتحديد الأولويات",
      "استجابة الطوارئ والاحتواء الفوري",
      "التفعيل والتصعيد وإدارة الأزمات",
      "التعافي والعودة للتشغيل الطبيعي والاختبارات",
    ],
    sectionsOutline: [
      { title: "بيانات الضبط، الغرض والمبادئ الحاكمة", subtitle: "نطاق استمرارية الأعمال ومستويات التعامل مع الأحداث والأزمات", page: 1 },
      { title: "تحليل أثر الأعمال وتحديد الأولويات (BIA)", subtitle: "تقييم أثر التعطل، متطلبات الزمن (RTO/RPO/MTPD)، والاعتماديات الحرجة", page: 2 },
      { title: "إدارة الحوادث والأزمات والتفعيل والتعافي", subtitle: "الاستجابة والاحتواء، إدارة الاتصالات، وشروط العودة للتشغيل الطبيعي", page: 3 },
      { title: "الاختبارات والتمارين وإقفال دورة الاستمرارية", subtitle: "تقييم النتائج، مراجعة ما بعد الحادث، الإجراءات التحسينية، وأدلة الإثبات", page: 4 },
    ],
  },
  "ACSD-SOP-GOV-001": {
    code: "ACSD-SOP-GOV-001",
    categoryGroup: "sop",
    typeLabel: "إجراء تشغيلي معياري (SOP)",
    version: "V1.0",
    effectiveDate: "13 / 09 / 2026م",
    pages: 4,
    isSop: true,
    referencePolicy: "ACSD-POL-007 (إدارة الوثائق والسجلات)",
    relatedForms: "ACSD-FRM-GOV-001 إلى 003",
    operationalTracks: [
      "ترميز وتصنيف وثائق الحوكمة",
      "مراجعة واعتماد الإصدارات",
      "التعميم وتحديث سجلات الإيداع",
      "الأرشفة والإتلاف المنظم",
    ],
    sectionsOutline: [
      { title: "بيانات الضبط وضبط الإصدارات", subtitle: "مصفوفة ترميز وثائق الحوكمة ودورة المراجعة", page: 1 },
      { title: "مسار إعداد ومراجعة وتعميم الوثائق", subtitle: "صلاحيات الاعتماد، سجل الإصدارات، ونشر النسخ", page: 2 },
      { title: "إدارة السجلات وسريتها والحفظ", subtitle: "تصنيف السجلات وجداول مدد الاستبقاء وإجراءات الإتلاف", page: 3 },
      { title: "المتابعة والتدقيق والتحسين المستمر", subtitle: "التدقيق الدوري ومعالجة حالات عدم المطابقة", page: 4 },
    ],
  },
  "ACSD-SOP-RSK-001": {
    code: "ACSD-SOP-RSK-001",
    categoryGroup: "sop",
    typeLabel: "إجراء تشغيلي معياري (SOP)",
    version: "V1.0",
    effectiveDate: "13 / 09 / 2026م",
    pages: 4,
    isSop: true,
    referencePolicy: "ACSD-POL-008 و ACSD-POL-009",
    relatedForms: "ACSD-FRM-RSK-001 (سجل المخاطر)",
    operationalTracks: [
      "تحديد وتحليل المخاطر التشغيلية والمالية",
      "تقييم الأثر ومصفوفة الاحتمالية (5x5)",
      "تنفيذ الضوابط الرقابية الوقائية",
      "المتابعة الدورية وتقارير لجان الحوكمة",
    ],
    sectionsOutline: [
      { title: "بيانات الضبط ونطاق إدارة المخاطر", subtitle: "المبادئ الحاكمة ومستويات شهية وتقبل المخاطر", page: 1 },
      { title: "سجل المخاطر وتقييم الاحتمالية والأثر", subtitle: "مصفوفة المخاطر وتحديد الأولويات الحرجة", page: 2 },
      { title: "خطط التخفيف والضوابط الرقابية", subtitle: "مسؤوليات ملاك المخاطر وإجراءات المعالجة الوقائية", page: 3 },
      { title: "التقارير الرقابية والمراجعة المستمرة", subtitle: "مؤشرات المخاطر الرئيسية (KRIs) والتقارير الدورية", page: 4 },
    ],
  },

  // --- Manuals (3 Manuals) ---
  "ACSD-MAN-001": {
    code: "ACSD-MAN-001",
    categoryGroup: "manual",
    typeLabel: "دليل حوكمة مؤسسية شامل",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 58,
    isSop: false,
    referencePolicy: "نظام الجمعيات التعاونية ولائحته التنفيذية",
    relatedForms: "ACSD-FRM-GOV-001 (مصفوفة الصلاحيات والحوكمة)",
    operationalTracks: [
      "هيكل الحوكمة وتشكيل مجلس الإدارة",
      "لجان المجلس واختصاصاتها الرقابية",
      "مصفوفة تفويض الصلاحيات والمسؤوليات",
      "قواعد الإفصاح والشفافية وحقوق المساهمين",
    ],
    sectionsOutline: [
      { title: "الإطار العام والمبادئ الحاكمة للتنظيم المؤسسي", subtitle: "الأهداف، النطاق، ومفاهيم الحوكمة التعاونية", page: 1 },
      { title: "الجمعية العمومية ومجلس الإدارة", subtitle: "تشكيل المجلس، شروط العضوية، ومسؤوليات الإشراف", page: 12 },
      { title: "اللجان الدائمة والمنبثقة عن المجلس", subtitle: "لجنة المراجعة، لجنة المكافآت، ولجنة الاستثمار والترشيحات", page: 28 },
      { title: "مصفوفة الصلاحيات وقواعد الإفصاح والرقابة", subtitle: "تفويض الصلاحيات، الرقابة الداخلية، وإجراءات النزاهة المؤسسية", page: 45 },
    ],
  },
  "ACSD-MAN-002": {
    code: "ACSD-MAN-002",
    categoryGroup: "manual",
    typeLabel: "دليل الإدارة والضوابط المالية",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 31,
    isSop: false,
    referencePolicy: "المعايير المحاسبية الدولية وسياسة الرقابة الداخلية",
    relatedForms: "ACSD-FRM-FIN-001 إلى FIN-006 (سندات الصرف والقبض)",
    operationalTracks: [
      "الدورات المستندية وإدارة الخزينة والمدفوعات",
      "صلاحيات التوقيع المالي والاعتمادات",
      "إجراءات المشتريات والمناقصات والترسية",
      "الرقابة المالية وإعداد القوائم الختامية والتدقيق",
    ],
    sectionsOutline: [
      { title: "السياسات المحاسبية العامة والتنظيم المالي", subtitle: "دليل الحسابات، الدورة المستندية، وإدارة السيولة النقدية", page: 1 },
      { title: "إجراءات المشتريات والتعاقدات والمناقصات", subtitle: "طلبات الشراء، لجان الفحص والترسية، والعقود التعاونية", page: 9 },
      { title: "الرقابة على الأصول والمخزون والعهد المالية", subtitle: "جرد الأصول الثابتة، الرقابة على المستودعات، وتسوية العهد", page: 18 },
      { title: "إعداد القوائم المالية وإجراءات التدقيق المحاسبي", subtitle: "الحسابات الختامية، التدقيق الداخلي والخارجي، وتقارير الميزانية", page: 25 },
    ],
  },
  "ACSD-MAN-003": {
    code: "ACSD-MAN-003",
    categoryGroup: "manual",
    typeLabel: "لائحة الموارد البشرية المنظمة للعمل",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 43,
    isSop: false,
    referencePolicy: "نظام العمل السعودي وسياسات الموارد البشرية",
    relatedForms: "ACSD-FRM-HR-001 إلى HR-008 (عقود وتقييم الأداء)",
    operationalTracks: [
      "التوظيف والاستقطاب والتعيين التعاقدي",
      "سلم الرواتب والبدلات والمزايا الوظيفية",
      "نظام تقييم الأداء السنوي والتطوير المهني",
      "قواعد الانضباط والإجازات وإنهاء الخدمة",
    ],
    sectionsOutline: [
      { title: "الأحكام العامة وسياسات التوظيف والاستقطاب", subtitle: "شروط التعيين، عقود العمل، وفترات التجربة", page: 1 },
      { title: "سلم الرواتب والمزايا والبدلات والتعويضات", subtitle: "هيكل الأجور، البدلات النظامية، ومكافآت التميز", page: 12 },
      { title: "الإجازات، ساعات العمل، وتطوير الكفاءات", subtitle: "أنواع الإجازات، برامج التدريب الزراعي، وتقييم الجدارة", page: 24 },
      { title: "لائحة الجزاءات والانضباط ومكافأة نهاية الخدمة", subtitle: "المخالفات المسلكية، التحقيق الإداري، وإجراءات تصفية المستحقات", page: 35 },
    ],
  },

  // --- Policies (18 Policies) ---
  "ACSD-POL-001": {
    code: "ACSD-POL-001",
    categoryGroup: "policy",
    typeLabel: "سياسة تعارض المصالح",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 20,
    isSop: false,
    referencePolicy: "ACSD-MAN-001 (دليل الحوكمة)",
    relatedForms: "ACSD-FRM-COM-001 (إفصاح تعارض المصالح السنوي واللحظي)",
    operationalTracks: [
      "تحديد حالات تعارض المصالح المباشرة وغير المباشرة",
      "إجراءات الإفصاح السنوي واللحظي المعتمد",
      "قواعد الامتناع عن التصويت وحضور المداولات",
      "سجل الإفصاحات ومساءلة حالات عدم الالتزام",
    ],
    sectionsOutline: [
      { title: "الهدف والنطاق والمفاهيم الحاكمة للمصلحة", subtitle: "تعريف المصالح الشخصية، والقرابات، والأنشطة المنافسة", page: 1 },
      { title: "التزامات أعضاء المجلس والإدارة التنفيذية", subtitle: "معايير النزاهة وحظر استغلال المنصب أو الأصول", page: 6 },
      { title: "مسارات الإفصاح وإدارة حالات التعارض القائمة", subtitle: "تقديم الإفصاح، فحص اللجنة، وإجراءات التحفظ والتوثيق", page: 12 },
      { title: "سجلات الإفصاحات والتدقيق والعقوبات", subtitle: "حفظ السجلات، التدقيق السنوي، والإجراءات الانضباطية", page: 17 },
    ],
  },
  "ACSD-POL-002": {
    code: "ACSD-POL-002",
    categoryGroup: "policy",
    typeLabel: "سياسة السلوك المهني وأخلاقيات العمل",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 20,
    isSop: false,
    referencePolicy: "ACSD-MAN-001 و ACSD-MAN-003",
    relatedForms: "ACSD-FRM-COM-002 (إقرار الالتزام بميثاق السلوك المهني)",
    operationalTracks: [
      "قيم النزاهة والاحترافية والعمل الجماعي التعاوني",
      "قواعد التعامل مع المزارعين والموردين والشركاء",
      "حماية أصول وممتلكات الجمعية ومواردها",
      "آليات الإبلاغ والمساءلة عن السلوكيات غير المهنية",
    ],
    sectionsOutline: [
      { title: "القيم الجوهرية ومبادئ السلوك المؤسسي", subtitle: "النزاهة، العدالة، الشفافية، والمسؤولية الاجتماعية", page: 1 },
      { title: "قواعد السلوك في بيئة العمل والتعامل الخارجي", subtitle: "احترام التنوع، منع التمييز، والتعامل الأخلاقي مع المستفيدين", page: 6 },
      { title: "حماية المعلومات والموارد المادية والتقنية", subtitle: "الاستخدام المسؤول لأصول الجمعية والحفاظ على سريتها", page: 13 },
      { title: "المساءلة وتطبيق مدونة السلوك والشكاوى", subtitle: "لجنة الأخلاقيات، التحقيق في الشكاوى، والتدابير التصحيحية", page: 18 },
    ],
  },
  "ACSD-POL-003": {
    code: "ACSD-POL-003",
    categoryGroup: "policy",
    typeLabel: "سياسة مكافحة الاحتيال والفساد",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 20,
    isSop: false,
    referencePolicy: "الأنظمة الجزائية الوطنية وسياسة الرقابة الداخلية",
    relatedForms: "ACSD-FRM-COM-003 (سجل بلاغات الاحتيال والاشتباه)",
    operationalTracks: [
      "التعريف بجرائم الاحتيال والرشوة والاختلاس",
      "الضوابط الوقائية والتحصين المالي والإجرائي",
      "آليات الرصد والتحقيق الداخلي المستقل",
      "إجراءات الإحالة القضائية واسترداد الأصول",
    ],
    sectionsOutline: [
      { title: "مبدأ عدم التسامح المطلق ونطاق السياسة", subtitle: "تعريف الاحتيال والفساد واستغلال النفوذ الوظيفي", page: 1 },
      { title: "الضوابط الرقابية والوقائية لمنع التجاوزات", subtitle: "الفصل بين المهام، الرقابة الثنائية، وتقييم مخاطر الاحتيال", page: 6 },
      { title: "بروتوكولات التحقيق الداخلي وجمع الأدلة", subtitle: "تشكيل لجان التحقيق، توثيق الوقائع، وضمان النزاهة", page: 12 },
      { title: "الإجراءات العقابية، التعافي، والتبليغ النظامي", subtitle: "المساءلة القانونية، إشعار الجهات الرسمية، وتحصين الثغرات", page: 17 },
    ],
  },
  "ACSD-POL-004": {
    code: "ACSD-POL-004",
    categoryGroup: "policy",
    typeLabel: "سياسة الإبلاغ عن المخالفات وحماية المبلغين",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 21,
    isSop: false,
    referencePolicy: "ACSD-SOP-COM-001 (إجراء البلاغات والنزاهة)",
    relatedForms: "ACSD-FRM-COM-003 (نموذج البلاغ الآمن السري)",
    operationalTracks: [
      "القنوات الرسمية المعتمدة لتقديم البلاغات بسرية",
      "معايير البلاغ الصادق وحسن النية",
      "الحماية الشاملة للمبلّغ من الإجراءات الانتقامية",
      "مراحل الفحص والتحقيق والرد النهائي",
    ],
    sectionsOutline: [
      { title: "أهداف السياسة ونطاق المخالفات المشمولة", subtitle: "المخالفات المالية، الإدارية، التنظيمية، والأمنية", page: 1 },
      { title: "قنوات التبليغ الآمنة وبروتوكولات السرية", subtitle: "البريد الآمن، الخط الساخن، والمنصة الإلكترونية المشفرة", page: 7 },
      { title: "ضمانات حماية المبلغين ومنع الإضرار الوظيفي", subtitle: "الحصانة من التمييز، حماية الهوية، والتعويض عن الأضرار", page: 13 },
      { title: "دورة معالجة البلاغ والتقارير الرقابية", subtitle: "الفحص الأولي، التحقيق، الإجراء التصحيحي، والتقارير لمجلس الإدارة", page: 18 },
    ],
  },
  "ACSD-POL-005": {
    code: "ACSD-POL-005",
    categoryGroup: "policy",
    typeLabel: "سياسة الهدايا والضيافة والمزايا",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "ACSD-POL-001 و ACSD-POL-002",
    relatedForms: "ACSD-FRM-COM-004 (سجل إفصاح الهدايا والضيافة)",
    operationalTracks: [
      "الحدود المالية المعتمدة للهدايا الترويجية والرمزية",
      "حظر الهدايا النقدية ومحاولات التأثير على القرار",
      "إجراءات التسجيل في السجل المركزي للهدايا",
      "آليات التصرف بالهدايا لصالح الجمعية والمستفيدين",
    ],
    sectionsOutline: [
      { title: "المبادئ الحاكمة لعدم التأثير والاستقلالية", subtitle: "تعريف الهدايا، الدعوات، ومصروفات الضيافة المقبولة", page: 1 },
      { title: "المحددات والأسقف المالية والمحظورات الصريحة", subtitle: "قواعد القبول، المناسبات الرسمية، والحظر القاطع للرشاوى", page: 4 },
      { title: "مسار الإفصاح والتسجيل والإيداع الرسمي", subtitle: "تعبئة نموذج الإفصاح، تقييم القيمة، وتسليم الهدية للجمعية", page: 7 },
      { title: "التصرف بالهدايا والرقابة والتدقيق الدوري", subtitle: "توزيع الهدايا الخيرية، المزاد الداخلي، ومراجعة السجلات", page: 9 },
    ],
  },
  "ACSD-POL-006": {
    code: "ACSD-POL-006",
    categoryGroup: "policy",
    typeLabel: "سياسة حماية البيانات وسرية المعلومات",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "نظام حماية البيانات الشخصية السعودي (PDPL)",
    relatedForms: "ACSD-FRM-SEC-001 (إقرار المحافظة على السرية NDA)",
    operationalTracks: [
      "تصنيف البيانات المؤسسية (سري، مقيد، داخلي، عام)",
      "حقوق أصحاب البيانات الشخصية والمزارعين",
      "ضوابط الأمن السيبراني والتشفير والنسخ الاحتياطي",
      "إجراءات الاستجابة لحوادث تسريب البيانات والإشعار",
    ],
    sectionsOutline: [
      { title: "الإطار النظامي ومصفوفة تصنيف البيانات", subtitle: "المستويات الأمنية، معايير الترميز، وحقوق الخصوصية", page: 1 },
      { title: "جمع ومعالجة وتخزين البيانات الشخصية", subtitle: "الموافقة المسبقة، الغرض المشروع، وتقييد الوصول الميداني", page: 4 },
      { title: "الضوابط التقنية والوقائية والتشفير الرقمي", subtitle: "أمن الخوادم، سياسات كلمات المرور، والنسخ الاحتياطي السحابي", page: 7 },
      { title: "إدارة الحوادث الأمنية والتبليغ عن التسريبات", subtitle: "عزل الاختراق، إشعار الهيئة الوطنية، والإجراءات التصحيحية", page: 9 },
    ],
  },
  "ACSD-POL-007": {
    code: "ACSD-POL-007",
    categoryGroup: "policy",
    typeLabel: "سياسة إدارة الوثائق والسجلات",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "ACSD-SOP-GOV-001 (إجراء ضبط الوثائق)",
    relatedForms: "ACSD-FRM-GOV-002 (جدول مدد الاستبقاء والإتلاف)",
    operationalTracks: [
      "ترميز الوثائق وإصدار النسخ المعتمدة",
      "الأرشفة الإلكترونية والورقية الآمنة",
      "جداول مدد الاستبقاء القانونية لكل نوع سجل",
      "إجراءات الإتلاف المنظم وتوثيق محاضر الشطب",
    ],
    sectionsOutline: [
      { title: "أهداف السياسة ودورة حياة الوثيقة المؤسسية", subtitle: "الإنشاء، التدقيق، الاعتماد، والتداول الرسمي", page: 1 },
      { title: "معايير التصنيف ونظام الأرشفة الموحد", subtitle: "نظام الفهرسة، أمن الأرشيف، وصلاحيات الوصول", page: 4 },
      { title: "جداول مدد الحفظ والاستبقاء الإلزامية", subtitle: "السجلات المالية، محاضر المجلس، وعقود المشاريع", page: 7 },
      { title: "إجراءات الإتلاف الآمن ومحاضر الرقابة", subtitle: "لجنة الإتلاف، طرائق الإتلاف الرقمي والورقي، وتوثيق السجلات", page: 9 },
    ],
  },
  "ACSD-POL-008": {
    code: "ACSD-POL-008",
    categoryGroup: "policy",
    typeLabel: "سياسة إدارة المخاطر",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "معيار ISO 31000 و ACSD-SOP-RSK-001",
    relatedForms: "ACSD-FRM-RSK-001 (سجل ومصفوفة المخاطر المؤسسية)",
    operationalTracks: [
      "شهية ومستويات تقبل المخاطر المعتمدة من المجلس",
      "مصفوفة تقييم الاحتمالية والأثر (5×5)",
      "خطط الاستجابة والمعالجة والتخفيف",
      "المراقبة الدورية وإعداد تقارير لجنة المخاطر",
    ],
    sectionsOutline: [
      { title: "الإطار العام ومستويات شهية وتقبل المخاطر", subtitle: "مبادئ إدارة المخاطر، الأدوار، ومسؤوليات ملاك المخاطر", page: 1 },
      { title: "منهجية تحديد وتقييم المخاطر الزراعية والمالية", subtitle: "مصفوفة التصنيف 5x5، المخاطر التشغيلية والبيئية والسوقية", page: 4 },
      { title: "استراتيجيات المعالجة وخطط التخفيف الوقائية", subtitle: "التجنب، التخفيض، النقل (التأمين)، والقبول المشروط", page: 7 },
      { title: "المتابعة والمراجعة ومؤشرات الإنذار المبكر (KRIs)", subtitle: "التقارير الدورية لمجلس الإدارة والمراجعة المستمرة", page: 9 },
    ],
  },
  "ACSD-POL-009": {
    code: "ACSD-POL-009",
    categoryGroup: "policy",
    typeLabel: "سياسة الرقابة الداخلية",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "إطار COSO للرقابة الداخلية و ACSD-MAN-002",
    relatedForms: "ACSD-FRM-AUD-001 (قائمة التدقيق والرقابة الدورية)",
    operationalTracks: [
      "الفصل الفعال بين المسؤوليات والوظائف الحساسة",
      "أنشطة الرقابة الوقائية والكاشفة والمصححة",
      "برامج المراجعة والتدقيق الميداني الداخلي",
      "متابعة معالجة ملاحظات التدقيق الخارجي والرقابي",
    ],
    sectionsOutline: [
      { title: "مكونات وأهداف نظام الرقابة الداخلية", subtitle: "بيئة الرقابة، تقييم المخاطر، والمعلومات والتواصل", page: 1 },
      { title: "أنشطة الرقابة التنفيذية والفصل بين الصلاحيات", subtitle: "التفويض المزدوج، المطابقات البنكية، والرقابة على الأصول", page: 4 },
      { title: "المراجعة الداخلية واستقلالية إدارة التدقيق", subtitle: "خطة التدقيق السنوية المبنية على المخاطر وإجراءات الفحص", page: 7 },
      { title: "رفع التقارير ومعالجة الثغرات الرقابية", subtitle: "تقارير لجنة المراجعة، خطط التصحيح، ومساءلة المتأخرات", page: 9 },
    ],
  },
  "ACSD-POL-010": {
    code: "ACSD-POL-010",
    categoryGroup: "policy",
    typeLabel: "سياسة الامتثال والالتزام",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "الأنظمة الحكومية ذات العلاقة بالقطاع الزراعي والتعاوني",
    relatedForms: "ACSD-FRM-COM-002 (سجل مصفوفة الالتزامات النظامية)",
    operationalTracks: [
      "حصر ومتابعة المتطلبات التشريعية والتنظيمية",
      "مواءمة اللوائح الداخلية مع القرارات الوزارية",
      "برامج التدريب والتوعية بالامتثال للعاملين",
      "التقييم السنوي للامتثال ورفع تقارير السلامة النظامية",
    ],
    sectionsOutline: [
      { title: "مبادئ ثقافة الامتثال ونطاق الالتزامات", subtitle: "التشريعات الوطنية، معايير الحوكمة، واللوائح التعاونية", page: 1 },
      { title: "مصفوفة الامتثال ومسؤوليات الإدارات التشغيلية", subtitle: "رصد التحديثات النظامية، وتحديد نقاط الاتصال الرقابية", page: 4 },
      { title: "آليات التقييم الدوري والتدقيق على الامتثال", subtitle: "فحص الامتثال الميداني، رصد الفجوات، والتوعية المستمرة", page: 7 },
      { title: "تقارير الامتثال وإجراءات تصحيح عدم المطابقة", subtitle: "رفع التقارير للجنة الحوكمة ومعالجة التنبيهات الرسمية", page: 9 },
    ],
  },
  "ACSD-POL-011": {
    code: "ACSD-POL-011",
    categoryGroup: "policy",
    typeLabel: "سياسة استمرارية الأعمال",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "معيار ISO 22301 و ACSD-SOP-BCM-001",
    relatedForms: "ACSD-FRM-BCM-001 (نموذج تحليل أثر الأعمال BIA)",
    operationalTracks: [
      "تحديد الأنشطة والخدمات التعاونية الحيوية الحرجة",
      "تحديد المستهدفات الزمنية للاستعادة (RTO و RPO)",
      "خطط واستراتيجيات الاستجابة للطوارئ الميدانية",
      "تمارين المحاكاة واختبارات الجاهزية الدورية",
    ],
    sectionsOutline: [
      { title: "المرتكزات الحاكمة لاستمرارية الأعمال التعاونية", subtitle: "نطاق العمليات الحرجة، حماية سلاسل الإمداد، والمرونة", page: 1 },
      { title: "منهجية تحليل أثر الأعمال وتحديد الأولويات (BIA)", subtitle: "تقييم التكاليف والأضرار الناتجة عن توقف الخدمات الزراعية", page: 4 },
      { title: "استراتيجيات التعافي وتوفير الموارد البديلة", subtitle: "المواقع البديلة، استعادة الأنظمة التقنية، والموردين البدلاء", page: 7 },
      { title: "الصيانة والتمارين والتحديث السنوي للخطط", subtitle: "اختبارات المحاكاة الواقعية والتحسين المستمر لجاهزية الطوارئ", page: 9 },
    ],
  },
  "ACSD-POL-012": {
    code: "ACSD-POL-012",
    categoryGroup: "policy",
    typeLabel: "سياسة إدارة الأزمات والطوارئ",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 10,
    isSop: false,
    referencePolicy: "الدفاع المدني وإدارة الكوارث الوطنية",
    relatedForms: "ACSD-FRM-BCM-002 (دليل الاتصال الطارئ وقائمة الإخلاء)",
    operationalTracks: [
      "تشكيل غرفة قيادة الأزمات وتفويض الصلاحيات الفورية",
      "بروتوكولات السلامة المهنية والإخلاء الميداني",
      "إدارة الاتصال الإعلامي الرسمي والمؤسسي في الطوارئ",
      "تقييم ما بعد الأزمة وإعادة التأهيل وإغلاق البلاغ",
    ],
    sectionsOutline: [
      { title: "تصنيف الأزمات ومستويات إعلان حالة الطوارئ", subtitle: "الأزمات المناخية، الكوارث الزراعية، والتعطل التقني والحرائق", page: 1 },
      { title: "هيكل فريق قيادة الأزمات (CMT) والمسؤوليات الميدانية", subtitle: "قائد الأزمة، مسؤولو السلامة، والتواصل مع الجهات الأمنية", page: 4 },
      { title: "بروتوكول الاتصال وإدارة السمعة المؤسسية", subtitle: "المتحدث الرسمي، البيانات الصحفية، والتواصل مع المزارعين", page: 7 },
      { title: "التقييم الختامي والدروس المستفادة والتعافي", subtitle: "حصر الأضرار، التعويضات، وتحديث تدابير السلامة الوقائية", page: 9 },
    ],
  },
  "ACSD-POL-013": {
    code: "ACSD-POL-013",
    categoryGroup: "policy",
    typeLabel: "سياسة مكافحة غسل الأموال وتمويل الإرهاب",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 8,
    isSop: false,
    referencePolicy: "نظام مكافحة غسل الأموال السعودي وتعليمات البنك المركزي",
    relatedForms: "ACSD-FRM-FIN-007 (نموذج العناية الواجبة واعرف عميلك KYC)",
    operationalTracks: [
      "إجراءات العناية الواجبة والتحقق من الهوية (KYC)",
      "مراقبة المعاملات المالية والتبرعات غير الاعتيادية",
      "حظر التعاملات النقدية مجهولة المصدر",
      "الإبلاغ عن العمليات المشبوهة لدى وحدة التحريات المالية",
    ],
    sectionsOutline: [
      { title: "المبادئ النظامية والالتزامات الوقائية الصارمة", subtitle: "تعريف الجرائم المالية والالتزام بالأنظمة الرقابية الوطنية", page: 1 },
      { title: "معايير العناية الواجبة والتحقق من الشركاء والممولين", subtitle: "إجراءات KYC، فحص قوائم الحظر، وتحديد المستفيد الحقيقي", page: 3 },
      { title: "مؤشرات الاشتباه ومراقبة حركة الأموال", subtitle: "التحويلات الكبيرة، التبرعات المجهولة، والأنشطة الشاذة", page: 5 },
      { title: "بروتوكول الإبلاغ السري وحفظ السجلات المالية", subtitle: "مسؤول الامتثال، الإبلاغ لوحدة التحريات، وسجلات 10 سنوات", page: 7 },
    ],
  },
  "ACSD-POL-014": {
    code: "ACSD-POL-014",
    categoryGroup: "policy",
    typeLabel: "سياسة قبول الهبات والتبرعات",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 7,
    isSop: false,
    referencePolicy: "اللوائح المنظمة لجمع التبرعات بالقطاع غير الربحي",
    relatedForms: "ACSD-FRM-FIN-008 (سند استلام وقبول تبرع أو منحة)",
    operationalTracks: [
      "معايير وشروط قبول التبرعات النقدية والعينية",
      "ضوابط المنح المشروطة والأوقاف الزراعية",
      "إصدار السندات والتوثيق المالي في الحسابات الرسمية",
      "إعداد تقارير الإفصاح عن أوجه صرف التبرعات",
    ],
    sectionsOutline: [
      { title: "نطاق قبول المنح وأهدافها التنموية", subtitle: "التوافق مع أهداف الجمعية، النزاهة، وعدم تعارض المصالح", page: 1 },
      { title: "الضوابط الشرعية والنظامية للتبرعات العينية والنقدية", subtitle: "حظر التبرعات النقدية المباشرة واشتراط الحسابات البنكية المعتمدة", page: 3 },
      { title: "إدارة المنح المقيدة والمشروطة والأوقاف الزراعية", subtitle: "اتفاقيات المنح، شروط الواقفين، ومتابعة تنفيذ المستهدفات", page: 5 },
      { title: "التوثيق المحاسبي والتقارير الرقابية الدورية", subtitle: "السندات المالية الرسمية والإفصاح في القوائم السنوية", page: 7 },
    ],
  },
  "ACSD-POL-015": {
    code: "ACSD-POL-015",
    categoryGroup: "policy",
    typeLabel: "سياسة تنظيم العلاقة مع أعضاء الجمعية العمومية وتقديم الخدمات",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 8,
    isSop: false,
    referencePolicy: "ACSD-MAN-001 (دليل الحوكمة)",
    relatedForms: "ACSD-FRM-MBR-001 (طلب عضوية واشتراك جمعية عمومية)",
    operationalTracks: [
      "شروط وإجراءات الانضمام لعضوية الجمعية العمومية",
      "حقوق المساهمين في التصويت والاطلاع والمساءلة",
      "معايير تقديم الخدمات والمساعدات الزراعية بعدالة",
      "إجراءات عقد اجتماعات الجمعية العمومية العادية وغير العادية",
    ],
    sectionsOutline: [
      { title: "شروط العضوية وحقوق والتزامات المساهمين", subtitle: "المعايير التعاونية، الاكتتاب، وسجل الأعضاء الرسمي", page: 1 },
      { title: "تنظيم اجتماعات الجمعية العمومية والتصويت", subtitle: "توجيه الدعوات، النصاب القانوني، والتصويت الحضوري والإلكتروني", page: 3 },
      { title: "حوكمة تقديم الخدمات الزراعية والتعاونية للمزارعين", subtitle: "معايير الاستحقاق، الدعم الفني، والمعدات والمدخلات الزراعية", page: 5 },
      { title: "قنوات التواصل، الشكاوى، وتوزيع الأرباح السنوية", subtitle: "إدارة علاقات المساهمين، آلية البت في الاعتراضات، وصرف العوائد", page: 7 },
    ],
  },
  "ACSD-POL-016": {
    code: "ACSD-POL-016",
    categoryGroup: "policy",
    typeLabel: "سياسة المكافآت والامتيازات",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 6,
    isSop: false,
    referencePolicy: "لائحة الحوكمة ولجنة الترشيحات والمكافآت",
    relatedForms: "ACSD-FRM-HR-009 (بيان استحقاق مكافآت اللجان والمجلس)",
    operationalTracks: [
      "مكافآت أعضاء مجلس الإدارة واللجان المنبثقة",
      "بدلات حضور الجلسات وتغطية النفقات الفعلية",
      "معايير الحوافز السنوية للإدارة التنفيذية بناء على الأداء",
      "الإفصاح السنوي الشفاف عن المكافآت في تقرير الحوكمة",
    ],
    sectionsOutline: [
      { title: "الأسس الحاكمة لتحديد المكافآت والبدلات", subtitle: "المعايير المعتمدة، التنافسية، وربط المكافأة بالإنجاز والمستهدفات", page: 1 },
      { title: "مكافآت وبدلات مجلس الإدارة واللجان المنبثقة", subtitle: "الأسقف النظامية، بدل حضور الاجتماعات، ومصروفات السفر المعتمدة", page: 3 },
      { title: "حوافز الإدارة التنفيذية ومؤشرات الأداء (KPIs)", subtitle: "تقييم الإنجاز السنوي، مكافآت التميز، والتوزيع العادل", page: 4 },
      { title: "إجراءات الصرف والإفصاح والشفافية النظامية", subtitle: "اعتماد الجمعية العمومية، وتضمين المكافآت بالتقرير السنوي", page: 6 },
    ],
  },
  "ACSD-POL-017": {
    code: "ACSD-POL-017",
    categoryGroup: "policy",
    typeLabel: "سياسة الصرف للبرامج والأنشطة",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 6,
    isSop: false,
    referencePolicy: "ACSD-MAN-002 (دليل الضوابط المالية)",
    relatedForms: "ACSD-FRM-FIN-004 (طلب صرف مالي لمشروع زراعي)",
    operationalTracks: [
      "مصفوفة الصلاحيات المالية وتفويض اعتمادات الصرف",
      "إجراءات صرف السلف المؤقتة وتسويتها المستندية",
      "الصرف للمبادرات الزراعية ومشاريع الدعم الميداني",
      "التدقيق اللاحق ومطابقة الفواتير مع الموازنة المعتمدة",
    ],
    sectionsOutline: [
      { title: "الإطار العام لترشيد وضبط المصروفات التشغيلية", subtitle: "الاعتماد المالي المسبق ومطابقة الصرف مع الموازنة التقديرية", page: 1 },
      { title: "مصفوفة تفويض الصلاحيات المالية للصرف", subtitle: "حدود صلاحيات المدير التنفيذي، المشرف المالي، ورئيس المجلس", page: 3 },
      { title: "ضوابط السلف التشغيلية والمشتريات العاجلة", subtitle: "سقوف السلف، شروط الصرف، والمدد الزمنية الإلزامية لتسويتها", page: 4 },
      { title: "المراجعة المالية وإقفال العهد وتقارير الأداء", subtitle: "التدقيق المحاسبي، الفواتير الضريبية، وتقارير الكفاءة المالية", page: 6 },
    ],
  },
  "ACSD-POL-018": {
    code: "ACSD-POL-018",
    categoryGroup: "policy",
    typeLabel: "سياسة الاستثمار وتنمية العوائد",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 7,
    isSop: false,
    referencePolicy: "نظام الجمعيات التعاونية ولائحة الاستثمار",
    relatedForms: "ACSD-FRM-INV-001 (دراسة جدوى وتقييم فرصة استثمارية)",
    operationalTracks: [
      "الأوعية الاستثمارية المعتمدة وحدود المخاطر المقبولة",
      "دراسات الجدوى الاقتصادية للمشاريع الزراعية التعاونية",
      "إدارة السيولة النقدية والمحافظ الاستثمارية الآمنة",
      "حوكمة قرارات لجنة الاستثمار والتقارير الدورية",
    ],
    sectionsOutline: [
      { title: "أهداف الاستثمار والمبادئ الحاكمة لتنمية الأصول", subtitle: "الأمان المالي، تحقيق عوائد مستدامة، وحماية رأس المال التعاوني", page: 1 },
      { title: "الأوعية والمجالات الاستثمارية المسموحة والمحظورة", subtitle: "المشاريع الزراعية، الودائع المتوافقة، وحظر المضاربات عالية المخاطر", page: 3 },
      { title: "اختصاصات لجنة الاستثمار ومعايير دراسات الجدوى", subtitle: "فحص الفرص، تقييم العائد والمخاطر، وآليات الاعتماد النظامي", page: 5 },
      { title: "مراقبة الأداء المالي والتقارير والتدقيق الدوري", subtitle: "تقييم العوائد الفعلية، مراجعة المحافظ، وعرض النتائج على المجلس", page: 7 },
    ],
  },

  // --- Strategic & Profile Documents (3 Documents) ---
  "ACSD-STRAT-2026": {
    code: "ACSD-STRAT-2026",
    categoryGroup: "strategy",
    typeLabel: "الخطة الاستراتيجية الخمسية (2026 - 2031م)",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 13,
    isSop: false,
    referencePolicy: "رؤية المملكة 2030 واستراتيجية التنمية الزراعية",
    relatedForms: "ACSD-FRM-STRAT-001 (بطاقات قياس الأداء الاستراتيجي BSC)",
    operationalTracks: [
      "الرؤية والرسالة والقيم المؤسسية للخماسية القادمة",
      "الأهداف الاستراتيجية ومؤشرات الأداء الرئيسية (KPIs)",
      "مبادرات تطوير المدرجات الزراعية وحصاد المياه",
      "سلاسل الإمداد والتسويق التعاوني وتمكين المزارعين",
    ],
    sectionsOutline: [
      { title: "السياق الاستراتيجي، الرؤية، والرسالة المؤسسية", subtitle: "التحليل البيئي (SWOT)، القيم الجوهرية، والموقع الاستراتيجي", page: 1 },
      { title: "المحاور والأهداف الاستراتيجية ومؤشرات الإنجاز", subtitle: "استدامة الموارد، تمكين صغار المزارعين، ورفع الكفاءة الإنتاجية", page: 4 },
      { title: "محفظة المبادرات والمشاريع التنموية الكبرى", subtitle: "تأهيل المدرجات، الري الذكي، مراكز الفرز والتبريد التعاوني", page: 8 },
      { title: "إطار الحوكمة التنفيذية ومتابعة الأداء الاستراتيجي", subtitle: "خارطة الطريق الزمنية، مصفوفة المخاطر الاستراتيجية، ومسار التقييم", page: 11 },
    ],
  },
  "ACSD-PRF-001": {
    code: "ACSD-PRF-001",
    categoryGroup: "strategy",
    typeLabel: "الملف التعريفي الرسمي للجمعية (ACSD Profile)",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 26,
    isSop: false,
    referencePolicy: "نظام الجمعيات التعاونية والهوية المؤسسية المعتمدة",
    relatedForms: "ACSD-FRM-PRF-001 (طلب شراكة أو رعاية مبادرة)",
    operationalTracks: [
      "نبذة التأسيس والترخيص والرؤية التعاونية",
      "الهيكل التنظيمي ومجلس الإدارة والخبرات الإدارية",
      "الخدمات الميدانية والمشاريع الزراعية المنجزة",
      "الشراكات الاستراتيجية وقنوات التواصل والتفاعل",
    ],
    sectionsOutline: [
      { title: "من نحن — مسيرة التأسيس والرسالة التعاونية", subtitle: "الترخيص الرسمي، النطاق الجغرافي، والرؤية المستقبلية", page: 1 },
      { title: "الهيكل التنظيمي، القيادة، والحوكمة المؤسسية", subtitle: "مجلس الإدارة، الإدارة التنفيذية، واللجان المتخصصة", page: 7 },
      { title: "حزمة الخدمات الزراعية والمبادرات الميدانية للمزارعين", subtitle: "الإرشاد الزراعي، توفير المدخلات، ودعم الزراعة العضوية", page: 14 },
      { title: "سجل الإنجازات، التحالفات الاستراتيجية، والتواصل", subtitle: "أبرز أرقام التأثير، الشركاء الحكوميون والقطاع الخاص، وقنوات الاتصال", page: 20 },
    ],
  },
  "ACSD-INV-001": {
    code: "ACSD-INV-001",
    categoryGroup: "strategy",
    typeLabel: "ملف الجمعية المؤسسي والاستثماري (Investment Portfolio)",
    version: "V1.0",
    effectiveDate: "2026م",
    pages: 52,
    isSop: false,
    referencePolicy: "ACSD-POL-018 (سياسة الاستثمار وتنمية العوائد)",
    relatedForms: "ACSD-FRM-INV-002 (نموذج إبداء الرغبة الاستثمارية EOI)",
    operationalTracks: [
      "الفرص الاستثمارية الزراعية الواعدة ونماذج الأعمال",
      "المزايا التنافسية للقطاع التعاوني والحوافز الاستثمارية",
      "دراسات الجدوى المالية وتوقعات العوائد ومؤشرات الربحية",
      "أطر الشراكة بين القطاعين العام والخاص والضمانات",
    ],
    sectionsOutline: [
      { title: "الملخص التنفيذي والمناخ الاستثماري الزراعي", subtitle: "المقومات البيئية، الطلب السوقي، ومؤشرات الجدوى الكلية", page: 1 },
      { title: "محفظة الفرص الاستثمارية والمشاريع النوعية", subtitle: "مجمعات البيوت المحمية، الصناعات التحويلية، ومستودعات التبريد", page: 14 },
      { title: "التحليل المالي وتوقعات التدفقات النقدية والعوائد", subtitle: "معدل العائد الداخلي (IRR)، فترات الاسترداد، ونماذج مشاركة الأرباح", page: 30 },
      { title: "هياكل التعاقد، الحوكمة الاستثمارية، وإدارة المخاطر", subtitle: "صيغ التحالف، الضمانات التعاقدية، وتسهيلات الجهات التمويلية", page: 44 },
    ],
  },
};

function parseDocumentMeta(item: {
  id: number;
  title: string;
  summary?: string | null;
  body?: string | null;
  documentCategory?: "governance" | "annual_report" | null;
  documentYear?: number | null;
}): DocumentMeta {
  const title = item.title;
  const text = `${item.title} ${item.body || ""} ${item.summary || ""}`;

  // Extract document code if present
  const codeMatch = text.match(/ACSD-(?:POL|SOP|MAN|STRAT|PRF|INV|REP|DOC)-[0-9A-Za-z]+/i);
  let detectedCode = codeMatch ? codeMatch[0].toUpperCase() : "";

  // Check matching registry entry
  let matchedKey = Object.keys(DOCUMENTS_METADATA_REGISTRY).find(k => {
    return (
      (detectedCode && detectedCode.includes(k)) ||
      title.includes(k) ||
      text.includes(k)
    );
  });

  // Additional fuzzy checks for known filenames or titles
  if (!matchedKey) {
    if (text.includes("COM-001")) matchedKey = "ACSD-SOP-COM-001";
    else if (text.includes("BCM-001")) matchedKey = "ACSD-SOP-BCM-001";
    else if (text.includes("GOV-001")) matchedKey = "ACSD-SOP-GOV-001";
    else if (text.includes("RSK-001")) matchedKey = "ACSD-SOP-RSK-001";
    else if (text.includes("MAN-001") || title.includes("دليل الحوكمة المؤسسية")) matchedKey = "ACSD-MAN-001";
    else if (text.includes("MAN-002") || title.includes("الضوابط المالية")) matchedKey = "ACSD-MAN-002";
    else if (text.includes("MAN-003") || title.includes("الموارد البشرية")) matchedKey = "ACSD-MAN-003";
    else if (text.includes("STRAT-2026") || title.includes("الخطة الاستراتيجية")) matchedKey = "ACSD-STRAT-2026";
    else if (text.includes("PRF-001") || title.includes("الملف التعريفي")) matchedKey = "ACSD-PRF-001";
    else if (text.includes("INV-001") || title.includes("المؤسسي والاستثماري")) matchedKey = "ACSD-INV-001";
  }

  const finalCode = matchedKey || detectedCode || (item.documentCategory === "annual_report" ? `ACSD-REP-${item.documentYear ?? 2026}` : `ACSD-DOC-${item.id}`);

  // Determine Classification (Restricted, Internal, Public)
  const isRestricted =
    finalCode.includes("POL-003") ||
    finalCode.includes("POL-006") ||
    finalCode.includes("POL-013") ||
    finalCode.includes("COM-001") ||
    text.includes("مقيد - RES") ||
    text.includes("مقيد");

  const isInternal =
    finalCode.includes("POL-005") ||
    finalCode.includes("POL-007") ||
    finalCode.includes("POL-008") ||
    finalCode.includes("POL-009") ||
    finalCode.includes("POL-011") ||
    finalCode.includes("POL-012") ||
    finalCode.includes("POL-016") ||
    finalCode.includes("POL-017") ||
    finalCode.includes("BCM-001") ||
    finalCode.includes("GOV-001") ||
    finalCode.includes("RSK-001") ||
    finalCode.includes("MAN-002") ||
    finalCode.includes("MAN-003") ||
    text.includes("داخلي - INT") ||
    text.includes("داخلي");

  const classification: DocumentMeta["classification"] = isRestricted
    ? {
        label: "مقيد (RES)",
        tag: "restricted",
        badgeClass: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
        description: "يخضع لمبدأ الحاجة إلى المعرفة والصلاحية المعتمدة",
      }
    : isInternal
    ? {
        label: "داخلي (INT)",
        tag: "internal",
        badgeClass: "bg-[#ccfbf1] text-[#115e59] border-[#99f6e4]",
        description: "للاستخدام الداخلي المعتمد لمنسوبي الجمعية والجهات ذات العلاقة",
      }
    : {
        label: "عام (PUB)",
        tag: "public",
        badgeClass: "bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]",
        description: "وثيقة معتمدة ومتاحة للجمهور والمساهمين والشركاء",
      };

  // If in registry, return registered record combined with classification
  if (matchedKey && DOCUMENTS_METADATA_REGISTRY[matchedKey]) {
    const reg = DOCUMENTS_METADATA_REGISTRY[matchedKey];
    return {
      code: reg.code,
      classification,
      categoryGroup: reg.categoryGroup,
      typeLabel: reg.typeLabel,
      version: reg.version,
      effectiveDate: reg.effectiveDate,
      pages: reg.pages,
      isSop: reg.isSop,
      referencePolicy: reg.referencePolicy,
      relatedForms: reg.relatedForms,
      operationalTracks: reg.operationalTracks,
      sectionsOutline: reg.sectionsOutline,
    };
  }

  // Fallback for annual reports or other items
  const isAnnual = item.documentCategory === "annual_report" || title.includes("تقرير سنوي");
  if (isAnnual) {
    return {
      code: finalCode,
      classification,
      categoryGroup: "annual_report",
      typeLabel: "تقرير سنوي معتمد",
      version: "V1.0",
      effectiveDate: `${item.documentYear ?? 2026}م`,
      pages: 12,
      isSop: false,
      referencePolicy: "نظام الجمعيات التعاونية ومعايير الإفصاح المالي",
      relatedForms: "ACSD-FRM-FIN-010 (تقرير القوائم المالية السنوية)",
      operationalTracks: [
        "القوائم المالية المدققة وتقرير المحاسب القانوني",
        "إنجازات المشاريع الزراعية وخدمات المزارعين",
        "تقرير مجلس الإدارة ومؤشرات الحوكمة والنزاهة",
        "الخطط المستقبلية والميزانية التقديرية المعتمدة",
      ],
      sectionsOutline: [
        { title: "كلمة رئيس المجلس والتقرير التنفيذي العام", subtitle: "أبرز المحطات والإنجازات السنوية ومؤشرات الأداء", page: 1 },
        { title: "تقرير البرامج الزراعية والميدانية المنفذة", subtitle: "تأهيل المزارع، الإرشاد الزراعي، وتوزيع المساعدات", page: 4 },
        { title: "التقرير المالي والقوائم المحاسبية الختامية", subtitle: "الميزانية العمومية، قائمة الأنشطة، والتدفقات النقدية", page: 8 },
        { title: "مؤشرات الحوكمة والامتثال وتقرير الرقابة", subtitle: "أعمال اللجان المنبثقة، التدقيق الداخلي، وخطة العام القادم", page: 11 },
      ],
    };
  }

  // Generic fallback document with full tracks and outline
  return {
    code: finalCode,
    classification,
    categoryGroup: "policy",
    typeLabel: "وثيقة حوكمة معتمدة",
    version: "V1.0",
    effectiveDate: `${item.documentYear ?? 2026}م`,
    pages: 4,
    isSop: false,
    referencePolicy: "دليل الحوكمة المؤسسية الشامل ACSD-MAN-001",
    relatedForms: "نماذج الحوكمة المعتمدة لدى الجمعية",
    operationalTracks: [
      "الضوابط التشغيلية والأهداف التنظيمية",
      "المسؤوليات والصلاحيات والمساءلة الإدارية",
      "إجراءات التنفيذ والمتابعة والرقابة الميدانية",
      "التوثيق وحفظ السجلات والتحسين المستمر",
    ],
    sectionsOutline: [
      { title: "بيانات الضبط والمبادئ والأهداف الحاكمة", subtitle: "النطاق، الغرض المؤسسي، ومحددات السياسة", page: 1 },
      { title: "المحددات التنظيمية ومصفوفة الصلاحيات", subtitle: "الأدوار والواجبات وضوابط العمل المشترك", page: 2 },
      { title: "إجراءات التطبيق والمتابعة الرقابية", subtitle: "المطابقة الميدانية ومعايير قياس الالتزام", page: 3 },
      { title: "إدارة السجلات والتقارير والتحسين المستمر", subtitle: "الأرشفة الدورية ومراجعات لجان الحوكمة", page: 4 },
    ],
  };
}

function isPdf(url: string | null | undefined) {
  return Boolean(url && /\.pdf(?:$|[?#])/i.test(url));
}

function isNewDocument(publishedAt: Date | string) {
  return Date.now() - new Date(publishedAt).getTime() <= NEW_DOCUMENT_WINDOW_MS;
}

function PdfReader({
  preview,
  onDownload,
  isDownloading,
}: {
  preview: PreviewDocument;
  onDownload: () => void;
  isDownloading: boolean;
}) {
  const readerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [readerSize, setReaderSize] = useState({ width: 0, height: 0 });
  const [pageAspectRatio, setPageAspectRatio] = useState(Math.SQRT2);
  const [loadError, setLoadError] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [activeTab, setActiveTab] = useState<"reader" | "outline">("reader");

  const meta = useMemo(() => parseDocumentMeta(preview), [preview]);

  // Reset state cleanly whenever the previewed document changes
  useEffect(() => {
    setPageNumber(1);
    setActiveTab("reader");
    setLoadError(false);
    setZoomScale(1);
  }, [preview.id, preview.url]);

  useEffect(() => {
    const element = readerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setReaderSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Ensure reader size is recalculated when switching to reader tab
  useEffect(() => {
    if (activeTab === "reader" && readerRef.current) {
      const rect = readerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setReaderSize({
          width: rect.width,
          height: rect.height,
        });
      }
    }
  }, [activeTab]);

  const availableWidth = Math.max(readerSize.width - 32, 220);
  const availableHeight = Math.max(readerSize.height - 32, 280);
  const basePageWidth = Math.floor(Math.min(availableWidth, availableHeight / pageAspectRatio));
  const pageWidth = Math.round(basePageWidth * zoomScale);
  const previewUrl = preview.url || `/api/documents/${preview.id}/preview`;

  const changePage = (direction: number) => {
    const total = pageCount > 0 ? pageCount : (meta.pages > 0 ? meta.pages : 1);
    setPageNumber(current => Math.min(Math.max(current + direction, 1), total));
  };

  const jumpToPage = (target: number) => {
    const total = pageCount > 0 ? pageCount : (meta.pages > 0 ? meta.pages : 100);
    const safePage = Math.min(Math.max(target, 1), total);
    setPageNumber(safePage);
    setActiveTab("reader");
  };

  const adjustZoom = (delta: number) => {
    setZoomScale(current => {
      const next = Math.round((current + delta) * 10) / 10;
      return Math.min(Math.max(next, 0.7), 1.8);
    });
  };

  const resetZoom = () => setZoomScale(1);

  return (
    <div className="mt-2 space-y-4">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#d9c995] bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Navigation & Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl bg-[#f3efe2] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("reader")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeTab === "reader" ? "bg-[#155029] text-white shadow-xs" : "text-[#155029] hover:bg-white/60"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              المعاينة التفاعلية
            </button>
            {meta.sectionsOutline && meta.sectionsOutline.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("outline")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "outline" ? "bg-[#155029] text-white shadow-xs" : "text-[#155029] hover:bg-white/60"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                فهرس ومسارات الإجراء ({meta.sectionsOutline.length})
              </button>
            )}
          </div>

          {activeTab === "reader" && (
            <div className="flex items-center gap-1 rounded-xl border border-[#cdbb86] bg-white px-2 py-1">
              <button
                type="button"
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#155029] transition-colors hover:bg-[#f8edd0] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="الصفحة السابقة"
                title="الصفحة السابقة"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="min-w-24 text-center text-xs font-extrabold text-[#155029]">
                صفحة {pageNumber} من {pageCount || meta.pages || "—"}
              </span>
              <button
                type="button"
                onClick={() => changePage(1)}
                disabled={!pageCount || pageNumber >= pageCount}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#155029] transition-colors hover:bg-[#f8edd0] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="الصفحة التالية"
                title="الصفحة التالية"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Zoom & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "reader" && (
            <div className="flex items-center gap-1 rounded-xl border border-[#cdbb86] bg-white px-2 py-1">
              <button
                type="button"
                onClick={() => adjustZoom(-0.15)}
                disabled={zoomScale <= 0.75}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#155029] hover:bg-[#f8edd0] disabled:opacity-40"
                title="تصغير"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="px-2 text-xs font-extrabold text-[#155029] hover:text-[#a67017]"
                title="إعادة ضبط الحجم"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => adjustZoom(0.15)}
                disabled={zoomScale >= 1.75}
                className="grid h-7 w-7 place-items-center rounded-lg text-[#155029] hover:bg-[#f8edd0] disabled:opacity-40"
                title="تكبير"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onDownload}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#cdbb86] bg-white px-3.5 text-xs font-bold text-[#155029] transition-colors hover:bg-[#f8edd0]"
            title="فتح في علامة تبويب جديدة"
          >
            <span>نافذة مستقلة</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#155029] px-4 text-xs font-bold text-white transition-colors hover:bg-[#10461f] disabled:cursor-wait disabled:opacity-70"
          >
            {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            <span>تحميل PDF</span>
          </button>
        </div>
      </div>

      {/* Main View Area: Document Reader Container (Kept in DOM to preserve loaded state & speed) */}
      <div
        ref={readerRef}
        className={`relative flex h-[62dvh] min-h-80 max-h-[44rem] items-center justify-center overflow-auto rounded-2xl border border-[#d9c995] bg-[#e6ede0] p-3 sm:h-[66dvh] sm:min-h-[30rem] sm:p-4 ${
          activeTab === "reader" ? "" : "hidden"
        }`}
      >
        <Document
          file={previewUrl}
          onLoadSuccess={({ numPages }) => {
            setPageCount(numPages);
            // Preserve pageNumber if it is already set to a valid target page from outline jump
            setPageNumber(current => {
              if (current >= 1 && current <= numPages) {
                return current;
              }
              return 1;
            });
            setLoadError(false);
          }}
          onLoadError={error => {
            console.error("[PDF Preview] تعذر تحميل الوثيقة", { documentId: preview.id, error });
            setLoadError(true);
          }}
          onSourceError={error => {
            console.error("[PDF Preview] تعذر الوصول إلى مصدر الوثيقة", { documentId: preview.id, error });
            setLoadError(true);
          }}
          loading={
            <div className="grid min-h-72 place-items-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#155029]" />
              <p className="mt-3 text-xs font-bold text-[#155029]">جارٍ تهيئة صفحات الوثيقة...</p>
            </div>
          }
          error={null}
        >
          {!loadError && readerSize.width > 0 && (
            <div className="flex justify-center p-2">
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                onLoadSuccess={page => {
                  const [left, bottom, right, top] = page.view;
                  const width = right - left;
                  const height = top - bottom;
                  if (width > 0 && height > 0) setPageAspectRatio(height / width);
                }}
                renderTextLayer
                renderAnnotationLayer
                className="overflow-hidden rounded-lg shadow-[0_12px_32px_rgba(22,91,42,0.18)]"
              />
            </div>
          )}
        </Document>

        {loadError && (
          <div className="grid min-h-72 place-items-center px-6 text-center">
            <FileText className="h-10 w-10 text-[#a67017]" />
            <p className="mt-3 text-sm font-bold text-[#155029]">تعذرت المعاينة المباشرة داخل المتصفح.</p>
            <p className="mt-2 text-xs leading-6 text-[#617b68]">
              يمكنك فتح الملف مباشرة أو تنزيله وقراءته على جهازك بكل سهولة.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onDownload}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#155029] px-4 text-xs font-bold text-white hover:bg-[#10461f]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                فتح الرابط المباشر
              </a>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#cdbb86] bg-white px-4 text-xs font-bold text-[#155029] hover:bg-[#f8edd0]"
              >
                <Download className="h-3.5 w-3.5" />
                تحميل الملف
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Outline & Architecture Tab (Kept in DOM and toggled for instantaneous switching) */}
      <div
        className={`h-[62dvh] min-h-80 max-h-[44rem] overflow-y-auto rounded-2xl border border-[#d9c995] bg-white p-4 sm:p-6 ${
          activeTab === "outline" ? "" : "hidden"
        }`}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#ebdcb3] pb-4">
          <div>
            <span className="font-mono text-xs font-extrabold text-[#a67017]">{meta.code}</span>
            <h4 className="display-font text-lg font-bold text-[#155029]">{preview.title}</h4>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${meta.classification.badgeClass}`}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {meta.classification.label}
          </span>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#e4dcbf] bg-[#fbf9f2] p-3">
            <span className="text-[11px] font-bold text-[#627e6a]">الإصدار والاعتماد</span>
            <p className="mt-1 font-mono text-sm font-extrabold text-[#155029]">
              {meta.version} — {meta.effectiveDate}
            </p>
          </div>
          <div className="rounded-xl border border-[#e4dcbf] bg-[#fbf9f2] p-3">
            <span className="text-[11px] font-bold text-[#627e6a]">السياسات المرجعية</span>
            <p className="mt-1 text-xs font-bold text-[#155029]">{meta.referencePolicy || "معتمدة لدى الجمعية"}</p>
          </div>
          <div className="rounded-xl border border-[#e4dcbf] bg-[#fbf9f2] p-3">
            <span className="text-[11px] font-bold text-[#627e6a]">النماذج المرتبطة</span>
            <p className="mt-1 text-xs font-bold text-[#155029]">{meta.relatedForms || "نماذج الإفصاح الموحدة"}</p>
          </div>
          <div className="rounded-xl border border-[#e4dcbf] bg-[#fbf9f2] p-3">
            <span className="text-[11px] font-bold text-[#627e6a]">إجمالي الصفحات المعتمدة</span>
            <p className="mt-1 text-sm font-extrabold text-[#155029]">{pageCount || meta.pages} صفحات رسمية</p>
          </div>
        </div>

        {/* Operational Tracks */}
        {meta.operationalTracks && meta.operationalTracks.length > 0 && (
          <div className="mt-5">
            <h5 className="text-xs font-extrabold text-[#155029]">
              المسارات والنماذج التشغيلية المرتبطة:
            </h5>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {meta.operationalTracks.map((track, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c4dcbc] bg-[#eff7ed] px-3 py-1 text-xs font-bold text-[#155029]"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#1b7337]" />
                  {track}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Pages Directory List */}
        {meta.sectionsOutline && meta.sectionsOutline.length > 0 && (
          <div className="mt-6">
            <h5 className="text-xs font-extrabold text-[#155029]">فهرس أقسام ومسارات الوثيقة — انتقل مباشرة لأي صفحة:</h5>
            <div className="mt-3 space-y-2.5">
              {meta.sectionsOutline.map((sec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => jumpToPage(sec.page)}
                  className="group flex w-full items-center justify-between rounded-xl border border-[#e3d7b4] bg-[#fdfcf7] p-3 text-right transition-all hover:border-[#155029] hover:bg-[#f3f9f0] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#155029] text-xs font-bold text-white transition-colors group-hover:bg-[#a67017]">
                      {sec.page}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#155029] transition-colors group-hover:text-[#10461f]">
                        {sec.title}
                      </p>
                      <p className="text-xs text-[#627e6a]">{sec.subtitle}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#a67017] group-hover:underline">
                    معاينة الصفحة {sec.page}
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Page Thumbnails Bar (Fast switcher) */}
      {(pageCount > 1 || meta.pages > 1) && (
        <div className="flex items-center justify-between rounded-xl border border-[#d9c995] bg-white px-3 py-2 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="shrink-0 font-bold text-[#55755e]">الانتقال السريع:</span>
            {Array.from({ length: Math.min(pageCount || meta.pages, 12) }).map((_, idx) => {
              const p = idx + 1;
              const isActive = pageNumber === p && activeTab === "reader";
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => jumpToPage(p)}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-bold transition-all ${
                    isActive
                      ? "bg-[#155029] text-white shadow-xs"
                      : "border border-[#cdbb86] text-[#155029] hover:bg-[#f8edd0]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {(pageCount || meta.pages) > 12 && (
              <span className="shrink-0 text-[11px] text-[#6e8976]">
                ... من إجمالي {pageCount || meta.pages} صفحة
              </span>
            )}
          </div>
          <span className="hidden shrink-0 text-[11px] text-[#6e8976] sm:inline">
            {meta.classification.description}
          </span>
        </div>
      )}
    </div>
  );
}

export default function GovernanceLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "manual" | "policy" | "sop" | "strategy" | "annual_report">("all");
  const [classificationFilter, setClassificationFilter] = useState<"all" | "restricted" | "internal" | "public">("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "downloads" | "title">("newest");
  const [preview, setPreview] = useState<PreviewDocument | null>(null);

  const utils = trpc.useUtils();
  const documents = trpc.content.publicList.useQuery();
  const items = useMemo(() => {
    const fetched = (documents.data ?? []).filter(item => item.type === "document");
    return fetched.length > 0 ? fetched : FALLBACK_GOVERNANCE_DOCS;
  }, [documents.data]);

  // Extract available years
  const years = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map(item => item.documentYear)
          .filter((y): y is number => typeof y === "number")
      )
    ).sort((a, b) => b - a);
  }, [items]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: items.length, manual: 0, policy: 0, sop: 0, strategy: 0, annual_report: 0 };
    items.forEach(item => {
      const meta = parseDocumentMeta(item);
      if (counts[meta.categoryGroup] !== undefined) {
        counts[meta.categoryGroup]++;
      }
    });
    return counts;
  }, [items]);

  // Filtered & Sorted items
  const filteredAndSortedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = items.filter(item => {
      const meta = parseDocumentMeta(item);

      // Category filter
      if (categoryFilter !== "all" && meta.categoryGroup !== categoryFilter) {
        return false;
      }

      // Classification filter
      if (classificationFilter !== "all" && meta.classification.tag !== classificationFilter) {
        return false;
      }

      // Year filter
      if (yearFilter !== "all" && item.documentYear !== Number(yearFilter)) {
        return false;
      }

      // Search query
      if (q) {
        const titleMatch = item.title.toLowerCase().includes(q);
        const summaryMatch = (item.summary || "").toLowerCase().includes(q);
        const bodyMatch = (item.body || "").toLowerCase().includes(q);
        const codeMatch = meta.code.toLowerCase().includes(q);
        const yearMatch = String(item.documentYear || "").includes(q);
        const classMatch = meta.classification.label.toLowerCase().includes(q);
        const tracksMatch = (meta.operationalTracks || []).some(t => t.toLowerCase().includes(q));

        if (!titleMatch && !summaryMatch && !bodyMatch && !codeMatch && !yearMatch && !classMatch && !tracksMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "downloads") {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "ar");
      }
      if (sortBy === "oldest") {
        const aYear = a.documentYear || 0;
        const bYear = b.documentYear || 0;
        if (aYear !== bYear) return aYear - bYear;
        const aDate = new Date(a.publishedAt || 0).getTime();
        const bDate = new Date(b.publishedAt || 0).getTime();
        return aDate - bDate;
      }
      // "newest" is default
      const aYear = a.documentYear || 0;
      const bYear = b.documentYear || 0;
      if (aYear !== bYear) return bYear - aYear;
      const aDate = new Date(a.publishedAt || 0).getTime();
      const bDate = new Date(b.publishedAt || 0).getTime();
      return bDate - aDate;
    });
  }, [items, searchQuery, categoryFilter, classificationFilter, yearFilter, sortBy]);

  const recordDownload = trpc.content.recordDocumentDownload.useMutation({
    onSuccess: () => utils.content.publicList.invalidate(),
  });

  const downloadDocument = (id: number, url: string) => {
    recordDownload.mutate({ id });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const hasActiveFilters = searchQuery !== "" || categoryFilter !== "all" || classificationFilter !== "all" || yearFilter !== "all" || sortBy !== "newest";

  const resetAllFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setClassificationFilter("all");
    setYearFilter("all");
    setSortBy("newest");
  };

  const documentCard = (item: (typeof items)[number]) => {
    const meta = parseDocumentMeta(item);
    const canPreview = isPdf(item.imageUrl);
    const Icon =
      meta.categoryGroup === "annual_report"
        ? FileBarChart2
        : meta.categoryGroup === "manual"
        ? BookOpen
        : meta.categoryGroup === "strategy"
        ? Layers
        : meta.isSop
        ? FileCheck2
        : ShieldCheck;

    return (
      <article
        key={item.id}
        className="group relative flex flex-col justify-between overflow-hidden rounded-bl-[2.8rem] rounded-tr-[2.8rem] border border-[#d9c995] bg-white p-6 shadow-[0_12px_28px_rgba(22,91,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#155029]/50 hover:shadow-[0_20px_36px_rgba(22,91,42,0.12)] sm:p-7"
      >
        {/* Background Accent Curve */}
        <div className="absolute left-0 top-0 h-24 w-24 rounded-br-[4rem] bg-[#e8f0df]/70" aria-hidden="true" />

        <div>
          {/* Card Header: Icon, Code, Classification, New Badge */}
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#155029] text-[#f2cd78] shadow-sm transition-transform group-hover:scale-105">
              <Icon className="h-6 w-6" />
            </span>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {isNewDocument(item.publishedAt) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f2cd78] px-3 py-1 text-xs font-extrabold text-[#155029] shadow-xs">
                  <Sparkles className="h-3 w-3" />
                  جديد
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-extrabold ${meta.classification.badgeClass}`}
                title={meta.classification.description}
              >
                <ShieldCheck className="h-3 w-3" />
                {meta.classification.label}
              </span>
            </div>
          </div>

          {/* Badges Bar: Document Code, Type, Year */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-[#f0eedf] px-2.5 py-1 font-mono text-xs font-extrabold text-[#155029]">
              {meta.code}
            </span>
            <span className="rounded-lg bg-[#f8edd0] px-2.5 py-1 text-xs font-bold text-[#8d6118]">
              {meta.typeLabel}
            </span>
            {item.documentYear && (
              <span className="rounded-lg bg-[#e8f0df] px-2.5 py-1 text-xs font-bold text-[#155029]">
                إصدار {item.documentYear}
              </span>
            )}
            {meta.pages > 1 && (
              <span className="rounded-lg bg-[#f3efe2] px-2 py-1 text-[11px] font-bold text-[#6a8772]">
                {meta.pages} صفحات
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="display-font mt-3.5 text-xl font-bold leading-8 text-[#155029] transition-colors group-hover:text-[#10461f]">
            {item.title}
          </h3>

          {/* Summary */}
          <p className="mt-2.5 text-sm leading-7 text-[#587360]">{item.summary}</p>

          {/* Operational Tracks or SOP Key Points */}
          {meta.operationalTracks && meta.operationalTracks.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#e8dfc3] bg-[#fbf9f2] p-3 text-xs">
              <span className="font-bold text-[#155029]">المسارات والنماذج المرتبطة:</span>
              <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                {meta.operationalTracks.slice(0, 4).map((t, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#506c58]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#a67017]" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Card Footer: Download Count & Action Buttons */}
        <div className="mt-6 border-t border-[#ebdcb3] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#66816d]"
              title="عدد مرات التحميل الفعلية المعتمدة"
            >
              <Download className="h-3.5 w-3.5 text-[#a67017]" />
              {(item.downloadCount || 0).toLocaleString("ar-SA")} تحميل
            </span>

            {item.imageUrl ? (
              <div className="flex w-full items-center gap-2 sm:w-auto">
                {canPreview && (
                  <button
                    type="button"
                    onClick={() =>
                      setPreview({
                        id: item.id,
                        title: item.title,
                        url: item.imageUrl!,
                        year: item.documentYear,
                        summary: item.summary,
                        body: item.body,
                        documentCategory: item.documentCategory,
                      })
                    }
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#cdbb86] bg-[#fdfcf7] px-4 text-xs font-bold text-[#155029] transition-all hover:bg-[#f8edd0] hover:border-[#155029]"
                    aria-label={`استعراض ${item.title}`}
                  >
                    <Eye className="h-4 w-4 text-[#a67017]" />
                    <span>استعراض الوثيقة</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => downloadDocument(item.id, item.imageUrl!)}
                  disabled={recordDownload.isPending}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#155029] px-4 text-xs font-bold text-white transition-colors hover:bg-[#10461f] disabled:cursor-wait disabled:opacity-70 sm:flex-none"
                >
                  <Download className="h-4 w-4" />
                  <span>تحميل PDF</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78907d]">
                <FileText className="h-4 w-4" />
                ملف قيد الإتاحة
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section id="الوثائق" className="route-map relative isolate overflow-hidden bg-[#f3f1e4] py-16 sm:py-20 lg:py-28">
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="border-b border-[#d9c995] pb-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="section-label">مكتبة الثقة والحوكمة</p>
              <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">
                وثائق وإجراءات حوكمة تُقرأ وتُفرز بوضوح.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-[#5b7562]">
                تصفّح الإجراءات التشغيلية المعيارية (SOP)، لوائح الحوكمة، والتقارير السنوية المعتمدة. استخدم أدوات
                الفرز والبحث المباشر لاستعراض الملفات ومعاينتها فورياً أو تحميلها مباشرة.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 rounded-2xl border border-[#d9c995] bg-white/70 p-3 text-xs font-bold text-[#155029] backdrop-blur-xs">
              <ShieldCheck className="h-5 w-5 text-[#a67017]" />
              <div>
                <p className="text-sm font-extrabold">{items.length} وثيقة معتمدة</p>
                <p className="text-[11px] text-[#63806c]">محدّثة وفق دورة الحوكمة 2026</p>
              </div>
            </div>
          </div>

          {/* Quick Category Tabs Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                categoryFilter === "all"
                  ? "bg-[#155029] text-white shadow-sm"
                  : "border border-[#cdbb86] bg-white text-[#155029] hover:bg-[#f8edd0]"
              }`}
            >
              <span>جميع الوثائق</span>
              <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${categoryFilter === "all" ? "bg-white/20 text-white" : "bg-[#f3efe2] text-[#155029]"}`}>
                {categoryCounts.all}
              </span>
            </button>

            {categoryCounts.manual > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("manual")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  categoryFilter === "manual"
                    ? "bg-[#155029] text-white shadow-sm"
                    : "border border-[#cdbb86] bg-white text-[#155029] hover:bg-[#f8edd0]"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>الأدلة واللوائح المؤسسية</span>
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${categoryFilter === "manual" ? "bg-white/20 text-white" : "bg-[#f3efe2] text-[#155029]"}`}>
                  {categoryCounts.manual}
                </span>
              </button>
            )}

            {categoryCounts.policy > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("policy")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  categoryFilter === "policy"
                    ? "bg-[#155029] text-white shadow-sm"
                    : "border border-[#cdbb86] bg-white text-[#155029] hover:bg-[#f8edd0]"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>السياسات المعتمدة (POL)</span>
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${categoryFilter === "policy" ? "bg-white/20 text-white" : "bg-[#f3efe2] text-[#155029]"}`}>
                  {categoryCounts.policy}
                </span>
              </button>
            )}

            {categoryCounts.sop > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("sop")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  categoryFilter === "sop"
                    ? "bg-[#155029] text-white shadow-sm"
                    : "border border-[#cdbb86] bg-white text-[#155029] hover:bg-[#f8edd0]"
                }`}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>الإجراءات المعيارية (SOP)</span>
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${categoryFilter === "sop" ? "bg-white/20 text-white" : "bg-[#f3efe2] text-[#155029]"}`}>
                  {categoryCounts.sop}
                </span>
              </button>
            )}

            {categoryCounts.strategy > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("strategy")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  categoryFilter === "strategy"
                    ? "bg-[#155029] text-white shadow-sm"
                    : "border border-[#cdbb86] bg-white text-[#155029] hover:bg-[#f8edd0]"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>الخطط والملفات الاستراتيجية</span>
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${categoryFilter === "strategy" ? "bg-white/20 text-white" : "bg-[#f3efe2] text-[#155029]"}`}>
                  {categoryCounts.strategy}
                </span>
              </button>
            )}

            {categoryCounts.annual_report > 0 && (
              <button
                type="button"
                onClick={() => setCategoryFilter("annual_report")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  categoryFilter === "annual_report"
                    ? "bg-[#155029] text-white shadow-sm"
                    : "border border-[#cdbb86] bg-white text-[#155029] hover:bg-[#f8edd0]"
                }`}
              >
                <FileBarChart2 className="h-3.5 w-3.5" />
                <span>التقارير السنوية</span>
                <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] ${categoryFilter === "annual_report" ? "bg-white/20 text-white" : "bg-[#f3efe2] text-[#155029]"}`}>
                  {categoryCounts.annual_report}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Sorting & Filtering Controls Bar */}
        <div className="mt-8 grid gap-4 rounded-3xl border border-[#d9c995] bg-white/80 p-4 shadow-sm backdrop-blur-xs sm:p-5 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:items-end">
          {/* Instant Search Field */}
          <div>
            <label className="grid gap-1.5 text-xs font-bold text-[#456651]">
              البحث في الوثائق والإجراءات
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث بالاسم، رمز الوثيقة (SOP, BCM, COM)، أو الكلمة..."
                  className="h-11 w-full rounded-full border border-[#cdbb86] bg-white pr-10 pl-9 text-sm text-[#155029] outline-none transition-all placeholder:text-[#8ea494] focus:border-[#155029] focus:ring-2 focus:ring-[#155029]/10"
                />
                <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ea494]" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#8ea494] hover:bg-[#f3efe2] hover:text-[#155029]"
                    title="مسح البحث"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </label>
          </div>

          {/* Sort By Filter ("فرز الملفات") */}
          <div>
            <label className="grid gap-1.5 text-xs font-bold text-[#456651]">
              <span className="flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5 text-[#a67017]" />
                فرز الوثائق حسب
              </span>
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value as typeof sortBy)}
                className="h-11 w-full rounded-full border border-[#cdbb86] bg-white px-4 text-xs font-bold text-[#155029] outline-none transition-all focus:border-[#155029]"
              >
                <option value="newest">الأحدث إصداراً (الافتراضي)</option>
                <option value="downloads">الأكثر تحميلاً</option>
                <option value="title">أبجدياً بحسب العنوان (أ - ي)</option>
                <option value="oldest">الأقدم إصداراً</option>
              </select>
            </label>
          </div>

          {/* Classification Filter (درجة السرية والتصنيف) */}
          <div>
            <label className="grid gap-1.5 text-xs font-bold text-[#456651]">
              <span className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-[#a67017]" />
                تصنيف الوثيقة
              </span>
              <select
                value={classificationFilter}
                onChange={event => setClassificationFilter(event.target.value as typeof classificationFilter)}
                className="h-11 w-full rounded-full border border-[#cdbb86] bg-white px-4 text-xs font-bold text-[#155029] outline-none transition-all focus:border-[#155029]"
              >
                <option value="all">كل مستويات التصنيف</option>
                <option value="restricted">مقيد (RES)</option>
                <option value="internal">داخلي (INT)</option>
                <option value="public">عام (PUB)</option>
              </select>
            </label>
          </div>

          {/* Year Filter (سنة الإصدار) */}
          <div>
            <label className="grid gap-1.5 text-xs font-bold text-[#456651]">
              سنة الإصدار
              <select
                value={yearFilter}
                onChange={event => setYearFilter(event.target.value)}
                className="h-11 w-full rounded-full border border-[#cdbb86] bg-white px-4 text-xs font-bold text-[#155029] outline-none transition-all focus:border-[#155029]"
              >
                <option value="all">كل السنوات المعتمدة</option>
                {years.map(value => (
                  <option key={value} value={value}>
                    إصدار عام {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Results Bar & Active Filters */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-[#a67017]">
              {filteredAndSortedItems.length}{" "}
              {filteredAndSortedItems.length === 1 ? "وثيقة مطابقة" : "وثائق مطابقة"}
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f3efe2] px-2.5 py-0.5 text-xs font-bold text-[#155029]">
                البحث: &quot;{searchQuery}&quot;
              </span>
            )}

            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f3efe2] px-2.5 py-0.5 text-xs font-bold text-[#155029]">
                النوع: {categoryFilter === "sop" ? "إجراءات تشغيلية" : "تقارير سنوية"}
              </span>
            )}

            {classificationFilter !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f3efe2] px-2.5 py-0.5 text-xs font-bold text-[#155029]">
                التصنيف: {classificationFilter === "restricted" ? "مقيد" : classificationFilter === "internal" ? "داخلي" : "عام"}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#a67017] transition-colors hover:text-[#155029] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              إعادة ضبط جميع الفلاتر
            </button>
          )}
        </div>

        {/* Documents Grid */}
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {documents.isLoading ? (
            <div className="col-span-full grid min-h-60 place-items-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#a67017]" />
            </div>
          ) : filteredAndSortedItems.length ? (
            filteredAndSortedItems.map(item => documentCard(item))
          ) : (
            <div className="col-span-full rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#c9b978] bg-white/70 px-6 py-14 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-[#a67017]" />
              <h3 className="display-font mt-4 text-xl font-bold text-[#155029]">لا توجد وثائق مطابقة لخيارات الفرز الحالية</h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#617b68]">
                جرّب تعديل كلمات البحث، أو تغيير مستوى التصنيف أو سنة الإصدار للوصول إلى الوثائق المطلوبة.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#155029] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#10461f]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                عرض جميع الوثائق
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Preview Dialog */}
      <Dialog
        open={Boolean(preview)}
        onOpenChange={open => {
          if (!open) setPreview(null);
        }}
      >
        <DialogContent
          className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-[1.8rem] border-[#d9c995] bg-[#fbf8ed] p-3 sm:w-[min(94vw,76rem)] sm:max-w-[min(94vw,76rem)] sm:rounded-2xl sm:p-6"
          dir="rtl"
        >
          <DialogHeader className="text-right">
            <div className="flex flex-wrap items-center justify-between gap-2 pl-8">
              <DialogTitle className="display-font text-xl font-extrabold text-[#155029] sm:text-2xl">
                معاينة واستعراض الوثيقة
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm font-bold text-[#55755e]">
              {preview?.title}
            </DialogDescription>
          </DialogHeader>

          {preview && (
            <PdfReader
              preview={preview}
              onDownload={() => downloadDocument(preview.id, preview.url)}
              isDownloading={recordDownload.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
