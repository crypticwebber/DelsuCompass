import http from "node:http";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function bootstrap() {
  console.log(`Starting DELSU Compass API in ${env.NODE_ENV} mode...`);
  await connectDatabase();
  const server = http.createServer(app);
  server.listen(env.PORT, () => console.log(`DELSU Compass API running on http://localhost:${env.PORT}`));

  const shutdown = async (signal: string) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  console.error("Failed to start DELSU Compass API:", error);
  console.error("Check MONGODB_URI, network access, and whether MongoDB/Atlas is reachable.");
  process.exit(1);
});
