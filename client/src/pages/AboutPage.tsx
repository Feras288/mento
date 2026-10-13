import BackToTop from "@/components/BackToTop";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Compass,
  Droplets,
  Eye,
  Handshake,
  HeartHandshake,
  Landmark,
  Leaf,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Tractor,
  Trees,
  TrendingUp,
  UsersRound,
} from "lucide-react";

const logoUrl = "/storage/acsd-official-logo_112cc60c.jpg";
const chairPhotoUrl = "/storage/acsd-board-chair_c9405dd9.jpeg";

const impactIndicators = [
  { value: "+1,200", label: "مزارع ومستفيد", desc: "من البرامج الإرشادية والتدريبية", Icon: UsersRound },
  { value: "40%", label: "رفع كفاءة المياه", desc: "باعتماد نظم الري الحديثة والمرشدة", Icon: Droplets },
  { value: "+15,000", label: "شتلة وشجرة", desc: "لدعم الغطاء النباتي والتنمية البيئية", Icon: Trees },
  { value: "100%", label: "حوكمة وشفافية", desc: "التزام كامل بمعايير الإفصاح المؤسسي", Icon: ShieldCheck },
];

const coreValues = [
  { title: "الشفافية والحوكمة", desc: "وضوح تام في القرارات، والتقارير المالية، والإفصاح عن كافة أعمال الجمعية.", Icon: ShieldCheck },
  { title: "الاستدامة والبيئة", desc: "حماية التربة والمياه والتوازن البيئي لضمان إنتاج زراعي مستمر للأجيال القادمة.", Icon: Leaf },
  { title: "روح التعاون المشترك", desc: "العمل مع المزارعين والشركاء كمنظومة واحدة لتبادل الخبرة وتوحيد الجهود.", Icon: Handshake },
  { title: "الابتكار والتطوير", desc: "توظيف التقنيات الزراعية الحديثة لرفع الجودة وتحسين العوائد الاقتصادية.", Icon: Sparkles },
];

const strategicGoals = [
  { num: "01", title: "تطوير الكفاءة الإنتاجية", desc: "تحسين جودة المحاصيل ورفع إنتاجية الأراضي الزراعية وفق ممارسات علمية مستدامة." },
  { num: "02", title: "الإدارة الرشيدة للمياه", desc: "تطبيق تقنيات الري الذكي وحصاد مياه الأمطار للحد من الهدر المائي وتعظيم الأثر." },
  { num: "03", title: "تمكين المزارعين المحليين", desc: "تقديم التدريب الميداني المستمر، والاستشارات الزراعية، وتيسير توفير المدخلات بأسعار تعاونية." },
  { num: "04", title: "توسيع الشراكات الاستراتيجية", desc: "بناء تحالفات فاعلة مع القطاعات الحكومية والخاصة وغير الربحية لدعم التنمية الريفية." },
];

const impactPaths = [
  { title: "مشاريع زراعية منتجة", description: "تطوير البيوت المحمية والمزارع النموذجية بما يدعم تنوع الإنتاج وكفاءته السوقية.", Icon: Sprout },
  { title: "تنمية الثروة الحيوانية", description: "إتاحة مسارات لمشاريع حيوانية تخصصية تسهم في تعزيز الأمن الغذائي المحلي.", Icon: Leaf },
  { title: "الإرشاد ونقل المعرفة", description: "تنفيذ ورش عمل وتدريبات تطبيقية لربط المزارع بأحدث التقنيات وأفضل الأساليب الزراعية.", Icon: UsersRound },
  { title: "الشراكات التعاونية", description: "بناء جسور تعاون مع المراكز البحثية والجهات المانحة لتطوير فرص استثمارية واعدة.", Icon: Handshake },
  { title: "مدخلات زراعية ميسّرة", description: "تأمين البذور والأسمدة والمعدات المعتمدة بأسعار تشجيعية تدعم استمرارية المزارع.", Icon: Building2 },
  { title: "حوكمة تصنع الثقة", description: "إدارة العمل وفق أعلى معايير الشفافية والمسؤولية لضمان حفظ حقوق الأعضاء والمساهمين.", Icon: ShieldCheck },
];

