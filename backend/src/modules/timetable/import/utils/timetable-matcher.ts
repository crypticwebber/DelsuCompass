import { sameDepartment } from "../normalizers/department.normalizer.js";
import type { MatchConfidence, ParsedTimetableSection } from "../timetable-import.types.js";

export function matchCurrentSections(
  sections: ParsedTimetableSection[],
  profile: { department?: string; level?: number },
): { ids: string[]; confidence: MatchConfidence } {
  const exact = sections.filter((s) => s.level === profile.level && sameDepartment(s.department, profile.department));
  if (exact.length) return { ids: exact.map((s) => s.id), confidence: "high" };

  const levelOnly = sections.filter((s) => s.level === profile.level);
  if (levelOnly.length === 1) return { ids: levelOnly.map((s) => s.id), confidence: "medium" };

  const departmentOnly = sections.filter((s) => sameDepartment(s.department, profile.department) && !s.level);
  if (departmentOnly.length === 1) return { ids: departmentOnly.map((s) => s.id), confidence: "medium" };

  return { ids: [], confidence: "low" };
}
