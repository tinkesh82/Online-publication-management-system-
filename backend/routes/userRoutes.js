import express from "express";
import {
  addReviewer,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes below are admin-only
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getAllUsers);

router.route("/add-reviewer").post(addReviewer);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default router;
