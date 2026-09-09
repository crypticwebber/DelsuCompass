import { z } from "zod";
import { NAVIGATION_MODES } from "./navigation.types.js";

export const directionsSchema = z.object({
  body: z.object({
    start: z.object({
      latitude: z.coerce.number().min(-90).max(90),
      longitude: z.coerce.number().min(-180).max(180),
    }),
    destination: z.object({
      latitude: z.coerce.number().min(-90).max(90),
      longitude: z.coerce.number().min(-180).max(180),
    }),
    mode: z.enum(NAVIGATION_MODES).default("walking"),
  }),
});
