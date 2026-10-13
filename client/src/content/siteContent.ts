/**
 * محتوى موقع الجمعية التعاونية الزراعية للتطوير والاستدامة.
 * نبرة المحتوى: عملية، دافئة، قائمة على الشراكة والأثر المستدام.
 */
import {
  BadgeCheck,
  BookOpenCheck,
  Droplets,
  Handshake,
  Leaf,
  Sprout,
  Tractor,
  Trees,
  UsersRound,
} from "lucide-react";

export const objectives = [
  {
    number: "01",
    title: "تنمية زراعية مسؤولة",
    description:
      "دعم ممارسات إنتاجية تحافظ على خصوبة الأرض وتوازن بين العائد الاقتصادي وسلامة البيئة.",
    Icon: Sprout,
  },
  {
    number: "02",
    title: "إدارة واعية للمياه",
    description:
      "تعزيز كفاءة استخدام الموارد المائية ونشر الحلول التي تخدم استدامة الإنتاج الزراعي.",
    Icon: Droplets,
  },
  {
    number: "03",
    title: "تمكين المزارعين",
    description:
      "فتح مسارات للتدريب وتبادل الخبرات والربط بين المعرفة التطبيقية واحتياجات الميدان.",
    Icon: UsersRound,
  },
  {
    number: "04",
    title: "قيمة محلية مشتركة",
    description:
      "بناء شراكات تعاونية تعزز جودة المنتجات وفرص التنمية في المجتمعات الزراعية.",
    Icon: Handshake,
  },
];

export const activities = [
  {
    title: "الإرشاد والتدريب الزراعي",
    description:
      "ورش ميدانية ومسارات تعلم عملية تساعد على اتخاذ قرارات زراعية أكثر وعيًا وكفاءة.",
    Icon: BookOpenCheck,
    image: "/manus-storage/acsd-saudi-agricultural-training_10c43a6c.jpg",
  },
  {
    title: "مبادرات كفاءة المياه",
    description:
      "تشجيع التقنيات والممارسات التي تجعل كل قطرة موردًا منتجًا ضمن المنظومة الزراعية.",
    Icon: Droplets,
    image: "/manus-storage/acsd-water-stewardship_ed239526.jpg",
  },
  {
    title: "التشجير وحماية الموارد",
    description:
      "برامج تعزز الغطاء النباتي وتحافظ على التربة وتدعم بيئة زراعية أكثر توازنًا.",
    Icon: Trees,
    image: "/manus-storage/acsd-hero-terraced-fields_8e549636.jpg",
  },
];

export const focusAreas = [
  { label: "التطوير الزراعي", Icon: Tractor },
  { label: "الاستدامة البيئية", Icon: Leaf },
  { label: "الجودة والمعرفة", Icon: BadgeCheck },
];

export const navigationItems = [
  { label: "الرئيسية", href: "/" },
  { label: "عن الجمعية", href: "/about" },
  { label: "الأخبار", href: "/news" },
  { label: "الفعاليات", href: "/events" },
  { label: "الحوكمة والشفافية", href: "/governance" },
  { label: "استبيان الرأي", href: "/survey" },
  { label: "اتصل بنا", href: "/contact" },
];

