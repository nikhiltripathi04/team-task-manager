import { Router } from "express";
import { register, login, searchUser } from "./auth.controller";

import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/auth.middleware";

const router = Router();

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.get("/search", authenticate, searchUser);

router.get("/me", authenticate, (req: any, res) => {
  res.status(200).json({
    success: true,
    message: "Access granted",
    user: req.user,
  });
});

router.get("/protected", authenticate, (req: any, res) => {
  res.json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

router.get("/admin", authenticate, authorize("admin"), (req: any, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});

router.get("/admin-only", authenticate, authorize("admin"), (req: any, res) => {
  res.json({
    success: true,
    message: "Welcome Admin 🚀",
  });
});

export default router;