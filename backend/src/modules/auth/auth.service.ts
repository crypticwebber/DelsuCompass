import argon2 from "argon2";
import crypto from "node:crypto";
import { UserModel } from "../users/user.model.js";
import { UserRole, type PublicUser } from "../users/user.types.js";
import { RefreshSessionModel } from "./refresh-session.model.js";
import { jwtService } from "./jwt.service.js";
import { AppError } from "../../utils/AppError.js";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const VERIFY_TTL_MS = 15 * 60 * 1000;
const RESET_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }
function toPublicUser(user: any): PublicUser {
  return { id:user._id.toString(), fullName:user.fullName, email:user.email, role:user.role, profileImage:user.profileImage, phoneNumber:user.phoneNumber, department:user.department, faculty:user.faculty, level:user.level, isVerified:user.isVerified, isActive:user.isActive, createdAt:user.createdAt, updatedAt:user.updatedAt };
}

async function createVerificationOtp(userId: string) {
  const otp = String(crypto.randomInt(100000, 1000000));
  await UserModel.findByIdAndUpdate(userId, { emailVerificationOtpHash: hashToken(otp), emailVerificationExpiresAt: new Date(Date.now() + VERIFY_TTL_MS) });
  return otp;
}

async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  await UserModel.findByIdAndUpdate(userId, { passwordResetTokenHash: hashToken(rawToken), passwordResetExpiresAt: new Date(Date.now() + RESET_TTL_MS) });
  return rawToken;
}

async function createSession(user: any, metadata: { userAgent?: string; ipAddress?: string }) {
  const session = await RefreshSessionModel.create({ userId:user._id, tokenHash:"pending", expiresAt:new Date(Date.now()+REFRESH_TTL_MS), userAgent:metadata.userAgent, ipAddress:metadata.ipAddress });
  const refreshToken = jwtService.createRefreshToken({ sub:user._id.toString(), sid:session._id.toString() });
  session.tokenHash = hashToken(refreshToken); await session.save();
  const accessToken = jwtService.createAccessToken({ sub:user._id.toString(), email:user.email, role:user.role });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input:{fullName:string;email:string;password:string}) {
    const existing=await UserModel.findOne({email:input.email}); if(existing) throw new AppError(409,"EMAIL_IN_USE","An account with this email already exists");
    const passwordHash=await argon2.hash(input.password,{type:argon2.argon2id});
    const user=await UserModel.create({fullName:input.fullName,email:input.email,passwordHash,role:UserRole.STUDENT});
    const verificationOtp=await createVerificationOtp(user._id.toString());
    return {user:toPublicUser(user),verificationOtp};
  },
  async login(input:{email:string;password:string},metadata:{userAgent?:string;ipAddress?:string}) {
    const user=await UserModel.findOne({email:input.email}).select("+passwordHash");
    if(!user||!(await argon2.verify(user.passwordHash,input.password))) throw new AppError(401,"INVALID_CREDENTIALS","Invalid email or password");
    if(!user.isActive) throw new AppError(403,"ACCOUNT_DISABLED","This account has been disabled");
    if(!user.isVerified) throw new AppError(403,"EMAIL_NOT_VERIFIED","Verify your email before signing in");
    const tokens=await createSession(user,metadata); return {user:toPublicUser(user),...tokens};
  },
  async refresh(rawToken:string,metadata:{userAgent?:string;ipAddress?:string}) {
    let payload; try{payload=jwtService.verifyRefreshToken(rawToken)}catch{throw new AppError(401,"INVALID_REFRESH_TOKEN","Refresh token is invalid or expired")}
    const session=await RefreshSessionModel.findById(payload.sid).select("+tokenHash");
    if(!session||session.revokedAt||session.expiresAt<=new Date()||session.tokenHash!==hashToken(rawToken)) throw new AppError(401,"INVALID_REFRESH_TOKEN","Refresh session is invalid or expired");
    const user=await UserModel.findById(payload.sub); if(!user||!user.isActive||!user.isVerified) throw new AppError(401,"INVALID_SESSION","User session is no longer valid");
    session.revokedAt=new Date(); await session.save(); const tokens=await createSession(user,metadata); return {user:toPublicUser(user),...tokens};
  },
  async logout(rawToken?:string){if(!rawToken)return;try{const payload=jwtService.verifyRefreshToken(rawToken);await RefreshSessionModel.findByIdAndUpdate(payload.sid,{revokedAt:new Date()})}catch{}},
  async verifyEmail(input:{email:string;otp:string}) {
    const user=await UserModel.findOne({email:input.email.toLowerCase(),emailVerificationOtpHash:hashToken(input.otp),emailVerificationExpiresAt:{$gt:new Date()}}).select("+emailVerificationOtpHash +emailVerificationExpiresAt");
    if(!user) throw new AppError(400,"INVALID_VERIFICATION_CODE","Verification code is invalid or expired");
    user.isVerified=true; user.emailVerificationOtpHash=undefined; user.emailVerificationExpiresAt=undefined; await user.save(); return toPublicUser(user);
  },
  async resendVerification(email:string){const user=await UserModel.findOne({email});if(!user||user.isVerified)return{accepted:true,verificationOtp:undefined as string|undefined,user:null as PublicUser|null};const verificationOtp=await createVerificationOtp(user._id.toString());return{accepted:true,verificationOtp,user:toPublicUser(user)}},
  async forgotPassword(email:string){const user=await UserModel.findOne({email});if(!user||!user.isActive)return{accepted:true,resetToken:undefined as string|undefined,user:null as PublicUser|null};const resetToken=await createPasswordResetToken(user._id.toString());return{accepted:true,resetToken,user:toPublicUser(user)}},
  async resetPassword(input:{token:string;password:string}){const user=await UserModel.findOne({passwordResetTokenHash:hashToken(input.token),passwordResetExpiresAt:{$gt:new Date()}}).select("+passwordResetTokenHash +passwordResetExpiresAt +passwordHash");if(!user)throw new AppError(400,"INVALID_RESET_TOKEN","Password reset link is invalid or expired");user.passwordHash=await argon2.hash(input.password,{type:argon2.argon2id});user.passwordResetTokenHash=undefined;user.passwordResetExpiresAt=undefined;user.passwordChangedAt=new Date();await user.save();await RefreshSessionModel.updateMany({userId:user._id,revokedAt:{$exists:false}},{$set:{revokedAt:new Date()}});return{user:toPublicUser(user)}},
  async getById(id:string){const user=await UserModel.findById(id);if(!user)throw new AppError(404,"USER_NOT_FOUND","User not found");return toPublicUser(user)},
};
