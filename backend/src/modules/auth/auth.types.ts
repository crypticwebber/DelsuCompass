import type { UserRole } from "../users/user.types.js";

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  type: "access";
}

export interface JwtRefreshPayload {
  sub: string;
  sid: string;
  type: "refresh";
}
