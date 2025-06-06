import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  authorize, // For admin-only registration if implemented
} from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // Consider admin protection for role assignment
router.post("/login", loginUser);
router.get("/me", protect, getMe);

export default router;
