import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole } from "../../auth/auth.middleware.js";
import { UserRole } from "../../users/user.types.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { uploadRateLimiter } from "../../../middleware/security.middleware.js";
import { AppError } from "../../../utils/AppError.js";
import { analyzeTimetableImport, confirmTimetableImport } from "./timetable-import.controller.js";
import { confirmImportSchema } from "./timetable-import.validator.js";

const supportedTypes: Record<string, string[]> = {
  ".csv": ["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip"],
  ".pdf": ["application/pdf"],
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 4 },
  fileFilter: (_req, file, cb) => {
    const match = file.originalname.toLowerCase().match(/\.[a-z0-9]+$/);
    const extension = match?.[0];
    const allowedMimes = extension ? supportedTypes[extension] : undefined;
    if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
      return cb(new AppError(400, "UNSUPPORTED_TIMETABLE_FILE", "Upload a valid CSV, XLSX, DOCX or text-based PDF file"));
    }
    cb(null, true);
  },
});

export const timetableImportRouter = Router();
timetableImportRouter.use(authenticate, requireRole(UserRole.STUDENT));
timetableImportRouter.post("/analyze", uploadRateLimiter, upload.single("file"), analyzeTimetableImport);
timetableImportRouter.post("/confirm", validate(confirmImportSchema), confirmTimetableImport);
