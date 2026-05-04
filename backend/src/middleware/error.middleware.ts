import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Duplicate key error (MongoDB code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};