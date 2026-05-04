import express from "express";
import cors from "cors";

import { errorHandler } from "./middleware/error.middleware";
import { sendResponse } from "./utils/apiResponse";
import { logger } from "./utils/logger";

import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";
import taskRoutes from "./modules/task/task.routes";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health check route
app.get("/", (req, res) => {
  logger("Health check route hit");
  return sendResponse(res, 200, true, "API is running");
});

app.use(errorHandler);

export default app;