import BackToTop from "@/components/BackToTop";
import ContactForm from "@/components/ContactForm";
import FAQSection from "@/components/FAQSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Ghost, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

const contactChannels = [
  {
    label: "البريد الإلكتروني المعتمد",
    value: "info@acsd.sa",
    href: "mailto:info@acsd.sa",
    Icon: Mail,
    detail: "القناة الرسمية المعتمدة لاستقبال الاستفسارات والشراكات والمقترحات.",
  },
  {
    label: "الهاتف المكتبي",
    value: "017 325 0000",
    href: "tel:+966173250000",
    Icon: Phone,
    detail: "للاستفسارات العامة والتنسيق الإداري خلال أوقات العمل الرسمية.",
  },
  {
    label: "جوال الإدارة والتنسيق",
    value: "055 123 4567",
    href: "tel:+966551234567",
    Icon: Phone,
    detail: "للتواصل المباشر مع المزارعين وأعضاء الجمعية.",
  },
];

const socialChannels = [
  { label: "منصة X", href: "https://x.com/acsd2027?s=11", Icon: Twitter },
  { label: "إنستغرام", href: "https://www.instagram.com/acsd2027/", Icon: Instagram },
  { label: "سناب شات", href: "https://www.snapchat.com/@acsd2027", Icon: Ghost },
];

export default function ContactPage() {
  return (
    <div className="site-shell min-h-screen bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="grain-layer relative isolate overflow-hidden bg-[#f0eedf] py-14 lg:py-20">
          <div
            className="absolute -left-24 top-8 h-80 w-80 rounded-full border-[30px] border-[#d5a647]/20"
            aria-hidden="true"
          />
          <div className="container relative z-10 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <span className="section-label">بوابة التواصل والشراكة</span>
              <h1 className="display-font mt-4 max-w-2xl text-4xl font-extrabold leading-[1.45] text-[#155029] sm:text-5xl">
                يسعدنا تواصلكم لبناء أثرٍ زراعي مستدام
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#4e6b58] sm:text-lg">
                نستقبل استفسارات المزارعين، ومقترحات الشركاء، وطلبات التعاون المؤسسي عبر نموذج تواصل متكامل مع إمكانية إرفاق الملفات والمستندات لمتابعتها والرد عليها باحترافية.
              </p>
            </div>
            <div className="rounded-bl-[3.5rem] rounded-tr-[3.5rem] border border-[#d9c995] bg-white/85 p-7 shadow-[0_20px_45px_rgba(22,91,42,0.08)]">
              <MapPin className="h-7 w-7 text-[#a67017]" />
              <p className="section-label mt-6">المقر ونطاق العمل</p>
              <h2 className="display-font mt-2 text-2xl font-extrabold text-[#155029]">
                محافظة الدرب، منطقة جازان، المملكة العربية السعودية
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#617a68]">
                مقر الجمعية مفتوح لاستقبال الأعضاء والمزارعين وتقديم الدعم الإرشادي والخدمات التعاونية.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Channels */}
        <section className="bg-[#fbf8ed] py-20 lg:py-24">
          <div className="container">
            <div className="max-w-2xl">
              <span className="section-label">قنوات مباشرة</span>
              <h2 className="display-font mt-3 text-3xl font-extrabold text-[#155029] sm:text-4xl">
                اختر القناة الأنسب لتواصلك معنا
              </h2>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {contactChannels.map(({ label, value, href, Icon, detail }) => (
                <a
                  key={value}
                  href={href}
                  className="group rounded-bl-[2.5rem] rounded-tr-[2.5rem] border border-[#d9c995] bg-white p-7 shadow-[0_12px_30px_rgba(22,91,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(22,91,42,0.12)]"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8f0df] text-[#155029] transition-colors group-hover:bg-[#e6bd67]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-6 text-xs font-bold text-[#a67017]">{label}</p>
                  <p className="display-font mt-2 text-xl font-bold text-[#155029]" dir="ltr">
                    {value}
                  </p>
                  <p className="mt-3 text-xs leading-6 text-[#68816f]">{detail}</p>
                </a>
              ))}
            </div>

            {/* Social channels bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d9c995] bg-[#f5f1df] px-6 py-4">
              <span className="text-sm font-bold text-[#155029]">تابع حسابات الجمعية الرسمية:</span>
              <div className="flex flex-wrap items-center gap-3">
                {socialChannels.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-[#d9c995]/60 bg-white px-4 py-2 text-xs font-bold text-[#315441] shadow-sm transition-all hover:bg-[#165B2A] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection />

        {/* Contact Form Section */}
        <ContactForm />
      </main>
      <BackToTop />
      <SiteFooter />
    </div>
  );
}
