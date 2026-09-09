import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { rejectNoSqlOperatorInjection, requestIdMiddleware } from "../src/middleware/request-security.middleware.js";
import { errorHandler } from "../src/middleware/error.middleware.js";

function testApp() {
  const app = express();
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(rejectNoSqlOperatorInjection);
  app.post("/test", (_req, res) => res.json({ success: true }));
  app.use(errorHandler);
  return app;
}

describe("request security middleware", () => {
  it("adds a request id", async () => {
    const response = await request(testApp()).post("/test").send({ ok: true });
    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("rejects MongoDB operator keys", async () => {
    const response = await request(testApp()).post("/test").send({ email: { $ne: null } });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("UNSAFE_REQUEST_KEY");
  });

  it("rejects dotted keys", async () => {
    const response = await request(testApp()).post("/test").send({ "profile.role": "administrator" });
    expect(response.status).toBe(400);
  });
});
