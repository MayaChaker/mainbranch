const SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

export function escapeRegex(text: string): string {
  return text.replace(SPECIAL_CHARACTERS, "\\$&");
}
