import mongoose from "mongoose";

const generatedImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    prompt: { type: String, default: "" },
    aspectRatio: { type: String, default: "16:9" },
    type: { type: String, enum: ["image", "thumbnail"], default: "image" },
    textOverlay: { type: String, default: "" },
    isFavorite: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const GeneratedImage = mongoose.model("GeneratedImage", generatedImageSchema);
