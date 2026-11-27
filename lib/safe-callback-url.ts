const BASE = "http://mainbranch.local";
const FALLBACK = "/";

export function safeCallbackUrl(value?: string | null): string {
  if (!value || !value.startsWith("/")) return FALLBACK;

  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return FALLBACK;
    return url.pathname + url.search + url.hash;
  } catch {
    return FALLBACK;
  }
}
