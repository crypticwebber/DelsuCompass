import argon2 from "argon2";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { UserModel } from "../modules/users/user.model.js";
import { UserRole } from "../modules/users/user.types.js";

async function run() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || "DELSU Compass Administrator";
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 8 characters");

  await connectDatabase();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await UserModel.findOneAndUpdate(
    { email },
    { fullName, email, passwordHash, role: UserRole.ADMINISTRATOR, isVerified: true, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  console.log(`Administrator ready: ${email}`);
  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error(error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
