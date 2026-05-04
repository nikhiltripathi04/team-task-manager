import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import projectRoutes from "./modules/project/project.routes";
import taskRoutes from "./modules/task/task.routes";
import { globalErrorHandler } from "./middleware/error.middleware";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Team Task Manager API is running...");
});

// Global Error Handler (Must be after routes)
app.use(globalErrorHandler);

export default app;