import { Task } from "./task.model";
import { Project } from "../project/project.model";
import { Types } from "mongoose";

export const createTask = async (
  data: {
    title: string;
    description?: string;
    projectId: string;
    assignedTo: string;
    dueDate?: Date;
  },
  currentUserId: string
) => {
  const { title, description, projectId, assignedTo, dueDate } = data;

  // 0. Input Discipline
  if (!title || title.trim() === "") {
    throw new Error("Task title is required");
  }

  // 1. Check project exists
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // 2. Check creator is part of project
  const isCreator =
    project.createdBy.toString() === currentUserId.toString();

  const isMember = project.members.some(
    (member) => member.toString() === currentUserId.toString()
  );

  if (!isCreator && !isMember) {
    throw new Error("Not authorized to create tasks in this project");
  }

  // 3. Check assigned user is part of project
  const isAssignedUserMember =
    project.members.some(
      (member) => member.toString() === assignedTo.toString()
    ) ||
    project.createdBy.toString() === assignedTo.toString();

  if (!isAssignedUserMember) {
    throw new Error("Assigned user is not part of the project");
  }

  // 4. Create task
  const task = await Task.create({
    title,
    description,
    project: new Types.ObjectId(projectId),
    assignedTo: new Types.ObjectId(assignedTo),
    createdBy: new Types.ObjectId(currentUserId),
    dueDate,
  });

  // 5. Rich population for UI readiness
  return await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
    { path: "project", select: "name" },
  ]);
};

export const getTasksByProject = async (
  projectId: string,
  currentUserId: string
) => {
  // 1. Check project exists
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  // 2. RBAC: User belongs to project?
  const isCreator =
    project.createdBy.toString() === currentUserId.toString();

  const isMember = project.members.some(
    (member) => member.toString() === currentUserId.toString()
  );

  if (!isCreator && !isMember) {
    throw new Error("Not authorized to view tasks for this project");
  }

  // 3. Fetch tasks with population
  return await Task.find({ project: projectId })
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
};

export const updateTaskStatus = async (
  taskId: string,
  status: "todo" | "in-progress" | "done",
  currentUserId: string
) => {
  // 1. Validate status
  const validStatuses = ["todo", "in-progress", "done"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  // 2. Find task
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // 3. Get project
  const project = await Project.findById(task.project);

  if (!project) {
    throw new Error("Project not found");
  }

  // 4. Authorization check: Only assigned user OR project creator
  const isAssignedUser =
    task.assignedTo.toString() === currentUserId.toString();

  const isCreator =
    project.createdBy.toString() === currentUserId.toString();

  if (!isAssignedUser && !isCreator) {
    throw new Error("Not authorized to update this task");
  }

  // 5. Update
  task.status = status;
  await task.save();

  return await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
  ]);
};

export const assignTask = async (
  taskId: string,
  newAssignedTo: string,
  currentUserId: string
) => {
  // 1. Find task
  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  // 2. Get project
  const project = await Project.findById(task.project);

  if (!project) {
    throw new Error("Project not found");
  }

  // 3. RBAC: Only creator can reassign
  const isCreator =
    project.createdBy.toString() === currentUserId.toString();

  if (!isCreator) {
    throw new Error("Not authorized to assign tasks in this project");
  }

  // 4. Check new user is in project
  const isMember =
    project.members.some(
      (member) => member.toString() === newAssignedTo.toString()
    ) || project.createdBy.toString() === newAssignedTo.toString();

  if (!isMember) {
    throw new Error("Assigned user is not part of the project");
  }

  // 5. Update
  task.assignedTo = newAssignedTo as any;
  await task.save();

  return await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
  ]);
};

export const getMyTasks = async (currentUserId: string) => {
  return await Task.find({
    assignedTo: currentUserId,
  })
    .populate("project", "name description")
    .populate("createdBy", "name email")
    .sort({ dueDate: 1, createdAt: -1 }); // Priority by due date
};
