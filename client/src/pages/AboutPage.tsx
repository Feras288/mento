import BackToTop from "@/components/BackToTop";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { shareholdersList } from "@/data/shareholders";
import {
  ArrowLeft,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Compass,
  Copy,
  CreditCard,
  FileText,
  Handshake,
  Layers,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Tractor,
  Trees,
  TrendingUp,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const logoUrl = "/images/darb/acsd_logo.png";
const chairPhotoUrl = "/images/darb/chairman_abdulrahman_azran.jpeg";

// 6 Statutory Objectives from darb.org.sa
const statutoryObjectives = [
  {
    num: "01",
    title: "إنشاء المشاريع الزراعية",
    desc: "إطلاق وتطوير مشاريع زراعية نوعية ومستدامة تسهم في رفع الكفاءة الإنتاجية واستثمار الموارد الزراعية بكفاءة عالية.",
    badge: "تنمية إنتاجية",
    Icon: Tractor,
  },
  {
    num: "02",
    title: "عمل البيوت المحمية للخضار والفواكه",
    desc: "تبني وتطوير تقنيات البيوت المحمية الحديثة لإنتاج الخضار والفواكه على مدار العام وترشيد استخدام المياه بنظم متقدمة.",
    badge: "زراعة حديثة",
    Icon: Sprout,
  },
  {
    num: "03",
    title: "مشاريع حيوانية متخصصة",
    desc: "تنفيذ مشاريع إنتاج حيواني تخصصية تشمل المواشي، الأغنام، والدواجن؛ بما يعزز منظومة الأمن الغذائي المحلي.",
    badge: "ثروة حيوانية",
    Icon: Trees,
  },
  {
    num: "04",
    title: "دورات وورش عمل إرشادية",
    desc: "تنظيم برامج تدريبية وتأهيلية ميدانية مستمرة للأعضاء والمزارعين لإرشادهم بأحدث ممارسات الزراعة الحديثة والإدارة الرشيدة.",
    badge: "إرشاد وتأهيل",
    Icon: UsersRound,
  },
  {
    num: "05",
    title: "شراكات استراتيجية مع القطاع الخاص",
    desc: "بناء تحالفات استثمارية وشراكات تمويلية ومساهمات تنموية فاعلة مع القطاع الخاص لتعظيم القيمة المضافة للمشاريع.",
    badge: "استثمار وشراكة",
    Icon: Handshake,
  },
  {
    num: "06",
    title: "تأمين المعدات والمدخلات بأسعار تشجيعية",
    desc: "تأمين الآلات والمعدات الزراعية والبذور المعتمدة والأسمدة للمزارعين بأسعار مخفضة، وفتح منافذ بيع الخضار والفواكه بأسعار مناسبة.",
    badge: "دعم تمويني وتسويق",
    Icon: Building2,
  },
];

// Board of Directors from darb.org.sa
const boardMembers = [
  {
    id: 1,
    name: "عبدالرحمن حسن عبدالله عزران",
    role: "رئيس مجلس الإدارة",
    tag: "القيادة التنفيذية",
    isLeader: true,
  },
  {
    id: 2,
    name: "ولي عبدالله عبده",
    role: "نائب رئيس مجلس الإدارة",
    tag: "نائب الرئيس",
    isLeader: false,
  },
  {
    id: 3,
    name: "محمد حسن آل الهادي",
    role: "أمين الصندوق",
    tag: "الإدارة المالية",
    isLeader: false,
  },
  {
    id: 4,
    name: "سامي ولي عبدالله",
    role: "عضو مجلس الإدارة",
    tag: "عضو المجلس",
    isLeader: false,
  },
  {
    id: 5,
    name: "ندى حسن صديق عزران",
    role: "عضو مجلس الإدارة",
    tag: "عضو المجلس",
    isLeader: false,
  },
];

// Key stats
const aboutStats = [
  { value: "38", label: "مساهم ومساهمة", desc: "سجل المؤسسين المعتمد", Icon: UsersRound },
  { value: "5", label: "سنوات", desc: "مدة دورة مجلس الإدارة", Icon: Calendar },
  { value: "6", label: "أهداف استراتيجية", desc: "مسارات نظامية معتمدة", Icon: Target },
  { value: "100%", label: "حوكمة وامتثال", desc: "نظام الجمعيات التعاونية", Icon: ShieldCheck },
];

export default function AboutPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"cards" | "table">("cards");

  const filteredShareholders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return shareholdersList;
    return shareholdersList.filter((s) => s.name.toLowerCase().includes(q) || s.id.toString() === q);
  }, [searchTerm]);

  const copyIban = () => {
    navigator.clipboard.writeText("SA6405000068202441979000");
    toast.success("تم نسخ رقم الآيبان لحساب الجمعية بنك البلاد بنجاح");
  };

  return (
    <div className="site-shell min-h-screen bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />

      <main>
        {/* ===================== HERO SECTION ===================== */}
        <section className="grain-layer relative isolate overflow-hidden bg-gradient-to-b from-[#f3f0e2] via-[#ece8d4] to-[#fbf8ed] py-14 lg:py-24">
          <div
            className="absolute -left-20 top-8 h-80 w-80 rounded-full border-[28px] border-[#e6bd67]/20"
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[#165B2A]/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="container relative z-10">
            {/* Breadcrumb & Top Badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-[#165B2A]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#165B2A]/20 bg-white/70 px-3.5 py-1.5 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-[#a67017]" />
                محافظة الدرب — منطقة جازان
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e6bd67]/50 bg-[#e6bd67]/15 px-3.5 py-1.5 text-[#8f5d0e] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                جمعية تعاونية سعودية مسجلة رسمياً
              </span>
            </div>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="section-label">عن الجمعية</span>
                <h1 className="display-font mt-4 text-3xl font-extrabold leading-[1.35] text-[#155029] sm:text-5xl lg:text-[3.3rem]">
                  الجمعية التعاونية الزراعية للتطوير والاستدامة
                </h1>
                <p className="mt-3 text-lg font-bold text-[#a67017] sm:text-xl">
                  Agricultural Cooperative for Development and Sustainability (ACSD)
                </p>
                <p className="mt-6 text-base leading-8 text-[#466452] sm:text-lg">
                  كيان تعاوني سعودي مسجل، يقوم على مبدأ الشراكة الحقيقية بين أعضائه ومساهميه، لتحقيق التنمية الزراعية المستدامة وتعظيم القيمة الاقتصادية والاجتماعية لهم وللمجتمع المحلي بمحافظة الدرب ومنطقة جازان، تماشياً مع مستهدفات رؤية المملكة 2030.
                </p>

                {/* Quick Navigation Anchor Links */}
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#من-نحن">
                    <Button className="h-11 rounded-full bg-[#165B2A] px-5 font-bold text-white shadow-md transition-all hover:bg-[#10461f] active:scale-[0.97]">
                      نبذة عن الجمعية <ChevronDown className="mr-1.5 h-4 w-4" />
                    </Button>
                  </a>
                  <a href="#كلمة-رئيس-المجلس">
                    <Button
                      variant="outline"
                      className="h-11 rounded-full border-[#165B2A]/30 bg-white/80 px-5 font-bold text-[#155029] hover:bg-white hover:text-[#165B2A]"
                    >
                      كلمة رئيس مجلس الإدارة
                    </Button>
                  </a>
                  <a href="#أهداف-الجمعية">
                    <Button
                      variant="outline"
                      className="h-11 rounded-full border-[#d9c995] bg-[#f5f1df]/80 px-5 font-bold text-[#775619] hover:bg-white"
                    >
                      الأهداف الستة
                    </Button>
                  </a>
                  <a href="#سجل-المساهمين">
                    <Button
                      variant="outline"
                      className="h-11 rounded-full border-[#e6bd67] bg-[#e6bd67]/15 px-5 font-bold text-[#8f5d0e] hover:bg-[#e6bd67] hover:text-[#155029]"
                    >
                      سجل المساهمين (38)
                    </Button>
                  </a>
                </div>
              </div>

              {/* Logo Presentation Showcase */}
              <div className="relative flex items-center justify-center">
                <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl border-4 border-white bg-white p-6 shadow-[0_25px_60px_rgba(21,91,42,0.18)] ring-8 ring-[#e6bd67]/20 sm:h-84 sm:w-84">
                  <div className="absolute -top-3 -right-3 rounded-full bg-[#165B2A] px-3.5 py-1 text-xs font-bold text-[#e6bd67] shadow">
                    الهوية المعتمدة
                  </div>
                  <img
                    src={logoUrl}
                    alt="شعار الجمعية التعاونية الزراعية للتطوير والاستدامة"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== STICKY JUMP BAR ===================== */}
        <nav
          aria-label="أقسام الصفحة"
          className="sticky top-[4.7rem] z-40 border-y border-[#d9c995]/70 bg-[#fbf8ed]/95 backdrop-blur-md sm:top-[5.4rem]"
        >
          <div className="container flex items-center justify-between overflow-x-auto py-2.5 no-scrollbar">
            <div className="flex min-w-max items-center gap-2 text-xs font-bold sm:text-sm">
              <a
                href="#من-نحن"
                className="rounded-full px-3.5 py-1.5 text-[#315441] transition-colors hover:bg-[#165B2A] hover:text-white"
              >
                نبذة عن الجمعية
              </a>
              <a
                href="#كلمة-رئيس-المجلس"
                className="rounded-full px-3.5 py-1.5 text-[#315441] transition-colors hover:bg-[#165B2A] hover:text-white"
              >
                كلمة رئيس المجلس
              </a>
              <a
                href="#أهداف-الجمعية"
                className="rounded-full px-3.5 py-1.5 text-[#315441] transition-colors hover:bg-[#165B2A] hover:text-white"
              >
                أهداف الجمعية
              </a>
              <a
                href="#مجلس-الإدارة"
                className="rounded-full px-3.5 py-1.5 text-[#315441] transition-colors hover:bg-[#165B2A] hover:text-white"
              >
                مجلس الإدارة
              </a>
              <a
                href="#سجل-المساهمين"
                className="rounded-full px-3.5 py-1.5 text-[#315441] transition-colors hover:bg-[#165B2A] hover:text-white"
              >
                سجل المساهمين
              </a>
              <a
                href="#طريقة-المساهمة"
                className="rounded-full bg-[#e6bd67]/30 px-3.5 py-1.5 text-[#7f5209] transition-colors hover:bg-[#e6bd67] hover:text-[#155029]"
              >
                طريقة المساهمة
              </a>
            </div>
            <a
              href="/contact"
              className="hidden min-w-max text-xs font-bold text-[#165B2A] underline hover:text-[#0f3d1c] lg:block"
            >
              تواصل مع الإدارة ←
            </a>
          </div>
        </nav>

        {/* ===================== KEY STATS COUNTERS ===================== */}
        <section className="border-b border-[#d9c995]/70 bg-[#164A3A] py-10 text-white">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {aboutStats.map(({ value, label, desc, Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[#e6bd67]/50"
                >
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e6bd67] text-[#164A3A] shadow-md">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="display-font mt-4 text-3xl font-extrabold text-[#e6bd67] sm:text-4xl">
                    {value}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">{label}</p>
                  <p className="mt-1 text-xs text-white/75">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SECTION 1: ABOUT (من نحن) ===================== */}
        <section id="من-نحن" className="scroll-mt-32 bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container">
            <div className="max-w-3xl">
              <span className="section-label">من نحن</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                نبذة عن الجمعية التعاونية الزراعية للتطوير والاستدامة
              </h2>
              <p className="mt-3 text-sm font-semibold text-[#a67017]">
                التأسيس، الهوية التعاونية، والمرتكزات الاستراتيجية المعتمدة
              </p>
            </div>

            {/* Official Narrative Cards */}
            <div className="mt-10 grid gap-8 lg:grid-cols-12">
              {/* Main Narrative Column */}
              <div className="space-y-6 lg:col-span-8">
                <div className="rounded-3xl border border-[#d9c995] bg-white p-7 shadow-[0_12px_30px_rgba(22,91,42,0.06)] sm:p-9">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8f0df] text-[#165B2A]">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <h3 className="display-font text-xl font-bold text-[#155029]">
                      الهوية القانونية والرسالة التنموية
                    </h3>
                  </div>

                  <p className="mt-5 text-base leading-8 text-[#3d5a47]">
                    <strong>الجمعية التعاونية الزراعية للتطوير والاستدامة (ACSD)</strong> هي جمعية تعاونية مسجلة في المملكة العربية السعودية، تعمل وفق نظام الجمعيات التعاونية، وتقوم على مبدأ الشراكة بين أعضائها ومساهميها، بهدف تحقيق التنمية الزراعية المستدامة وتعظيم القيمة الاقتصادية والاجتماعية لهم وللمجتمع.
                  </p>

                  <p className="mt-4 text-base leading-8 text-[#3d5a47]">
                    وتعمل الجمعية على تنمية العوائد المستدامة للمساهمين، وتعزيز مشاركتهم في دعم المبادرات التنموية والاستثمارية، من خلال تقديم الحلول والمبادرات التي تسهم في رفع الكفاءة الإنتاجية، وتعزيز القيمة المضافة للمنتجات الزراعية، وتطوير الصناعات التحويلية، ودعم التقنيات الحديثة، بما يواكب مستهدفات التنمية المستدامة.
                  </p>
                </div>

                <div className="rounded-3xl border border-[#d9c995] bg-white p-7 shadow-[0_12px_30px_rgba(22,91,42,0.06)] sm:p-9">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6bd67]/30 text-[#8a5b0d]">
                      <Handshake className="h-5 w-5" />
                    </span>
                    <h3 className="display-font text-xl font-bold text-[#155029]">
                      القيم الحاكمة والشراكات الاستراتيجية
                    </h3>
                  </div>

                  <p className="mt-5 text-base leading-8 text-[#3d5a47]">
                    تؤمن الجمعية بأن <strong>العمل التعاوني</strong> يمثل أحد أهم المحركات لتحقيق التنمية المحلية، ولذلك تعتمد في أعمالها على مبادئ المشاركة، والشفافية، والحوكمة، والمسؤولية المجتمعية، وتعمل على بناء منظومة مؤسسية قادرة على تحقيق الاستدامة المالية والإدارية، وتعزيز الثقة مع جميع أصحاب المصلحة.
                  </p>

                  <p className="mt-4 text-base leading-8 text-[#3d5a47]">
                    كما تسعى الجمعية إلى إقامة شراكات استراتيجية مع الجهات الحكومية والقطاع الخاص والقطاع غير الربحي، بما يسهم في تنمية الموارد، وتبادل الخبرات، واستقطاب الفرص الاستثمارية، ودعم الابتكار في المجالات الزراعية، بما يحقق أثراً تنموياً مستداماً ويعزز مساهمة الجمعية في تحقيق مستهدفات رؤية المملكة العربية السعودية 2030.
                  </p>

                  <div className="mt-6 rounded-2xl border-r-4 border-[#b57c1d] bg-[#f8f5ea] p-4 text-sm leading-7 text-[#5d4615]">
                    <strong>الالتزام المؤسسي:</strong> ومن أهم المحاور التي يرتكز عليها هذا التوجه أن يكون مطابقاً للوائح والأنظمة المعتمدة، وما ورد في وثائق الجمعية الرسمية، بما يضمن الالتزام والحوكمة والوضوح في جميع الأعمال.
                  </div>
                </div>
              </div>

              {/* Sidebar Feature Cards */}
              <div className="space-y-6 lg:col-span-4">
                {/* Investment Arm Card */}
                <div className="rounded-3xl border border-[#d9c995] bg-[#165B2A] p-7 text-white shadow-lg">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-[#e6bd67]">
                    <Sparkles className="h-3.5 w-3.5" />
                    الذراع الاستثماري
                  </span>
                  <h4 className="display-font mt-4 text-xl font-bold">
                    شركة ACSD للتطوير والاستثمار الزراعي
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    تتولى الشركة تنفيذ المبادرات والمشاريع النوعية وتحويل الرؤى والأهداف التعاونية إلى إنجازات استثمارية ملموسة ذات جدوى مستدامة.
                  </p>
                </div>

                {/* Pillars Card */}
                <div className="rounded-3xl border border-[#d9c995] bg-white p-6 shadow-sm">
                  <h4 className="display-font text-base font-bold text-[#155029]">
                    المرتكزات الأربعة للجمعية
                  </h4>
                  <ul className="mt-4 space-y-3 text-xs leading-6 text-[#466452]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#165B2A]" />
                      <span><strong>المشاركة المجتمعية:</strong> إشراك المزارعين والمساهمين في رسم خطط الإنتاج والتطوير.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#165B2A]" />
                      <span><strong>الحوكمة الصارمة:</strong> شفافية مطلقة وإفصاح كامل في كافة المعاملات والقرارات.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#165B2A]" />
                      <span><strong>الاستدامة البيئية:</strong> الحفاظ على المياه والتربة والتحول إلى الطاقة النظيفة.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#165B2A]" />
                      <span><strong>القيمة المضافة:</strong> تطوير الصناعات التحويلية وفتح منافذ تسويق تعاونية.</span>
                    </li>
                  </ul>
                </div>

                {/* Vision 2030 Badge */}
                <div className="rounded-3xl border border-[#e6bd67]/70 bg-gradient-to-br from-[#fbf8ed] to-[#f4ecd2] p-6 text-center">
                  <Award className="mx-auto h-8 w-8 text-[#a67017]" />
                  <p className="mt-3 text-sm font-bold text-[#155029]">
                    مواكبة رؤية السعودية 2030
                  </p>
                  <p className="mt-1 text-xs text-[#6e551c]">
                    تعزيز الأمن الغذائي، تنمية الريف، وتفعيل دور القطاع غير الربحي والتعاوني كرافد تنموي أساسي.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 2: CHAIRMAN SPEECH ===================== */}
        <section
          id="كلمة-رئيس-المجلس"
          className="scroll-mt-32 border-y border-[#ded4b7] bg-gradient-to-b from-[#f3f0e0] to-[#ece7d2] py-20 lg:py-28"
        >
          <div className="container">
            <div className="max-w-3xl">
              <span className="section-label">رسالة القيادة</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                كلمة رئيس مجلس الإدارة
              </h2>
              <p className="mt-2 text-sm font-semibold text-[#a67017]">
                رؤية استراتيجية لبناء منظومة وطنية تجمع بين العمل التعاوني والابتكار
              </p>
            </div>

            <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-center">
              {/* Chairman Photo Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-sm">
                  {/* Decorative Frame */}
                  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#165B2A] to-[#e6bd67] opacity-25 blur-lg" />
                  <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl">
                    <img
                      src={chairPhotoUrl}
                      alt="عبدالرحمن حسن عبدالله عزران - رئيس مجلس إدارة الجمعية التعاونية الزراعية للتطوير والاستدامة"
                      className="h-[28rem] w-full object-cover object-top"
                    />
                    <div className="border-t border-[#e2d8b8] bg-[#fdfcf7] p-5 text-center">
                      <h3 className="display-font text-lg font-bold text-[#155029]">
                        عبدالرحمن بن حسن عزران
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-[#8f5d0e]">
                        رئيس مجلس إدارة الجمعية التعاونية الزراعية للتطوير والاستدامة (ACSD)
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-[#55705d]">
                        <a
                          href="mailto:qzrein21@gmail.com"
                          className="inline-flex items-center gap-1 text-[#165B2A] hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          qzrein21@gmail.com
                        </a>
                        <span>•</span>
                        <a
                          href="tel:0545534428"
                          className="inline-flex items-center gap-1 text-[#165B2A] hover:underline"
                          dir="ltr"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          054 553 4428
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speech Text Content */}
              <div className="lg:col-span-7">
                {/* Main Quote Callout */}
                <blockquote className="display-font rounded-2xl border-r-4 border-[#b57c1d] bg-white/80 p-6 text-xl font-bold leading-relaxed text-[#155029] shadow-sm sm:text-2xl sm:leading-loose">
                  «مستقبل الزراعة لا يُقاس بحجم الإنتاج وحده، بل بقدرة المؤسسات على بناء قيمة مستدامة، وتعزيز الأمن الغذائي، واستثمار الموارد بكفاءة، وإقامة شراكات استراتيجية تُسهم في تحقيق التنمية الاقتصادية والاجتماعية.»
                </blockquote>

                {/* Speech Paragraphs */}
                <div className="mt-6 space-y-4 text-base leading-8 text-[#3d5a47]">
                  <p>
                    <strong>يسرني أن أرحب بكم في الجمعية التعاونية الزراعية للتطوير والاستدامة</strong>، والتي تعكس رؤيتنا لبناء منظومة وطنية متكاملة تجمع بين العمل التعاوني، والاستثمار الزراعي، والابتكار، والاستدامة.
                  </p>
                  <p>
                    انطلقت ACSD من إيمانٍ راسخ بأن مستقبل الزراعة لا يُقاس بحجم الإنتاج وحده، بل بقدرة المؤسسات على بناء قيمة مستدامة، وتعزيز الأمن الغذائي، واستثمار الموارد بكفاءة، وإقامة شراكات استراتيجية تُسهم في تحقيق التنمية الاقتصادية والاجتماعية.
                  </p>
                  <p>
                    وانطلاقاً من هذه الرؤية، تعمل الجمعية على تطوير نموذج مؤسسي حديث يعتمد على الحوكمة، والكفاءة التشغيلية، والاستثمار المستدام، وتتولى <strong>شركة ACSD للتطوير والاستثمار الزراعي</strong>، تنفيذ المبادرات والمشاريع النوعية وتحويل الرؤى إلى إنجازات ملموسة.
                  </p>
                  <p>
                    إننا ننظر إلى المستقبل بثقة، ونسعى إلى بناء شراكات فاعلة مع القطاعين العام والخاص، والمستثمرين، والجهات التمويلية، بما يسهم في تحقيق مستهدفات رؤية المملكة العربية السعودية 2030، ويعزز مكانة القطاع الزراعي بوصفه أحد محركات التنمية المستدامة.
                  </p>
                  <p>
                    وندعو شركاءنا والمستثمرين والمساهمين والجهات ذات العلاقة إلى أن يكونوا جزءاً من هذه المسيرة الطموحة. وفي الختام، نجدد التزامنا بالعمل بروح التعاون، والابتكار، والمسؤولية، لتحقيق أثر اقتصادي واجتماعي وبيئي مستدام، ونتطلع إلى بناء مستقبل أكثر ازدهارًا للأجيال القادمة.
                  </p>
                </div>

                {/* Signature Block */}
                <div className="mt-8 border-t border-[#d5c79e] pt-5">
                  <p className="display-font text-lg font-bold text-[#155029]">
                    عبدالرحمن بن حسن عزران
                  </p>
                  <p className="text-xs font-semibold text-[#8f5d0e]">
                    رئيس مجلس إدارة الجمعية التعاونية الزراعية للتطوير والاستدامة (ACSD)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 3: STATUTORY OBJECTIVES ===================== */}
        <section id="أهداف-الجمعية" className="scroll-mt-32 bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container">
            <div className="max-w-3xl">
              <span className="section-label">خارطة العمل النظامية</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                أهداف الجمعية التعاونية
              </h2>
              <p className="mt-4 text-base leading-8 text-[#516f5d]">
                تهدف الجمعية إلى تحسين حالة أعضائها الاقتصادية والاجتماعية من خلال ستة مسارات عمل نظامية رئيسية:
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {statutoryObjectives.map(({ num, title, desc, badge, Icon }) => (
                <div
                  key={num}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#d9c995] bg-white p-7 shadow-[0_10px_25px_rgba(22,91,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#165B2A] hover:shadow-[0_18px_38px_rgba(22,91,42,0.12)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0df] text-[#165B2A] transition-colors group-hover:bg-[#165B2A] group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#f4ebd0] px-2.5 py-1 text-[0.7rem] font-bold text-[#8a5b0d]">
                          {badge}
                        </span>
                        <span className="display-font text-2xl font-extrabold text-[#a67017]">
                          {num}
                        </span>
                      </div>
                    </div>

                    <h3 className="display-font mt-5 text-xl font-bold text-[#155029]">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#58735f]">{desc}</p>
                  </div>

                  <div className="mt-6 flex items-center gap-2 border-t border-[#f0eedf] pt-4 text-xs font-bold text-[#165B2A]">
                    <CheckCircle2 className="h-4 w-4 text-[#a67017]" />
                    <span>هدف نظامي معتمد</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== SECTION 4: BOARD OF DIRECTORS ===================== */}
        <section
          id="مجلس-الإدارة"
          className="scroll-mt-32 border-t border-[#ded4b7] bg-[#f4f1e3] py-20 lg:py-28"
        >
          <div className="container">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="section-label">الهيكل القيادي</span>
                <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                  أعضاء مجلس الإدارة
                </h2>
                <p className="mt-3 text-sm text-[#5d7764]">
                  قيادة تعاونية معتمدة تعمل وفق نظام الجمعيات التعاونية ولائحة الحوكمة
                </p>
              </div>

              {/* 5-year Term Badge from darb.org.sa */}
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#165B2A]/30 bg-white px-5 py-2.5 text-sm font-bold text-[#165B2A] shadow-sm">
                <Calendar className="h-4 w-4 text-[#a67017]" />
                <span>مدة عضوية أعضاء مجلس الإدارة: <strong>5 سنوات</strong></span>
              </div>
            </div>

            {/* Board Cards Grid */}
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {boardMembers.map((member) => (
                <div
                  key={member.id}
                  className={`relative flex flex-col justify-between rounded-3xl border p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 ${
                    member.isLeader
                      ? "border-[#e6bd67] bg-white ring-2 ring-[#e6bd67]/30 shadow-md"
                      : "border-[#d9c995] bg-white hover:border-[#165B2A]"
                  }`}
                >
                  {member.isLeader && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#165B2A] px-3 py-0.5 text-[0.65rem] font-bold text-[#e6bd67] shadow">
                      رئيس المجلس
                    </span>
                  )}

                  <div>
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#f1eedf] text-[#165B2A]">
                      <UserCheck className="h-7 w-7 text-[#165B2A]" />
                    </span>
                    <span className="mt-4 block text-[0.7rem] font-bold uppercase tracking-wider text-[#a67017]">
                      {member.tag}
                    </span>
                    <h3 className="display-font mt-2 text-base font-bold text-[#155029] sm:text-lg">
                      {member.name}
                    </h3>
                  </div>

                  <div className="mt-5 border-t border-[#f0eedf] pt-3">
                    <p className="text-xs font-bold text-[#456351]">{member.role}</p>
                    <span className="mt-1 inline-block text-[0.65rem] text-[#8a9d8f]">
                      عضوية رقم 0{member.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Governance Callout */}
            <div className="mt-12 rounded-3xl border border-[#d9c995] bg-[#165B2A] p-8 text-white sm:flex sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#e6bd67]">
                  <ShieldCheck className="h-4 w-4" />
                  الحوكمة والإفصاح المؤسسي
                </span>
                <p className="display-font mt-2 text-xl font-bold sm:text-2xl">
                  ملتزمون بأعلى معايير الإفصاح والشفافية وحفظ حقوق الأعضاء والمساهمين
                </p>
                <p className="mt-2 text-sm text-white/80">
                  يمكنكم الاطلاع على اللائحة الأساسية، تقارير مجلس الإدارة، والسياسات المعتمدة.
                </p>
              </div>
              <a
                href="/governance"
                className="mt-6 inline-flex h-12 shrink-0 items-center rounded-full bg-[#e6bd67] px-6 text-sm font-bold text-[#165B2A] transition-all hover:bg-[#f2cd78] hover:shadow-lg sm:mt-0"
              >
                مكتبة وثائق الحوكمة <ArrowLeft className="mr-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ===================== SECTION 5: SHAREHOLDERS (أسماء المساهمين) ===================== */}
        <section id="سجل-المساهمين" className="scroll-mt-32 bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <span className="section-label">سجل العضوية والشراكة</span>
                <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                  قائمة المساهمين المؤسسين
                </h2>
                <p className="mt-3 text-sm text-[#5d7764]">
                  سجل رسمي يضم <strong>38 مساهماً ومساهمة</strong> وضعوا لبنة الانطلاقة الأولى للجمعية
                </p>
              </div>

              {/* Search & Toggle Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px]">
                  <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b9d90]" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث باسم المساهم أو الرقم..."
                    className="h-11 w-full rounded-full border border-[#d9c995] bg-white pr-10 pl-4 text-xs font-medium text-[#155029] shadow-sm outline-none transition-colors focus:border-[#165B2A] focus:ring-2 focus:ring-[#165B2A]/10 sm:text-sm"
                  />
                </div>

                <div className="flex rounded-full border border-[#d9c995] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab("cards")}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                      activeTab === "cards"
                        ? "bg-[#165B2A] text-white"
                        : "text-[#476654] hover:text-[#165B2A]"
                    }`}
                  >
                    بطاقات
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("table")}
                    className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                      activeTab === "table"
                        ? "bg-[#165B2A] text-white"
                        : "text-[#476654] hover:text-[#165B2A]"
                    }`}
                  >
                    جدول تفصيلي
                  </button>
                </div>
              </div>
            </div>

            {/* Results count banner */}
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#d9c995]/70 bg-[#f5f1df] px-5 py-3 text-xs font-bold text-[#155029]">
              <span className="flex items-center gap-2">
                <UsersRound className="h-4 w-4 text-[#a67017]" />
                عرض {filteredShareholders.length} من أصل 38 مساهماً مؤسساً
              </span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-[#a67017] underline hover:text-[#7f5209]"
                >
                  إعادة ضبط البحث
                </button>
              )}
            </div>

            {/* View Mode: Cards */}
            {activeTab === "cards" && (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredShareholders.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-[#d9c995] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#165B2A] hover:shadow-md"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e8f0df] text-xs font-extrabold text-[#165B2A]">
                      #{s.id}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#155029]">{s.name}</p>
                      <span className="text-[0.65rem] text-[#86998b]">مساهم مؤسس معتمد</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode: Table */}
            {activeTab === "table" && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-[#d9c995] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="border-b border-[#e5dcb8] bg-[#f7f4e9] text-xs font-bold text-[#155029]">
                      <tr>
                        <th className="px-6 py-4 text-center" style={{ width: "80px" }}>م</th>
                        <th className="px-6 py-4">اسم المساهم المؤسس</th>
                        <th className="px-6 py-4">الصفة التعاونية</th>
                        <th className="px-6 py-4 text-center">حالة العضوية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0ebd9]">
                      {filteredShareholders.map((s) => (
                        <tr key={s.id} className="transition-colors hover:bg-[#faf8f0]">
                          <td className="px-6 py-3.5 text-center font-extrabold text-[#a67017]">
                            {s.id}
                          </td>
                          <td className="px-6 py-3.5 font-bold text-[#155029]">
                            {s.name}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-[#52705d]">
                            مساهم مؤسس في الجمعية التعاونية
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f0df] px-2.5 py-0.5 text-[0.68rem] font-bold text-[#165B2A]">
                              <CheckCircle2 className="h-3 w-3" />
                              معتمد بالسجل
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredShareholders.length === 0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-[#d9c995] bg-white p-12 text-center">
                <UsersRound className="mx-auto h-10 w-10 text-[#a67017]" />
                <p className="mt-3 text-base font-bold text-[#155029]">
                  لم يتم العثور على مساهم باسم «{searchTerm}»
                </p>
                <p className="mt-1 text-xs text-[#788e7f]">
                  يرجى التأكد من كتابة الاسم بصورة صحيحة أو البحث بالرقم.
                </p>
                <Button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 rounded-full bg-[#165B2A] text-xs font-bold text-white hover:bg-[#10461f]"
                >
                  عرض جميع المساهمين (38)
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ===================== SECTION 6: HOW TO CONTRIBUTE (طريقة المساهمة) ===================== */}
        <section
          id="طريقة-المساهمة"
          className="scroll-mt-32 border-t border-[#ded4b7] bg-gradient-to-b from-[#f3f0e0] to-[#fbf8ed] py-20 lg:py-28"
        >
          <div className="container">
            <div className="mx-auto max-w-4xl rounded-3xl border-2 border-[#e6bd67]/70 bg-white p-8 shadow-[0_20px_50px_rgba(22,91,42,0.1)] sm:p-12">
              <div className="flex flex-col items-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#e8f0df] text-[#165B2A] shadow-md">
                  <CreditCard className="h-8 w-8 text-[#165B2A]" />
                </span>
                <span className="section-label mt-6">المشاركة التعاونية</span>
                <h2 className="display-font mt-2 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                  طريقة المساهمة في الجمعية
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#516f5d]">
                  تتيح الجمعية للراغبين من المزارعين والمستثمرين المساهمة ودعم المبادرات التعاونية والتنموية بالإيداع المباشر لحساب الجمعية الرسمي المعتمد:
                </p>

                {/* Bank Card */}
                <div className="mt-8 w-full max-w-xl rounded-2xl border border-[#d9c995] bg-gradient-to-br from-[#f8f5eb] via-white to-[#f5f0dc] p-6 text-right shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e5dcb8] pb-4">
                    <div>
                      <p className="text-xs font-bold text-[#8a5b0d]">البنك المعتمد</p>
                      <h3 className="display-font text-lg font-bold text-[#155029]">
                        بنك البلاد (Bank Albilad)
                      </h3>
                    </div>
                    <span className="rounded-full bg-[#165B2A] px-3 py-1 text-xs font-bold text-[#e6bd67]">
                      حساب الجمعية الرسمي
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#66806e]">رقم الآيبان (IBAN):</p>
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-[#d9c995] bg-white px-4 py-3">
                      <span className="font-mono text-base font-extrabold tracking-wider text-[#155029] sm:text-lg" dir="ltr">
                        SA6405000068202441979000
                      </span>
                      <Button
                        type="button"
                        onClick={copyIban}
                        size="sm"
                        className="h-8 rounded-full bg-[#165B2A] px-3 text-xs font-bold text-white hover:bg-[#10461f]"
                      >
                        <Copy className="ml-1.5 h-3.5 w-3.5" />
                        نسخ
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#52705d]">
                    <span>اسم الحساب: الجمعية التعاونية الزراعية للتطوير والاستدامة</span>
                    <span>الفرع: المملكة العربية السعودية</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <a href="/contact">
                    <Button className="h-12 rounded-full bg-[#165B2A] px-8 font-bold text-white shadow-md hover:bg-[#10461f]">
                      تواصل معنا لإشعار الإيداع <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  </a>
                  <a
                    href="tel:+966533198555"
                    className="inline-flex h-12 items-center rounded-full border border-[#165B2A]/30 bg-white px-6 text-sm font-bold text-[#155029] hover:bg-[#f5f1df]"
                  >
                    اتصال بالهاتف: 053 319 8555
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
