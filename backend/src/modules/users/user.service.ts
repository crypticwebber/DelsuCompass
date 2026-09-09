import { AppError } from "../../utils/AppError.js";
import { UserModel } from "./user.model.js";

function toPublicUser(user: any) {
  return {
    id: user._id.toString(), fullName: user.fullName, email: user.email, role: user.role,
    profileImage: user.profileImage, phoneNumber: user.phoneNumber, department: user.department,
    faculty: user.faculty, level: user.level, isVerified: user.isVerified, isActive: user.isActive,
    createdAt: user.createdAt, updatedAt: user.updatedAt,
  };
}

export const userService = {
  async updateMe(userId: string, input: Record<string, unknown>) {
    const user = await UserModel.findByIdAndUpdate(userId, { $set: input }, { new: true, runValidators: true });
    if (!user) throw new AppError(404, "USER_NOT_FOUND", "User not found");
    return toPublicUser(user);
  },
};
