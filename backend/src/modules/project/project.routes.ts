import express from "express";
import {
  createProjectController,
  addMemberController,
  removeMemberController,
  getProjectController,
  getUserProjectsController,
} from "./project.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

const router = express.Router();

// Project routes
router.post("/", authenticate, authorize("admin"), createProjectController);
router.get("/", authenticate, getUserProjectsController);

// Fetch project details (Available to creator AND members)
router.get("/:projectId", authenticate, getProjectController);

// Member management
router.post(
  "/:projectId/members",
  authenticate,
  authorize("admin"),
  addMemberController
);

router.delete(
  "/:projectId/members",
  authenticate,
  authorize("admin"),
  removeMemberController
);

export default router;