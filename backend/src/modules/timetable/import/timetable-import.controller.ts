import type { RequestHandler } from "express";
import { AppError } from "../../../utils/AppError.js";
import { timetableImportService } from "./timetable-import.service.js";

export const analyzeTimetableImport: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError(400, "TIMETABLE_FILE_REQUIRED", "Choose a timetable file to upload");
    const data = await timetableImportService.analyze(req.auth!.userId, req.file);
    res.json({ success: true, message: "Timetable analyzed", data });
  } catch (error) { next(error); }
};

export const confirmTimetableImport: RequestHandler = async (req, res, next) => {
  try {
    const data = await timetableImportService.confirm(req.auth!.userId, req.body);
    res.status(201).json({ success: true, message: "Timetable imported successfully", data });
  } catch (error) { next(error); }
};
