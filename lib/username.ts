const MIN_LENGTH = 3;
const MAX_LENGTH = 20;
const FALLBACK = "dev";

export function usernameFromName(name?: string | null): string {
  const slug = (name ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, MAX_LENGTH)
    .replace(/-+$/, "");

  return slug.length >= MIN_LENGTH ? slug : FALLBACK;
}
