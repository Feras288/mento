import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="العودة إلى أعلى الصفحة"
      className="fixed bottom-20 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#d9c995] bg-[#165B2A] text-white shadow-[0_8px_20px_rgba(22,91,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#10461f] hover:shadow-[0_12px_28px_rgba(22,91,42,0.4)] active:scale-95 sm:bottom-6 sm:left-6"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