const boardMembers = [
  { name: "عبدالرحمن حسن عبدالله عزران", role: "رئيس مجلس الإدارة" },
  { name: "ولي عبدالله عبده", role: "نائب رئيس مجلس الإدارة" },
  { name: "محمد حسن آل الهادي", role: "أمين الصندوق" },
  { name: "سامي ولي عبدالله", role: "عضو مجلس الإدارة" },
  { name: "ندى حسن صديق عزران", role: "عضو مجلس الإدارة" },
];

export default function AboutPage() {
  return (
    <div className="site-shell min-h-screen bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="grain-layer relative isolate overflow-hidden bg-[#f0eedf] py-14 lg:py-20">
          <div className="absolute -left-20 top-8 h-72 w-72 rounded-full border-[28px] border-[#e6bd67]/20" aria-hidden="true" />
          <div className="container relative z-10 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="order-2 max-w-2xl lg:order-1">
              <span className="section-label">عن الجمعية</span>
              <h1 className="display-font mt-4 text-3xl font-extrabold leading-[1.45] text-[#155029] sm:text-5xl">
                جمعية تعاونية سعودية تنمّي القيمة، وتحفظ أثر الأرض
              </h1>
              <p className="mt-6 text-base leading-8 text-[#466452] sm:text-lg">
                الجمعية التعاونية الزراعية للتطوير والاستدامة كيان تنموي يجمع المزارعين والمساهمين والشركاء حول رؤية طموحة لتعزيز كفاءة الإنتاج الزراعي، وإدارة الموارد الطبيعية بمسؤولية، وتحقيق عوائد مستدامة تدعم مستهدفات التنمية الريفية بالمملكة.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#مسارات-الأثر">
                  <Button className="h-11 rounded-full bg-[#165B2A] px-6 font-bold text-white shadow-md hover:bg-[#10461f] active:scale-[0.97]">
                    استكشف مجالات عملنا <ArrowLeft className="mr-1.5 h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="/contact"
                  className="inline-flex h-11 items-center rounded-full border border-[#bb913c] bg-white/70 px-5 text-sm font-bold text-[#775619] transition-colors hover:bg-white"
                >
                  تواصل مع إدارة الجمعية
                </a>
              </div>
            </div>

            <div className="relative order-1 min-h-[19rem] lg:order-2 flex items-center justify-center">
              <div className="relative flex h-60 w-60 items-center justify-center rounded-full bg-white shadow-[0_24px_50px_rgba(21,91,42,0.18)] ring-8 ring-[#e6bd67]/30 sm:h-72 sm:w-72">
                <img
                  src={logoUrl}
                  alt="شعار الجمعية"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Indicators Section */}
        <section className="border-y border-[#d9c995]/70 bg-[#164A3A] py-14 text-white">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {impactIndicators.map(({ value, label, desc, Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur transition-transform hover:-translate-y-1"
                >
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e6bd67] text-[#164A3A]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <p className="display-font mt-4 text-3xl font-extrabold text-[#e6bd67] sm:text-4xl" dir="ltr">
                    {value}
                  </p>
                  <p className="mt-2 text-base font-bold text-white">{label}</p>
                  <p className="mt-1 text-xs text-white/75">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision, Mission, Values */}
        <section className="bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container">
            <div className="max-w-2xl">
              <span className="section-label">الهوية المؤسسية</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                الرؤية، الرسالة، والقيم الحاكمة
              </h2>
              <p className="mt-4 text-base leading-8 text-[#58735f]">
                مرتكزاتنا التي توجه كل قرار استثماري ومبادرة ميدانية نحو أثر تنموي مستدام.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Vision Card */}
              <div className="rounded-bl-[2.8rem] rounded-tr-[2.8rem] border border-[#d9c995] bg-white p-8 shadow-[0_14px_34px_rgba(22,91,42,0.07)]">
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#165B2A] text-[#e6bd67]">
                  <Compass className="h-6 w-6" />
                </span>
                <span className="mt-6 block text-xs font-extrabold uppercase tracking-wider text-[#a67017]">
                  رؤيتنا
                </span>
                <h3 className="display-font mt-2 text-2xl font-bold text-[#155029]">
                  الريادة في التنمية الزراعية المستدامة
                </h3>
                <p className="mt-4 text-sm leading-8 text-[#58735f]">
                  أن نكون النموذج التعاوني الرائد في المملكة في تمكين المزارعين وتطوير القطاع الزراعي، وتحقيق الاستثمار البيئي والاقتصادي المتوازن.
                </p>
              </div>

              {/* Mission Card */}
              <div className="rounded-bl-[2.8rem] rounded-tr-[2.8rem] border border-[#d9c995] bg-white p-8 shadow-[0_14px_34px_rgba(22,91,42,0.07)]">
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e6bd67] text-[#165B2A]">
                  <Target className="h-6 w-6" />
                </span>
                <span className="mt-6 block text-xs font-extrabold uppercase tracking-wider text-[#a67017]">
                  رسالتنا
                </span>
                <h3 className="display-font mt-2 text-2xl font-bold text-[#155029]">
                  تمكين المزارع وحماية الموارد
                </h3>
                <p className="mt-4 text-sm leading-8 text-[#58735f]">
                  الارتقاء بالقدرات الإنتاجية والتسويقية للمزارعين عبر الإرشاد التطبيقي، وحلول كفاءة المياه، وبناء شراكات نوعية ترتكز على الشفافية والحوكمة.
                </p>
              </div>

              {/* Future Outlook Card */}
              <div className="rounded-bl-[2.8rem] rounded-tr-[2.8rem] border border-[#d9c995] bg-[#165B2A] p-8 text-white shadow-[0_14px_34px_rgba(22,91,42,0.12)] md:col-span-2 lg:col-span-1">
                <span className="grid h-13 w-13 place-items-center rounded-2xl bg-white/15 text-[#e6bd67]">
                  <TrendingUp className="h-6 w-6" />
                </span>
                <span className="mt-6 block text-xs font-extrabold uppercase tracking-wider text-[#e6bd67]">
                  رؤيتنا للمستقبل
                </span>
                <h3 className="display-font mt-2 text-2xl font-bold text-white">
                  أفق زراعي واعد لعام 2030
                </h3>
                <p className="mt-4 text-sm leading-8 text-white/80">
                  مواكبة مستهدفات الأمن الغذائي الوطني، والتوسع في استخدام الطاقة المتجددة وأنظمة الري الذكية، وتحويل المزارع إلى مشاريع إنتاجية ذات جدوى مستدامة.
                </p>
              </div>
            </div>

            {/* Core Values */}
            <div className="mt-16">
              <h3 className="display-font text-2xl font-bold text-[#155029]">القيم المؤسسية</h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {coreValues.map(({ title, desc, Icon }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-[#d9c995]/80 bg-[#f5f1df]/60 p-5 transition-all hover:bg-white hover:shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-[#a67017]" />
                    <h4 className="display-font mt-3 text-base font-bold text-[#155029]">{title}</h4>
                    <p className="mt-2 text-xs leading-6 text-[#58735f]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Strategic Goals */}
        <section className="bg-[#e8f0df] py-20 lg:py-28">
          <div className="container">
            <div className="max-w-2xl">
              <span className="section-label">خارطة العمل</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                الأهداف الاستراتيجية للجمعية
              </h2>
              <p className="mt-4 text-base leading-8 text-[#516f5d]">
                محاور متكاملة لتحقيق نقلة نوعية في الممارسات الزراعية والعوائد التعاونية.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {strategicGoals.map(({ num, title, desc }) => (
                <div
                  key={num}
                  className="flex gap-5 rounded-bl-[2rem] rounded-tr-[2rem] border border-[#c6d7bd] bg-white p-7 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <span className="display-font text-3xl font-extrabold text-[#a67017]">{num}</span>
                  <div>
                    <h3 className="display-font text-xl font-bold text-[#155029]">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#58735f]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 Impact Paths & Domains of Work */}
        <section id="مسارات-الأثر" className="bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container">
            <div className="max-w-2xl">
              <span className="section-label">مجالات العمل</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                ستة مسارات تنموية تصنع الأثر الميداني
              </h2>
              <p className="mt-4 text-base leading-8 text-[#58735f]">
                نترجم استراتيجيتنا إلى مبادرات عملية تغطي سلسلة القيمة الزراعية بأكملها.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {impactPaths.map(({ title, description, Icon }, index) => (
                <article
                  key={title}
                  className="rounded-bl-[2.5rem] rounded-tr-[2.5rem] border border-[#d9c995] bg-white p-7 shadow-[0_10px_28px_rgba(22,91,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0df] text-[#165B2A]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-xs font-extrabold text-[#a67017]">0{index + 1}</span>
                  </div>
                  <h3 className="display-font mt-5 text-xl font-bold text-[#155029]">{title}</h3>
                  <p className="mt-2.5 text-sm leading-7 text-[#58735f]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Board Chair Message */}
        <section className="bg-[#f0eedf] py-20 lg:py-28 border-t border-[#ded4b7]">
          <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="relative mx-auto w-full max-w-sm">
              <div className="overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] border-4 border-white bg-white shadow-[0_22px_50px_rgba(22,91,42,0.15)]">
                <img
                  src={chairPhotoUrl}
                  alt="رئيس مجلس إدارة الجمعية"
                  className="h-[27rem] w-full object-cover"
                />
              </div>
            </div>

            <div>
              <span className="section-label">رسالة القيادة</span>
              <blockquote className="display-font mt-4 border-r-4 border-[#b57c1d] pr-6 text-2xl font-bold leading-[1.75] text-[#155029] sm:text-3xl">
                «مستقبل الزراعة لا يُقاس بحجم الإنتاج وحده، بل بقدرة المؤسسات على بناء قيمة مستدامة، وإدارة الموارد بكفاءة، ووضع المزارع في قلب كل خطوة.»
              </blockquote>
              <p className="mt-6 text-base leading-8 text-[#57715f]">
                تعمل الجمعية التعاونية الزراعية للتطوير والاستدامة على ترسيخ نموذج مؤسسي متين يجمع بين الانضباط الحوكمي والفاعلية الميدانية، ونمد أيدينا إلى كل مزارع وشريك لتحقيق مستقبل زراعي أكثر ازدهارًا.
              </p>
              <div className="mt-6">
                <p className="display-font text-lg font-bold text-[#155029]">عبدالرحمن بن حسن عزران</p>
                <p className="text-xs text-[#78907d]">رئيس مجلس الإدارة</p>
              </div>
            </div>
          </div>
        </section>

        {/* Board of Directors */}
        <section className="bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <span className="section-label">الهيكل القيادي</span>
                <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                  مجلس إدارة الجمعية
                </h2>
              </div>
              <p className="text-sm font-medium text-[#5e7765]">دورة المجلس: 5 سنوات</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {boardMembers.map((member, index) => (
                <div
                  key={member.name}
                  className="rounded-bl-[2rem] rounded-tr-[2rem] border border-[#d9c995] bg-white p-6 shadow-sm text-center"
                >
                  <span className="text-xs font-bold text-[#b07819]">عضوية 0{index + 1}</span>
                  <h3 className="display-font mt-4 text-base font-bold leading-7 text-[#155029]">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-xs font-medium text-[#66816d]">{member.role}</p>
                </div>
              ))}
            </div>

            {/* Governance Callout */}
            <div className="mt-12 rounded-bl-[2.5rem] rounded-tr-[2.5rem] bg-[#165B2A] p-8 text-white sm:flex sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold text-[#e6bd67]">
                  <ShieldCheck className="h-4 w-4" />
                  الحوكمة والإفصاح
                </span>
                <p className="display-font mt-2 text-xl font-bold">
                  ملتزمون بأعلى معايير الإفصاح والشفافية المؤسسية
                </p>
              </div>
              <a
                href="/governance"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-[#e6bd67] px-6 text-sm font-bold text-[#165B2A] transition-transform hover:-translate-y-0.5 active:scale-95 sm:mt-0"
              >
                مكتبة وثائق الحوكمة <ArrowLeft className="mr-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
