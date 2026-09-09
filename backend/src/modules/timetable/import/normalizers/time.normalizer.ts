function to24(hour: number, minute: number, meridiem?: string) {
  let h = hour;
  if (meridiem) {
    const m = meridiem.toLowerCase();
    if (m === "pm" && h < 12) h += 12;
    if (m === "am" && h === 12) h = 0;
  }
  if (h > 23 || minute > 59) return undefined;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function normalizeTime(value?: string): string | undefined {
  if (!value) return undefined;
  const cleaned = value.trim().replace(/\./g, ":");

  // 0800 / 1400 style values often appear in faculty timetables.
  const compact = cleaned.match(/\b([01]?\d|2[0-3])([0-5]\d)\b/);
  if (compact && !cleaned.includes(":")) return to24(Number(compact[1]), Number(compact[2]));

  const match = cleaned.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!match) return undefined;
  return to24(Number(match[1]), Number(match[2] ?? 0), match[3]);
}

export function extractTimeRange(value?: string): { startTime?: string; endTime?: string } {
  if (!value) return {};
  const cleaned = value.replace(/\s+/g, " ").trim();
  const pieces = cleaned.split(/\s*(?:-|–|—|to|until)\s*/i);
  if (pieces.length >= 2) return { startTime: normalizeTime(pieces[0]), endTime: normalizeTime(pieces[1]) };

  // Fallback for values such as "8:00am 10:00am" where extraction lost a dash.
  const matches = [...cleaned.matchAll(/\b(?:[01]?\d|2[0-3])(?::[0-5]\d)?\s*(?:am|pm)?\b/gi)].map((m) => normalizeTime(m[0])).filter(Boolean) as string[];
  return matches.length >= 2 ? { startTime: matches[0], endTime: matches[1] } : {};
}
