import { CalendarDays, Home, MessageCircle, Newspaper, Sprout } from "lucide-react";
import { useLocation } from "wouter";
import { useMobileRouteTransition } from "./MobileRouteTransition";
import { shouldInterceptMobileNavClick } from "@/lib/mobileRouteTransition";

const navigation = [
  { href: "/", label: "الرئيسية", Icon: Home },
  { href: "/about", label: "عن الجمعية", Icon: Sprout },
  { href: "/news", label: "الأخبار", Icon: Newspaper },
  { href: "/events", label: "الفعاليات", Icon: CalendarDays },
  { href: "/contact", label: "تواصل معنا", Icon: MessageCircle },
];

export default function MobileBottomNav() {
  const [location, navigate] = useLocation();
  const { phase, navigateWithAnimation } = useMobileRouteTransition();
  if (location.startsWith("/admin")) return null;

  const handleNavigation = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!shouldInterceptMobileNavClick(event)) return;
    event.preventDefault();
    if (phase !== "idle") return;
    if (href === location) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      return;
    }
    navigateWithAnimation(href, navigate);
  };

  return (
    <nav
      className="mobile-bottom-nav fixed inset-x-3 bottom-3 z-50 rounded-[1.45rem] border border-[#d9c995]/90 bg-[#fbf8ed]/95 px-1.5 pt-1.5 shadow-[0_14px_34px_rgba(16,58,34,0.19)] backdrop-blur lg:hidden"
      aria-label="التنقل السريع للجوال"
    >
      <div className="grid grid-cols-5 gap-0.5" dir="rtl">
        {navigation.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? location === "/" : location === href || location.startsWith(`${href}/`);
          return (
            <a
              key={href}
              href={href}
              onClick={event => handleNavigation(event, href)}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={phase !== "idle"}
              className={`flex min-h-13 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-center transition-all duration-200 active:scale-[0.95] ${
                phase !== "idle" ? "pointer-events-none" : ""
              } ${
                isActive
                  ? "bg-[#165b2a] text-white shadow-[0_5px_14px_rgba(22,91,42,0.22)]"
                  : "text-[#54715d] hover:bg-[#e8f0df] hover:text-[#155029]"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={isActive ? 2.3 : 1.9} />
              <span className="text-[0.62rem] font-extrabold leading-none">{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
