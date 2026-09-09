import type { RequestHandler } from "express";
import { reminderService } from "./reminder.service.js";

export const listReminders: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, data: await reminderService.list(req.auth!.userId) }); }
  catch (error) { next(error); }
};

export const createReminder: RequestHandler = async (req, res, next) => {
  try { res.status(201).json({ success: true, message: "Class reminder created", data: await reminderService.create(req.auth!.userId, req.body) }); }
  catch (error) { next(error); }
};

export const updateReminder: RequestHandler = async (req, res, next) => {
  try { res.json({ success: true, message: "Reminder updated", data: await reminderService.update(req.auth!.userId, String(req.params.id), req.body) }); }
  catch (error) { next(error); }
};

export const deleteReminder: RequestHandler = async (req, res, next) => {
  try { await reminderService.remove(req.auth!.userId, String(req.params.id)); res.json({ success: true, message: "Reminder deleted" }); }
  catch (error) { next(error); }
};
