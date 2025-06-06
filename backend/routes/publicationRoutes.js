import express from "express";
import {
  createPublication,
  getPublications,
  getPublicationById,
  getMyPublications, // Ensure this is imported
  updatePublication,
  deletePublication,
  getReviewQueue,
  submitReview,
  adminGetAllPublications,
  adminDeletePublication,
} from "../controllers/publicationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  uploadPdf,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

// --- GROUP ALL SPECIFIC STRING ROUTES FIRST ---
router.get(
  "/my-publications",
  protect,
  authorize("user", "admin"),
  getMyPublications
); // ADDED MIDDLEWARE BACK
router.get(
  "/review/queue",
  protect,
  authorize("reviewer", "admin"),
  getReviewQueue
);
router.get("/admin/all", protect, authorize("admin"), adminGetAllPublications);

// --- THEN GROUP ROUTES FOR THE BASE PATH ('/') ---
router
  .route("/")
  .get(getPublications) // GET /api/publications
  .post(
    // POST /api/publications
    protect,
    authorize("user", "admin"),
    uploadPdf,
    handleUploadError,
    createPublication
  );

// --- THEN GROUP ROUTES WITH THE '/:id' PARAMETER ---
// This group handles /api/publications/SOME_OBJECT_ID for GET, PUT, DELETE by users
router
  .route("/:id")
  .get(protect, authorize("user", "reviewer", "admin"), getPublicationById)
  .put(
    protect,
    authorize("user", "admin"),
    uploadPdf,
    handleUploadError,
    updatePublication
  )
  .delete(protect, authorize("user"), deletePublication); // User deletes own

// --- THEN OTHER SPECIFIC PARAMETERIZED ROUTES (IF THEIR PREFIXES ARE DISTINCT) ---
// e.g., /review/:id is distinct from /:id because of the '/review' prefix
router
  .route("/review/:id")
  .put(protect, authorize("reviewer", "admin"), submitReview);

router
  .route("/admin/:id")
  .delete(protect, authorize("admin"), adminDeletePublication);

export default router;
