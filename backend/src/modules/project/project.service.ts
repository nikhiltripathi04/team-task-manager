import { Project } from "./project.model";
import { User } from "../auth/user.model";
import { Types } from "mongoose";

export const createProject = async (
  name: string,
  description: string | undefined,
  userId: string
) => {
  const project = await Project.create({
    name,
    description,
    createdBy: new Types.ObjectId(userId),
    members: [new Types.ObjectId(userId)], // 👈 auto-add creator
  });

  return project;
};

export const getUserProjects = async (userId: string) => {
  return await Project.find({
    $or: [{ createdBy: userId }, { members: userId }],
  })
    .select("name description members createdBy createdAt")
    .populate("createdBy", "name email")
    .populate("members", "name email");
};

export const addMemberToProject = async (
  projectId: string,
  userId: string,
  currentUserId: string
) => {
  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // RBAC: Only creator can add members
  if (project.createdBy.toString() !== currentUserId.toString()) {
    throw new Error("Not authorized to add members to this project");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent adding creator again
  if (project.createdBy.toString() === user._id.toString()) {
    throw new Error("Creator is already part of the project");
  }

  // Prevent duplicate members
  const isAlreadyMember = project.members.some(
    (memberId) => memberId.toString() === user._id.toString()
  );

  if (isAlreadyMember) {
    throw new Error("User already a member");
  }

  project.members.push(user._id as Types.ObjectId);
  await project.save();

  return {
    message: "Member added successfully",
    members: project.members,
  };
};

export const removeMemberFromProject = async (
  projectId: string,
  userId: string,
  currentUserId: string
) => {
  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // RBAC: Only creator can remove members
  if (project.createdBy.toString() !== currentUserId.toString()) {
    throw new Error("Not authorized to remove members from this project");
  }

  // Prevent removing the creator
  if (project.createdBy.toString() === userId.toString()) {
    throw new Error("Cannot remove the project creator");
  }

  // Check if user is actually a member
  const isMember = project.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );

  if (!isMember) {
    throw new Error("User is not a member of this project");
  }

  // Remove member using $pull for atomicity
  await Project.findByIdAndUpdate(projectId, {
    $pull: { members: userId },
  });

  // Fetch updated project for response
  const updatedProject = await Project.findById(projectId);

  return {
    message: "Member removed successfully",
    members: updatedProject?.members || [],
  };
};

export const getProjectById = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId)
    .populate("members", "name email")
    .populate("createdBy", "name email");

  if (!project) {
    throw new Error("Project not found");
  }

  // RBAC: User must be either the creator OR a member to view details
  const isCreator = project.createdBy._id.toString() === userId.toString();
  const isMember = project.members.some(
    (member: any) => member._id.toString() === userId.toString()
  );

  if (!isCreator && !isMember) {
    throw new Error("Not authorized to view this project");
  }

  return project;
};