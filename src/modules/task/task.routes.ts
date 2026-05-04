import express from "express";
import { 
  createTaskController, 
  getTasksByProjectController,
  updateTaskStatusController,
  assignTaskController,
  getMyTasksController
} from "./task.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = express.Router();

// Get My Tasks (Must be above /:taskId routes to avoid conflict)
router.get("/my-tasks", authenticate, getMyTasksController);

// Create Task
router.post("/", authenticate, createTaskController);

// Get Tasks by Project
router.get("/project/:projectId", authenticate, getTasksByProjectController);

// Update Status
router.patch("/:taskId/status", authenticate, updateTaskStatusController);

// Assign Task
router.patch("/:taskId/assign", authenticate, assignTaskController);

export default router;
