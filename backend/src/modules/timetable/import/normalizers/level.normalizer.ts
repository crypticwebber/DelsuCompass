export function detectLevel(value?: string): number | undefined {
  if (!value) return undefined;
  const direct = value.match(/\b([1-7])00\s*(?:level|lvl|l)?\b/i);
  if (direct) return Number(direct[1]) * 100;
  const year = value.match(/\byear\s*([1-7])\b/i);
  if (year) return Number(year[1]) * 100;
  return undefined;
}
