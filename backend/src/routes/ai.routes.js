import { Router } from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import {
  chatController,
  generateCaptionAiController,
  generateContentController,
  generateImageController
} from "../controllers/ai.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const uploadsDir = path.resolve(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage });

router.post("/generate-content", upload.single("image"), asyncHandler(generateContentController));
router.post("/generate-image", asyncHandler(generateImageController));
router.post("/chat", asyncHandler(chatController));
router.post("/ai/generate-caption", asyncHandler(generateCaptionAiController));

export default router;
