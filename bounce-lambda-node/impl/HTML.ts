export function htmlEncode(s?: string | null): string {
  if (s == null) {
    return "";
  }
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/=/g, "&equals;")
    ;
}

export function jsEscapeString(s?: string | null): string {
  if (s == null) {
    return "";
  }
  return s
    .replace(/[\\]/g, "\\\\")
    .replace(/([`'"$])/g, "\\$1")
    .replace(/\u0000/g, "\\0")
    ;
}
