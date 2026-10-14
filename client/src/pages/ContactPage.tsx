import BackToTop from "@/components/BackToTop";
import ContactForm from "@/components/ContactForm";
import FAQSection from "@/components/FAQSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Ghost,
  Instagram,
  Mail,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Send,
  ShieldCheck,
  Twitter,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

// Channels data from darb.org.sa
const officialChannels = [
  {
    title: "البريد الإلكتروني الرسمي المعتمد",
    primaryValue: "info@acsd.sa",
    href: "mailto:info@acsd.sa",
    badge: "معتمد للمراسلات الرسمية",
    desc: "القناة المعتمدة لاستقبال خطابات الشراكة، الاستفسارات، ومقترحات المزارعين والمستثمرين.",
    Icon: Mail,
    isExternal: false,
  },
  {
    title: "هاتف الجمعية الرسمي",
    primaryValue: "053 319 8555",
    href: "tel:+966533198555",
    badge: "اتصال هاتفي مباشر",
    desc: "للتواصل الهاتفي المباشر، التنسيق الإداري والميداني، والاستفسارات الزراعية العامة.",
    Icon: Phone,
    isExternal: false,
  },
  {
    title: "واتساب وخدمة الأعضاء",
    primaryValue: "053 319 8555",
    href: "https://wa.me/966533198555",
    badge: "مراسلة وتنسيق سريع",
    desc: "للتواصل السريع عبر تطبيق واتساب لخدمة المزارعين وتنسيق الاستشارات والزيارات الميدانية.",
    Icon: PhoneCall,
    isExternal: true,
  },
  {
    title: "بيانات رئيس مجلس الإدارة",
    primaryValue: "عبدالرحمن حسن عزران",
    secondaryValue: "054 553 4428",
    emailValue: "qzrein21@gmail.com",
    href: "tel:+966545534428",
    badge: "القيادة والشراكات الاستراتيجية",
    desc: "للاتفاقيات الاستثمارية، المبادرات التنموية الكبرى، والتحالفات المؤسسية مع القطاعين العام والخاص.",
    Icon: UserCheck,
    isExternal: false,
  },
];

// Official social channels from darb.org.sa
const socialChannels = [
  {
    label: "منصة X (تويتر)",
    username: "@acsd2027",
    href: "https://x.com/acsd2027?s=11",
    Icon: Twitter,
    color: "hover:border-[#1DA1F2] hover:text-[#1DA1F2]",
  },
  {
    label: "إنستغرام الرسمية",
    username: "@acsd2027",
    href: "https://www.instagram.com/acsd2027/",
    Icon: Instagram,
    color: "hover:border-[#E1306C] hover:text-[#E1306C]",
  },
  {
    label: "سناب شات",
    username: "acsd2027",
    href: "https://snapchat.com/t/IUeSyGnL",
    Icon: Ghost,
    color: "hover:border-[#FFFC00] hover:text-[#a89800]",
  },
];

