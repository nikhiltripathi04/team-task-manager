import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
  createProject,
  addMemberToProject,
  removeMemberFromProject,
  getProjectById,
  getUserProjects,
} from "./project.service";

export const createProjectController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const project = await createProject(
      name,
      description,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await removeMemberFromProject(
      projectId as string,
      userId,
      req.user.id
    );

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const addMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await addMemberToProject(
      projectId as string,
      userId,
      req.user.id
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProjectController = async (
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

    const project = await getProjectById(projectId as string, req.user.id);

    return res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    const status = error.message === "Project not found" ? 404 : 403;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserProjectsController = async (
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

    const projects = await getUserProjects(req.user.id);

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};