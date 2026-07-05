/** Client-side guard rails for uploaded workbooks — checked before the file
 *  ever reaches SheetJS, so oversized or wrong-type files fail fast with a
 *  clear message instead of freezing the tab or throwing a cryptic parser
 *  error. */

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];

export type FileValidationResult = { ok: true } | { ok: false; reason: "type" | "size" | "empty" };

export function validateWorkbookFile(file: File): FileValidationResult {
  const name = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!hasValidExtension) return { ok: false, reason: "type" };
  if (file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, reason: "size" };
  return { ok: true };
}
