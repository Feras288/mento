import { ArrowUp, Ghost, Instagram, Mail, MapPin, Phone, Twitter, Sprout } from "lucide-react";

const logoUrl = "/storage/acsd-official-logo_112cc60c.jpg";

const socialLinks = [
  { label: "منصة X", href: "https://x.com/acsd2027?s=11", Icon: Twitter },
  { label: "إنستغرام", href: "https://www.instagram.com/acsd2027/", Icon: Instagram },
  { label: "سناب شات", href: "https://www.snapchat.com/@acsd2027", Icon: Ghost },
];

const quickLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "عن الجمعية", href: "/about" },
  { label: "مجالات العمل", href: "/about#مسارات-الأثر" },
  { label: "الأخبار", href: "/news" },
  { label: "الفعاليات", href: "/events" },
  { label: "الحوكمة والشفافية", href: "/governance" },
  { label: "استبيان الرأي", href: "/survey" },
  { label: "اتصل بنا", href: "/contact" },
];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-[#1d4f33] bg-[#103a22] text-white/80" dir="rtl">
      {/* Top Banner Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#165B2A] via-[#E6BD67] to-[#165B2A]" />

      <div className="container pt-14 pb-24 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3.5">
              <span className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md ring-2 ring-[#e6bd67]/50">
                <img src={logoUrl} alt="شعار الجمعية" className="h-full w-full rounded-full object-cover" />
              </span>
              <div>
                <span className="display-font block text-lg font-extrabold text-white sm:text-xl">
                  الجمعية التعاونية الزراعية
                </span>
                <span className="block text-xs font-semibold text-[#e6bd67] sm:text-sm">
                  للتطوير والاستدامة
                </span>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
              جمعية تعاونية زراعية سعودية تُعنى بالنهوض بالقطاع الزراعي، وتمكين المزارعين، وتطوير الممارسات المستدامة وكفاءة الموارد المائية، بما يواكب مستهدفات التنمية الريفية المستدامة ورؤية المملكة 2030.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              <span className="text-xs font-bold text-white/60">تابعونا عبر:</span>
              <div className="flex items-center gap-2">
                {socialLinks.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e6bd67] hover:bg-[#e6bd67] hover:text-[#103a22]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h4 className="display-font flex items-center gap-2 text-base font-bold text-[#e6bd67]">
              <Sprout className="h-4 w-4" />
              روابط سريعة
            </h4>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block py-1 text-white/75 transition-colors hover:text-[#e6bd67]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-4">
            <h4 className="display-font text-base font-bold text-[#e6bd67]">
              بيانات التواصل الرسمية
            </h4>
            <div className="mt-4 space-y-3.5 text-xs text-white/80 sm:text-sm">
              <a
                href="mailto:info@acsd.sa"
                className="flex items-center gap-3 transition-colors hover:text-[#e6bd67]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[#e6bd67]">
                  <Mail className="h-4 w-4" />
                </span>
                <span dir="ltr">info@acsd.sa</span>
              </a>

              <a
                href="tel:+966533198555"
                className="flex items-center gap-3 transition-colors hover:text-[#e6bd67]"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[#e6bd67]">
                  <Phone className="h-4 w-4" />
                </span>
                <span dir="ltr">053 319 8555</span>
              </a>

              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/10 text-[#e6bd67]">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>محافظة الدرب، منطقة جازان، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/60 sm:flex-row">
          <p className="text-center sm:text-right">
            جميع الحقوق محفوظة © {currentYear} الجمعية التعاونية الزراعية للتطوير والاستدامة.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[#e6bd67] hover:text-[#e6bd67]"
          >
            <span>العودة للأعلى</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
