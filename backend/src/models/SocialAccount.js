import mongoose from "mongoose";

const socialAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    platform: { type: String, enum: ["linkedin"], required: true },
    accessToken: { type: String, required: true },
    tokenExpiresAt: { type: Date, default: null },
    linkedinMemberId: { type: String, default: "" }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

socialAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

export const SocialAccount = mongoose.model("SocialAccount", socialAccountSchema);
