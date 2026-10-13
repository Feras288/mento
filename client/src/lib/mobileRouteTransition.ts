export function shouldInterceptMobileNavClick(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export function shouldReduceMobileMotion(mediaQueryMatches: boolean) {
  return mediaQueryMatches;
}

export function shouldShowMobileRouteSkeleton(phase: "idle" | "leaving" | "entering") {
  return phase === "leaving";
}
