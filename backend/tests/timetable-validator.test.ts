import { describe, expect, it } from "vitest";
import { createTimetableEntrySchema } from "../src/modules/timetable/timetable.validator.js";

describe("timetable validation", () => {
  const valid = {
    courseCode: "csc 401",
    courseTitle: "Software Engineering",
    day: "monday",
    startTime: "08:00",
    endTime: "10:00",
    venue: "LT 1",
  };

  it("accepts and normalizes a valid entry", () => {
    const parsed = createTimetableEntrySchema.parse({ body: valid });
    expect(parsed.body.courseCode).toBe("CSC 401");
  });

  it("rejects an end time earlier than start time", () => {
    expect(() => createTimetableEntrySchema.parse({ body: { ...valid, startTime: "12:00", endTime: "10:00" } })).toThrow();
  });
});
