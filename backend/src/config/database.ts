import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  const target = env.MONGODB_URI.replace(/:\/\/([^:@/]+):([^@/]+)@/, "://$1:***@");
  console.log(`Connecting to MongoDB: ${target}`);
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log("MongoDB connected.");
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
