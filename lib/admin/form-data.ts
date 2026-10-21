/** Read a string field from a submitted dashboard form. */
export function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Read a number field, preserving invalid input as NaN for validation. */
export function formNumber(formData: FormData, key: string, fallback = 0): number {
  const value = formText(formData, key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

/** Read an HTML checkbox value. */
export function formCheckbox(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}
