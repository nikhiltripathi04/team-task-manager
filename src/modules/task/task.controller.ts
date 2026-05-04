import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as taskService from "./task.service";

export const createTaskController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    const task = await taskService.createTask(req.body, req.user.id);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTasksByProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tasks = await taskService.getTasksByProject(
      projectId as string,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    const status = error.message === "Project not found" ? 404 : 403;
    res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTaskStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedTask = await taskService.updateTaskStatus(
      taskId as string,
      status,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const assignTaskController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedTask = await taskService.assignTask(
      taskId as string,
      assignedTo,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyTasksController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const tasks = await taskService.getMyTasks(req.user.id);

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTaskStatsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const stats = await taskService.getTaskStats(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Task statistics fetched successfully",
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch task statistics",
    });
  }
};
