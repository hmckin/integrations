export const CALENDLY_URL =
  "https://calendly.com/harry-hmckinney/30min?primary_color=cd5402";

export function openCalendlyPopup(event) {
  // Preserve standard browser behavior for Cmd/Ctrl/Shift/middle-click
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    (typeof event.button === "number" && event.button !== 0)
  ) {
    return;
  }

  if (typeof window !== "undefined" && window.Calendly?.initPopupWidget) {
    event.preventDefault();
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
  }
}