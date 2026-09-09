import type { UserRole } from "../modules/users/user.types.js";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; email: string; role: UserRole };
      requestId?: string;
    }
  }
}
export {};
