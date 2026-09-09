import { describe, expect, it } from "vitest";
import { moderateEventSchema } from "../src/modules/events/event.validator.js";
import { moderateOpportunitySchema } from "../src/modules/opportunities/opportunity.validator.js";
import { moderateCommunitySchema } from "../src/modules/community/community.validator.js";
import { moderateListingSchema } from "../src/modules/accommodation/accommodation.validator.js";

const id = "507f1f77bcf86cd799439011";

const cases = [
  ["event", moderateEventSchema],
  ["opportunity", moderateOpportunitySchema],
  ["community", moderateCommunitySchema],
  ["accommodation", moderateListingSchema],
] as const;

describe("moderation rejection reasons", () => {
  for (const [name, schema] of cases) {
    it(`requires a clear reason when rejecting ${name}`, () => {
      expect(() => schema.parse({ params: { id }, body: { status: "rejected" } })).toThrow();
      expect(() => schema.parse({ params: { id }, body: { status: "rejected", reason: "No" } })).toThrow();
    });

    it(`accepts a useful rejection reason for ${name}`, () => {
      expect(() => schema.parse({ params: { id }, body: { status: "rejected", reason: "Please correct the inaccurate details before resubmitting." } })).not.toThrow();
    });
  }
});