export default function ContactPage() {
  const copyIban = () => {
    navigator.clipboard.writeText("SA6405000068202441979000");
    toast.success("تم نسخ رقم الآيبان لبنك البلاد بنجاح");
  };

  return (
    <div className="site-shell min-h-screen bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />

      <main>
        {/* ===================== HERO SECTION ===================== */}
        <section className="grain-layer relative isolate overflow-hidden bg-gradient-to-b from-[#f3f0e0] via-[#ebe6d0] to-[#fbf8ed] py-14 lg:py-20">
          <div
            className="absolute -left-24 top-8 h-80 w-80 rounded-full border-[30px] border-[#d5a647]/20"
            aria-hidden="true"
          />
          <div
            className="absolute right-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#165B2A]/5 blur-2xl"
            aria-hidden="true"
          />

          <div className="container relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#165B2A]/20 bg-white/70 px-4 py-1.5 text-xs font-bold text-[#165B2A] shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-[#a67017]" />
                محافظة الدرب — منطقة جازان — المملكة العربية السعودية
              </div>

              <h1 className="display-font mt-4 text-3xl font-extrabold leading-[1.35] text-[#155029] sm:text-5xl">
                يسعدنا تواصلكم لبناء أثر زراعي مستدام
              </h1>

              <p className="mt-5 text-base leading-8 text-[#4e6b58] sm:text-lg">
                نستقبل استفسارات المزارعين، مقترحات الشركاء، طلبات المساهمة والتعاون المؤسسي عبر قنواتنا المعتمدة أو من خلال تعبئة نموذج المراسلة المباشر، لنعمل معاً على خدمة مجتمعنا الزراعي.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#قنوات-الاتصال">
                  <Button className="h-11 rounded-full bg-[#165B2A] px-6 font-bold text-white shadow-md hover:bg-[#10461f]">
                    قنوات الاتصال المعتمدة
                  </Button>
                </a>
                <a href="#المساهمة-البنكية">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full border-[#d9c995] bg-white/80 px-6 font-bold text-[#775619] hover:bg-white"
                  >
                    حساب المساهمة (بنك البلاد)
                  </Button>
                </a>
                <a href="#تواصل">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full border-[#165B2A]/30 bg-[#f5f1df]/80 px-6 font-bold text-[#155029] hover:bg-white"
                  >
                    اكتب رسالتك الآن
                  </Button>
                </a>
              </div>
            </div>

            {/* Headquarters Card */}
            <div className="rounded-3xl border border-[#d9c995] bg-white p-8 shadow-[0_20px_45px_rgba(22,91,42,0.08)]">
              <div className="flex items-center justify-between border-b border-[#f0eedf] pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0df] text-[#165B2A]">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <span className="section-label">المقر الرئيسي</span>
                    <h2 className="display-font mt-1 text-xl font-bold text-[#155029]">
                      الجمعية التعاونية الزراعية
                    </h2>
                  </div>
                </div>
                <span className="rounded-full bg-[#165B2A] px-3 py-1 text-xs font-bold text-[#e6bd67]">
                  ACSD
                </span>
              </div>

              <div className="mt-6 space-y-4 text-xs leading-6 text-[#456351] sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#a67017]" />
                  <div>
                    <strong className="block text-[#155029]">العنوان الوطني:</strong>
                    <span>محافظة الدرب، منطقة جازان، المملكة العربية السعودية</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-[#a67017]" />
                  <div>
                    <strong className="block text-[#155029]">ساعات العمل والاستقبال:</strong>
                    <span>الأحد إلى الخميس: 8:00 صباحاً – 3:00 مساءً (الجمعة والسبت عطلة)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#a67017]" />
                  <div>
                    <strong className="block text-[#155029]">التسجيل النظامي:</strong>
                    <span>مسجلة رسمياً تحت إشراف وزارة الموارد البشرية والتنمية الاجتماعية</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#f0eedf]">
                <a
                  href="https://maps.google.com/?q=Al+Darb+Jazan+Saudi+Arabia"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#d9c995] bg-[#f8f6ec] text-xs font-bold text-[#155029] transition-colors hover:bg-[#165B2A] hover:text-white"
                >
                  <Navigation className="h-4 w-4" />
                  عرض موقع محافظة الدرب على خرائط Google
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CONTACT CHANNELS ===================== */}
        <section id="قنوات-الاتصال" className="scroll-mt-24 bg-[#fbf8ed] py-20 lg:py-24">
          <div className="container">
            <div className="max-w-3xl">
              <span className="section-label">قنوات الاتصال الرسمية</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                تواصل معنا عبر القناة الأنسب لك
              </h2>
              <p className="mt-3 text-base text-[#52705d]">
                بيانات التواصل المعتمدة للجمعية التعاونية الزراعية للتطوير والاستدامة بمحافظة الدرب
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {officialChannels.map((c) => (
                <div
                  key={c.title}
                  className="group flex flex-col justify-between rounded-3xl border border-[#d9c995] bg-white p-7 shadow-[0_10px_28px_rgba(22,91,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#165B2A] hover:shadow-[0_18px_38px_rgba(22,91,42,0.12)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0df] text-[#165B2A] transition-colors group-hover:bg-[#165B2A] group-hover:text-white">
                        <c.Icon className="h-6 w-6" />
                      </span>
                      <span className="rounded-full bg-[#f4ebd0] px-2.5 py-0.5 text-[0.68rem] font-bold text-[#8a5b0d]">
                        {c.badge}
                      </span>
                    </div>

                    <h3 className="display-font mt-5 text-base font-bold text-[#155029]">
                      {c.title}
                    </h3>

                    {/* Primary link */}
                    <a
                      href={c.href}
                      className="display-font mt-3 block text-lg font-extrabold text-[#165B2A] transition-colors hover:text-[#a67017]"
                      dir={c.primaryValue.includes("@") || !isNaN(Number(c.primaryValue.replace(/\s+/g, ""))) ? "ltr" : "rtl"}
                    >
                      {c.primaryValue}
                    </a>

                    {/* Secondary phone or email if present */}
                    {c.secondaryValue && (
                      <a
                        href={`tel:${c.secondaryValue.replace(/\s+/g, "")}`}
                        className="mt-1 block text-sm font-bold text-[#165B2A] hover:underline"
                        dir="ltr"
                      >
                        جوال: {c.secondaryValue}
                      </a>
                    )}
                    {c.emailValue && (
                      <a
                        href={`mailto:${c.emailValue}`}
                        className="mt-1 block text-xs font-semibold text-[#8f5d0e] hover:underline"
                        dir="ltr"
                      >
                        {c.emailValue}
                      </a>
                    )}

                    <p className="mt-3 text-xs leading-6 text-[#627d6a]">{c.desc}</p>
                  </div>

                  <div className="mt-5 border-t border-[#f0eedf] pt-4">
                    <a
                      href={c.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#165B2A] hover:underline"
                    >
                      بدء التواصل الآن ←
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Official Social Channels Bar */}
            <div className="mt-8 rounded-3xl border border-[#d9c995] bg-[#f5f1df] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
              <div>
                <h3 className="display-font text-base font-bold text-[#155029]">
                  الحسابات الرسمية على شبكات التواصل الاجتماعي
                </h3>
                <p className="mt-1 text-xs text-[#52705d]">
                  تابع تغطيات الجمعية، ورش العمل، والإعلانات الدورية لمشاريع التطوير والاستدامة.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
                {socialChannels.map((soc) => (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 rounded-full border border-[#d9c995] bg-white px-4 py-2 text-xs font-bold text-[#315441] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white ${soc.color}`}
                  >
                    <soc.Icon className="h-4 w-4" />
                    <span>{soc.label}</span>
                    <span className="text-[0.68rem] text-[#85988a]" dir="ltr">
                      {soc.username}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===================== BANK ACCOUNT & CONTRIBUTION ===================== */}
        <section
          id="المساهمة-البنكية"
          className="scroll-mt-24 border-y border-[#ded4b7] bg-gradient-to-b from-[#f3f0e0] to-[#ece7d2] py-20 lg:py-24"
        >
          <div className="container">
            <div className="mx-auto max-w-4xl rounded-3xl border-2 border-[#e6bd67]/70 bg-white p-8 shadow-[0_20px_50px_rgba(22,91,42,0.1)] sm:p-12">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f0df] px-3.5 py-1 text-xs font-bold text-[#165B2A]">
                    <CreditCard className="h-3.5 w-3.5" />
                    الحساب البنكي المعتمد للمساهمة
                  </div>
                  <h2 className="display-font mt-3 text-2xl font-extrabold text-[#155029] sm:text-3xl">
                    طريقة المساهمة في الجمعية
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#466452]">
                    تتيح الجمعية للمزارعين والمساهمين والداعمين إيداع المساهمات ورسوم العضوية مباشرةً لحساب الجمعية الرسمي في <strong>بنك البلاد</strong>:
                  </p>

                  <div className="mt-5 space-y-2 text-xs text-[#55705f]">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#165B2A]" />
                      <strong>اسم الحساب:</strong> الجمعية التعاونية الزراعية للتطوير والاستدامة
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#165B2A]" />
                      <strong>البنك المعتمد:</strong> بنك البلاد (Bank Albilad)
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#165B2A]" />
                      <strong>المقر:</strong> محافظة الدرب - منطقة جازان
                    </p>
                  </div>
                </div>

                {/* IBAN Card Box */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[#d9c995] bg-gradient-to-br from-[#f8f5ea] via-white to-[#f5eed6] p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#e5dcb8] pb-3">
                      <span className="text-xs font-bold text-[#8a5b0d]">بنك البلاد</span>
                      <span className="rounded-full bg-[#165B2A] px-2.5 py-0.5 text-[0.65rem] font-bold text-[#e6bd67]">
                        IBAN
                      </span>
                    </div>

                    <p className="mt-4 text-[0.7rem] font-semibold text-[#6d8474]">
                      رقم الآيبان الرسمي للجمعية:
                    </p>

                    <div className="mt-2 rounded-xl border border-[#d9c995] bg-white p-3 text-center">
                      <p className="font-mono text-base font-extrabold text-[#155029] sm:text-lg" dir="ltr">
                        SA6405000068202441979000
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={copyIban}
                      className="mt-4 h-11 w-full rounded-full bg-[#165B2A] font-bold text-white shadow hover:bg-[#10461f]"
                    >
                      <Copy className="ml-2 h-4 w-4" />
                      نسخ رقم الآيبان
                    </Button>

                    <p className="mt-3 text-center text-[0.65rem] text-[#7d9284]">
                      يرجى إرسال إشعار التحويل عبر النموذج أدناه لتأكيد القيد.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== INTERACTIVE MAP & REGION ===================== */}
        <section className="bg-[#fbf8ed] py-16 lg:py-20">
          <div className="container">
            <div className="rounded-3xl border border-[#d9c995] bg-white p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-5">
                  <span className="section-label">النطاق الجغرافي</span>
                  <h3 className="display-font mt-2 text-2xl font-bold text-[#155029]">
                    محافظة الدرب — بوابة جازان الشمالية
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#466452]">
                    تتميز محافظة الدرب بموقعها الاستراتيجي وخصوبة أراضيها الزراعية ووفرة مصادرها الطبيعية، مما يجعلها بيئة واعدة لإنشاء وتطوير المشاريع الزراعية والبيوت المحمية والاستثمار التنموي المستدام.
                  </p>
                  <div className="mt-6 space-y-2.5 text-xs text-[#52705d]">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#a67017]" />
                      <span><strong>المنطقة:</strong> منطقة جازان، المملكة العربية السعودية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#a67017]" />
                      <span><strong>هاتف الجمعية:</strong> 053 319 8555</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#a67017]" />
                      <span><strong>البريد:</strong> info@acsd.sa</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-[#d9c995] bg-[#eef3ea] shadow-inner sm:h-80">
                    {/* Embedded Google Map iframe for Al Darb, Jazan */}
                    <iframe
                      title="موقع محافظة الدرب - منطقة جازان"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d122247.24278479532!2d42.20397505!3d17.72120035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15fcc4c585ea9cb5%3A0xe54e5b967dc40ad4!2sAl%20Darb%2C%20Jazan%20Province%2C%20Saudi%20Arabia!5e0!3m2!1sen!2ssa!4v1710000000000!5m2!1sen!2ssa"
                      className="h-full w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== FAQ SECTION ===================== */}
        <FAQSection />

        {/* ===================== CONTACT FORM SECTION ===================== */}
        <ContactForm />
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
