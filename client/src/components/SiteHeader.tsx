import { Button } from "@/components/ui/button";
import { navigationItems } from "@/content/siteContent";
import { ArrowLeft, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const logoUrl = "/storage/acsd-official-logo_112cc60c.jpg";

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-[#d9c995]/70 bg-[#fbf8ed]/95 shadow-[0_8px_24px_rgba(21,62,35,0.08)] backdrop-blur"
          : "border-transparent bg-[#fbf8ed]/90 backdrop-blur"
      }`}
    >
      <div className="container flex h-[4.7rem] items-center justify-between gap-4 sm:h-[5.4rem] sm:gap-5">
        <a href="/" className="flex items-center gap-3 text-right" aria-label="العودة إلى الرئيسية">
          <span
            className="hidden flex-col items-center justify-center border-l border-[#d9c995] pl-2 sm:flex"
            aria-hidden="true"
          >
            <span className="brand-crown" />
            <span className="mt-1 text-[0.55rem] font-extrabold tracking-[0.22em] text-[#a67017]">
              ACSD
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_18px_rgba(16,77,40,0.12)] ring-1 ring-[#d7b15c]/45 sm:h-12 sm:w-12">
            <img
              src={logoUrl}
              alt="شعار الجمعية"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/acsd-official-logo.jpg";
              }}
            />
          </span>
          <span className="block min-w-0">
            <span className="display-font block truncate text-[0.8rem] font-extrabold leading-tight text-[#155029] sm:text-sm">
              الجمعية التعاونية الزراعية
            </span>
            <span className="block truncate pt-0.5 text-[0.62rem] font-medium text-[#9b6a1c] sm:text-xs">
              للتطوير والاستدامة
            </span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 lg:flex xl:gap-3" aria-label="التنقل الرئيسي">
          {navigationItems.map(item => {
            const isActive =
              item.href === "/"
                ? location === "/"
                : location === item.href || location.startsWith(`${item.href}/`);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-[#165B2A] text-white shadow-sm"
                    : "text-[#315441] hover:bg-[#e8f0df] hover:text-[#155029]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden lg:block">
          <a href="/contact">
            <Button className="h-10 rounded-full bg-[#165B2A] px-5 font-bold text-white shadow-[0_6px_18px_rgba(22,91,42,0.2)] transition-transform duration-200 hover:bg-[#10461f] active:scale-[0.97]">
              تواصل معنا <ArrowLeft className="mr-1.5 h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(value => !value)}
          className="grid h-11 w-11 place-items-center rounded-full border border-[#d9c995] bg-white text-[#155029] lg:hidden"
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <nav
          className="max-h-[calc(100dvh-4.7rem)] overflow-y-auto border-t border-[#e4d7b5] bg-[#fbf8ed] px-4 py-4 shadow-lg lg:hidden"
          aria-label="التنقل عبر الجوال"
        >
          <div className="mx-auto flex max-w-md flex-col gap-1.5">
            {navigationItems.map(item => {
              const isActive =
                item.href === "/"
                  ? location === "/"
                  : location === item.href || location.startsWith(`${item.href}/`);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-[#165B2A] text-white"
                      : "text-[#315441] hover:bg-[#e8f0df] hover:text-[#155029]"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
            <a
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-[#e6bd67] px-4 py-2.5 text-sm font-bold text-[#155029]"
            >
              تواصل معنا
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
