import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/error.middleware";
import { sendResponse } from "./utils/apiResponse";
import { logger } from "./utils/logger";

import authRoutes from "./modules/auth/auth.routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  logger("Health check route hit");
  return sendResponse(res, 200, true, "API is running");
});

app.use(errorHandler);

export default app;