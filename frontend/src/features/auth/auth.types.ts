export type UserRole = "student" | "administrator";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  phoneNumber?: string;
  department?: string;
  faculty?: string;
  level?: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  user: AuthUser;
  accessToken: string;
}
