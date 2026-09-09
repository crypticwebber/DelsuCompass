import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validate } from "../src/middleware/validate.middleware.js";
import { errorHandler } from "../src/middleware/error.middleware.js";

describe("validate middleware on Express 5", () => {
  it("applies parsed/defaulted query values without assigning to Express 5 req.query getter", async () => {
    const app = express();
    app.get(
      "/items",
      validate(z.object({ query: z.object({ page: z.coerce.number().int().default(1), status: z.enum(["pending", "approved"]).default("pending") }) })),
      (req, res) => res.json({ page: req.query.page, status: req.query.status }),
    );
    app.use(errorHandler);

    const response = await request(app).get("/items?page=2&status=approved");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ page: 2, status: "approved" });
  });

  it("applies query defaults when the URL has no query string", async () => {
    const app = express();
    app.get(
      "/items",
      validate(z.object({ query: z.object({ page: z.coerce.number().int().default(1) }) })),
      (req, res) => res.json({ page: req.query.page }),
    );
    app.use(errorHandler);

    const response = await request(app).get("/items");
    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
  });
});
