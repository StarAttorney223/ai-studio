import { Router } from "express";
import {
  deleteGeneratedImageController,
  listGeneratedImagesController,
  reorderGeneratedImagesController,
  toggleFavoriteImageController
} from "../controllers/generated-image.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/images", asyncHandler(listGeneratedImagesController));
router.patch("/images/:id/favorite", asyncHandler(toggleFavoriteImageController));
router.patch("/images/reorder", asyncHandler(reorderGeneratedImagesController));
router.delete("/images/:id", asyncHandler(deleteGeneratedImageController));

export default router;
