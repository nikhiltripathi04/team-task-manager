import { Task } from "./task.model";
import { Project } from "../project/project.model";
import { User } from "../auth/user.model";
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

  // 3. RBAC: Only creator can assign to others
  let targetAssignee = assignedTo;
  if (!isCreator) {
    targetAssignee = currentUserId; // 👈 Forced self-assignment for members
  }

  // 4. Check assigned user is part of project
  const isAssignedUserMember =
    project.members.some(
      (member) => member.toString() === targetAssignee.toString()
    ) ||
    project.createdBy.toString() === targetAssignee.toString();

  if (!isAssignedUserMember) {
    throw new Error("Assigned user is not part of the project");
  }

  // 5. Create task
  const task = await Task.create({
    title,
    description,
    project: new Types.ObjectId(projectId),
    assignedTo: new Types.ObjectId(targetAssignee),
    createdBy: new Types.ObjectId(currentUserId),
    dueDate,
  });

  // 6. Rich population for UI readiness
  return await task.populate([
    { path: "assignedTo", select: "name email" },
    { path: "createdBy", select: "name email" },
    { path: "project", select: "name" },
  ]);
};

export const deleteTask = async (taskId: string, currentUserId: string) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  const project = await Project.findById(task.project);
  if (!project) throw new Error("Project not found");

  // RBAC: Only task creator OR project creator can delete
  const isTaskCreator = task.createdBy.toString() === currentUserId.toString();
  const isProjectCreator = project.createdBy.toString() === currentUserId.toString();

  if (!isTaskCreator && !isProjectCreator) {
    throw new Error("Not authorized to delete this task");
  }

  await Task.findByIdAndDelete(taskId);
  return { message: "Task deleted successfully" };
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
  const user = await User.findById(currentUserId);
  
  let query: any = { assignedTo: currentUserId };

  if (user?.role === "admin") {
    const ownedProjects = await Project.find({ createdBy: currentUserId }).select("_id");
    const projectIds = ownedProjects.map(p => p._id);
    
    query = {
      $or: [
        { project: { $in: projectIds } },
        { assignedTo: currentUserId }
      ]
    };
  }

  return await Task.find(query)
    .populate("project", "name description")
    .populate("assignedTo", "name email") // 👈 Added for Admin visibility
    .populate("createdBy", "name email")
    .sort({ dueDate: 1, createdAt: -1 }); // Priority by due date
};

export const getTaskStats = async (userId: string) => {
  const userObjectId = new Types.ObjectId(userId);
  const currentUser = await User.findById(userId);
  const now = new Date();

  // If Admin, match all tasks in projects they created
  // If Member, match only tasks assigned to them
  const matchStage = currentUser?.role === "admin" 
    ? { $or: [{ createdBy: userObjectId }, { assignedTo: userObjectId }] }
    : { assignedTo: userObjectId };

  // Actually, for Admin to see "Team" stats, we should find projects they own first
  let finalMatch: any = { assignedTo: userObjectId };

  if (currentUser?.role === "admin") {
    const ownedProjects = await Project.find({ createdBy: userObjectId }).select("_id");
    const projectIds = ownedProjects.map(p => p._id);
    finalMatch = { 
      $or: [
        { project: { $in: projectIds } },
        { assignedTo: userObjectId }
      ] 
    };
  }

  const stats = await Task.aggregate([
    {
      $match: finalMatch,
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        statusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        overdue: [
          {
            $match: {
              dueDate: { $lt: now },
              status: { $ne: "done" },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const result = stats[0];

  const getCount = (arr: any[]) => (arr && arr.length > 0 ? arr[0].count : 0);

  const statusMap: any = {
    todo: 0,
    "in-progress": 0,
    done: 0,
  };

  if (result.statusBreakdown) {
    result.statusBreakdown.forEach((item: any) => {
      statusMap[item._id] = item.count;
    });
  }

  return {
    total: getCount(result.total),
    todo: statusMap.todo,
    inProgress: statusMap["in-progress"],
    done: statusMap.done,
    overdue: getCount(result.overdue),
  };
};
