export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validCpf(d: string): boolean {
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

function validCnpj(d: string): boolean {
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const check = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + w * Number(d[i]), 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return check(12) === Number(d[12]) && check(13) === Number(d[13]);
}

/** CPF (11 digits) or CNPJ (14 digits), with check digits. */
export function isDocument(value: string): boolean {
  const d = onlyDigits(value);
  return d.length === 11 ? validCpf(d) : d.length === 14 ? validCnpj(d) : false;
}

export function formatDocument(value: string): string {
  const d = onlyDigits(value);
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return value;
}

/** Parses "1.234,56" or "1234.56" into cents. Empty means null. */
export function parseMoneyToCents(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (!s) return null;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function centsToInput(cents: number | null): string {
  return cents == null ? "" : (cents / 100).toFixed(2).replace(".", ",");
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
