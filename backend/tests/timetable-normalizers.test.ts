import { describe, expect, it } from "vitest";
import { normalizeTime, extractTimeRange } from "../src/modules/timetable/import/normalizers/time.normalizer.js";
import { detectLevel } from "../src/modules/timetable/import/normalizers/level.normalizer.js";
import { normalizeDepartment, sameDepartment } from "../src/modules/timetable/import/normalizers/department.normalizer.js";

 describe("timetable import normalizers", () => {
  it("normalizes 12-hour and 24-hour time", () => {
    expect(normalizeTime("8:30 am")).toBe("08:30");
    expect(normalizeTime("2:15 PM")).toBe("14:15");
    expect(normalizeTime("14:00")).toBe("14:00");
    expect(normalizeTime("0800")).toBe("08:00");
  });

  it("extracts timetable ranges", () => {
    expect(extractTimeRange("8:00 AM - 10:00 AM")).toEqual({ startTime: "08:00", endTime: "10:00" });
    expect(extractTimeRange("0800-1000")).toEqual({ startTime: "08:00", endTime: "10:00" });
  });

  it("detects common DELSU level labels", () => {
    expect(detectLevel("Computer Science 400 Level")).toBe(400);
    expect(detectLevel("Year 3")).toBe(300);
    expect(detectLevel("200L")).toBe(200);
  });

  it("normalizes common department aliases", () => {
    expect(normalizeDepartment("Department of Computer Sciences")).toBe("computer science");
    expect(sameDepartment("Dept. of Computer Science", "Computer Science")).toBe(true);
  });
});
