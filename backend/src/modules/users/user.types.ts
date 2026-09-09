export enum UserRole {
  STUDENT = "student",
  ADMINISTRATOR = "administrator",
}

export interface PublicUser {
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
  createdAt: Date;
  updatedAt: Date;
}
