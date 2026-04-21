import { Router } from "express";
import {
  getYoutubeAuthUrlController,
  getYoutubeStatusController,
  youtubeCallbackController,
  publishYouTubeController
} from "../controllers/youtube.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/auth/youtube", asyncHandler(requireAuth), asyncHandler(getYoutubeAuthUrlController));
router.get("/auth/youtube/status", asyncHandler(requireAuth), asyncHandler(getYoutubeStatusController));
router.get("/auth/youtube/callback", asyncHandler(youtubeCallbackController));
router.post("/post/youtube", asyncHandler(requireAuth), asyncHandler(publishYouTubeController));

export default router;
