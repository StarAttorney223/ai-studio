import { Router } from "express";
import {
  getLinkedInAuthUrlController,
  getLinkedInStatusController,
  linkedinCallbackController,
  publishLinkedInPostController
} from "../controllers/linkedin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/auth/linkedin", asyncHandler(requireAuth), asyncHandler(getLinkedInAuthUrlController));
router.get("/auth/linkedin/status", asyncHandler(requireAuth), asyncHandler(getLinkedInStatusController));
router.get("/auth/linkedin/callback", asyncHandler(linkedinCallbackController));
router.post("/post/linkedin", asyncHandler(requireAuth), asyncHandler(publishLinkedInPostController));

export default router;
