import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { JwtAccessPayload, JwtRefreshPayload } from "./auth.types.js";

function sign(payload: object, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret as Secret, { expiresIn } as SignOptions);
}

export const jwtService = {
  createAccessToken(payload: Omit<JwtAccessPayload, "type">) {
    return sign({ ...payload, type: "access" }, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
  },
  createRefreshToken(payload: Omit<JwtRefreshPayload, "type">) {
    return sign({ ...payload, type: "refresh" }, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
  },
  verifyAccessToken(token: string) {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as JwtAccessPayload;
    if (decoded.type !== "access") throw new Error("Invalid token type");
    return decoded;
  },
  verifyRefreshToken(token: string) {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as JwtRefreshPayload;
    if (decoded.type !== "refresh") throw new Error("Invalid token type");
    return decoded;
  },
};
