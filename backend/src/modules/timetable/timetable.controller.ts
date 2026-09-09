import type { RequestHandler } from "express";
import { timetableService } from "./timetable.service.js";

export const listTimetableEntries: RequestHandler = async (req, res, next) => {
  try {
    const data = await timetableService.list(req.auth!.userId, req.query as { day?: string; courseCode?: string });
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

export const getTimetableEntry: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await timetableService.getById(req.auth!.userId, String(req.params.id)) }); }
  catch (error) { next(error); }
};

export const createTimetableEntry: RequestHandler = async (req, res, next) => {
  try {
    const data = await timetableService.create(req.auth!.userId, req.body);
    res.status(201).json({ success: true, message: "Class added to timetable", data });
  } catch (error) { next(error); }
};

export const updateTimetableEntry: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, message: "Timetable entry updated", data: await timetableService.update(req.auth!.userId, String(req.params.id), req.body) }); }
  catch (error) { next(error); }
};

export const deleteTimetableEntry: RequestHandler = async (req, res, next) => {
  try {
    await timetableService.remove(req.auth!.userId, String(req.params.id));
    res.json({ success: true, message: "Timetable entry deleted" });
  } catch (error) { next(error); }
};
