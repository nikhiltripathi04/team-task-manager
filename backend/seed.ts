import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./src/modules/auth/user.model";
import { Project } from "./src/modules/project/project.model";
import { Task } from "./src/modules/task/task.model";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/team-task-manager";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log("Cleared old data.");

    const hashedPassword = await bcrypt.hash("123456", 10);

    // 1. Create Team members
    const admin = await User.create({ name: "Admin User", email: "admin@test.com", password: hashedPassword, role: "admin" });
    const nikhil = await User.create({ name: "Nikhil Tripathi", email: "nikhil@test.com", password: hashedPassword, role: "member" });
    const sarah = await User.create({ name: "Sarah Designer", email: "designer@test.com", password: hashedPassword, role: "member" });
    const alex = await User.create({ name: "Alex Growth", email: "marketing@test.com", password: hashedPassword, role: "member" });

    console.log("Presentation Team created.");

    // 2. Main Production Project
    const production = await Project.create({
      name: "FlowState v1.0 Production",
      description: "Critical path to our public release. Includes core features and security hardening.",
      createdBy: admin._id,
      members: [admin._id, nikhil._id, sarah._id, alex._id]
    });

    // 3. Marketing Project
    const marketing = await Project.create({
      name: "Q4 Marketing & Hype",
      description: "Launch campaigns, social media assets, and press releases.",
      createdBy: admin._id,
      members: [admin._id, sarah._id, alex._id]
    });

    console.log("Structured Projects created.");

    // 4. Tasks for FlowState v1.0 (The Big Board)
    const productionTasks = [
      // DONE milestones
      { title: "JWT Auth Implementation", status: "done", project: production._id, assignedTo: nikhil._id, createdBy: admin._id },
      { title: "Core Architecture Setup", status: "done", project: production._id, assignedTo: nikhil._id, createdBy: admin._id },
      { title: "High-Fidelity Mockups", status: "done", project: production._id, assignedTo: sarah._id, createdBy: admin._id },
      
      // IN PROGRESS
      { title: "Task Deletion RBAC", status: "in-progress", project: production._id, assignedTo: nikhil._id, createdBy: nikhil._id },
      { title: "Glassmorphism UI Polish", status: "in-progress", project: production._id, assignedTo: sarah._id, createdBy: admin._id },
      { title: "Beta User Feedback", status: "in-progress", project: production._id, assignedTo: alex._id, createdBy: admin._id },
      
      // TODO (The Backlog)
      { title: "Production Deployment", status: "todo", project: production._id, assignedTo: nikhil._id, createdBy: admin._id },
      { title: "Email Notification System", status: "todo", project: production._id, assignedTo: alex._id, createdBy: alex._id },
      { title: "Landing Page SEO", status: "todo", project: production._id, assignedTo: sarah._id, createdBy: admin._id },
    ];

    // 5. Tasks for Marketing
    const marketingTasks = [
      { title: "Twitter Launch Campaign", status: "in-progress", project: marketing._id, assignedTo: alex._id, createdBy: alex._id },
      { title: "App Store Screenshots", status: "todo", project: marketing._id, assignedTo: sarah._id, createdBy: admin._id },
      { title: "Press Kit Preparation", status: "done", project: marketing._id, assignedTo: alex._id, createdBy: admin._id },
    ];

    await Task.insertMany([...productionTasks, ...marketingTasks]);
    console.log("Presentation Tasks distributed across status columns.");

    console.log("Seeding complete! 🚀 Presentation data ready.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
