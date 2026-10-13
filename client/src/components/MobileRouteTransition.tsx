import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { shouldReduceMobileMotion, shouldShowMobileRouteSkeleton } from "@/lib/mobileRouteTransition";

type TransitionPhase = "idle" | "leaving" | "entering";

type MobileRouteTransitionContextValue = {
  phase: TransitionPhase;
  navigateWithAnimation: (href: string, navigate: (href: string) => void) => void;
};

const MobileRouteTransitionContext = createContext<MobileRouteTransitionContextValue | null>(null);

export function MobileRouteTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const navigateWithAnimation = useCallback((href: string, navigate: (href: string) => void) => {
    if (phase !== "idle") return;
    if (shouldReduceMobileMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      navigate(href);
      return;
    }
    setPhase("leaving");
    timers.current.push(window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      navigate(href);
      setPhase("entering");
      timers.current.push(window.setTimeout(() => setPhase("idle"), 260));
    }, 140));
  }, [phase]);

  return <MobileRouteTransitionContext.Provider value={{ phase, navigateWithAnimation }}>{children}</MobileRouteTransitionContext.Provider>;
}

export function useMobileRouteTransition() {
  const context = useContext(MobileRouteTransitionContext);
  if (!context) throw new Error("useMobileRouteTransition must be used inside MobileRouteTransitionProvider");
  return context;
}

export function MobileRouteFrame({ children }: { children: ReactNode }) {
  const { phase } = useMobileRouteTransition();
  return <>
    <div className={`mobile-route-frame ${phase === "leaving" ? "mobile-route-leaving" : ""} ${phase === "entering" ? "mobile-route-entering" : ""}`}>{children}</div>
    {shouldShowMobileRouteSkeleton(phase) && <div className="mobile-route-skeleton fixed inset-0 z-40 overflow-hidden bg-[#f3f1e4] px-4 pt-5 lg:hidden" aria-live="polite" aria-label="جارٍ الانتقال إلى الصفحة المحددة">
      <div className="mx-auto flex max-w-md items-center justify-between border-b border-[#d9c995]/60 pb-4">
        <div className="h-11 w-11 animate-pulse rounded-full bg-[#e5eadf]" />
        <div className="space-y-2 text-center"><div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-[#dbe6d5]" /><div className="mx-auto h-2 w-20 animate-pulse rounded-full bg-[#eee4c9]" /></div>
        <div className="h-11 w-11 animate-pulse rounded-full bg-[#e9e2ca]" />
      </div>
      <div className="mx-auto mt-8 max-w-md space-y-5">
        <div className="h-5 w-24 animate-pulse rounded-full bg-[#eadfc2]" />
        <div className="h-10 w-4/5 animate-pulse rounded-xl bg-[#dce8d6]" />
        <div className="h-4 w-full animate-pulse rounded-full bg-[#e2e7dc]" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-[#e2e7dc]" />
        <div className="mt-8 h-56 animate-pulse rounded-bl-[3rem] rounded-tr-[3rem] bg-[linear-gradient(135deg,#e2eddc,#f5edd9)]" />
      </div>
      <span className="sr-only">جارٍ تحميل الصفحة</span>
    </div>}
  </>;
}
