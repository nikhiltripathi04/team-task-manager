import { Router } from "express";
import { register, login } from "./auth.controller";

import { protect } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/auth.middleware";

const router = Router();

// Auth Routes
router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, (req: any, res) => {
  res.status(200).json({
    success: true,
    message: "Access granted",
    user: req.user,
  });
});

router.get("/admin", protect, authorize("admin"), (req: any, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
  });
});

export default router;