export function normalizeName(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/department of|dept\.? of|dept\.?/g, "")
    .replace(/faculty of/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const aliases: Record<string, string> = {
  "computer sciences": "computer science",
  "comp science": "computer science",
  "software eng": "software engineering",
  "cybersecurity": "cyber security",
  "information tech": "information technology",
};

export function normalizeDepartment(value?: string): string {
  const normalized = normalizeName(value);
  return aliases[normalized] ?? normalized;
}

export function sameDepartment(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const left = normalizeDepartment(a);
  const right = normalizeDepartment(b);
  return left === right || left.includes(right) || right.includes(left);
}
