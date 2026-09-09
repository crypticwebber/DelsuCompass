import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
export function notFoundHandler(req:Request,_res:Response,next:NextFunction){next(new AppError(404,"ROUTE_NOT_FOUND",`Route ${req.method} ${req.originalUrl} was not found`))}
