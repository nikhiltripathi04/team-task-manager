import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").trim(),
    description: z.string().optional(),
    projectId: z.string().regex(objectIdRegex, "Invalid Project ID"),
    assignedTo: z.string().regex(objectIdRegex, "Invalid Assigned User ID"),
    dueDate: z.string().optional(),
    status: z.enum(["todo", "in-progress", "done"]).optional(),
  }),
});
