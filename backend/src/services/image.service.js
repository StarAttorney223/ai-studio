import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";
import { env } from "../config/env.js";

const HF_API_URL = "https://router.huggingface.co/hf-inference/models";

function getDimensions(aspectRatio) {
  const map = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "4:5": { width: 896, height: 1120 },
    "5:4": { width: 1120, height: 896 },
    "4:3": { width: 1152, height: 864 },
    "3:4": { width: 864, height: 1152 },
    "3:2": { width: 1216, height: 832 },
    "2:3": { width: 832, height: 1216 },
    "21:9": { width: 1344, height: 576 }
  };

  return map[aspectRatio] || map["16:9"];
}

function getGenerationConfig({ aspectRatio, mode, type }) {
  const isThumbnail = type === "thumbnail" || mode === "thumbnail";
  let width = 1024;
  let height = 1024;
  let resolvedAspectRatio = aspectRatio || "1:1";

  if (isThumbnail) {
    width = 1280;
    height = 720;
    resolvedAspectRatio = "16:9";
  } else {
    const dimensions = getDimensions(aspectRatio || "1:1");
    width = dimensions.width;
    height = dimensions.height;
  }

  return {
    isThumbnail,
    width,
    height,
    aspectRatio: resolvedAspectRatio
  };
}

function buildPollinationsUrl(prompt, generationConfig) {
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=${generationConfig.width}&height=${generationConfig.height}&nologo=true`;
}

async function enforceExactDimensions(arrayBuffer, { width, height }) {
  return sharp(Buffer.from(arrayBuffer))
    .resize(width, height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toBuffer();
}

async function uploadBufferToCloudinary(buffer, { folder, prompt, aspectRatio, type }) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "png",
        tags: ["studio", type || "image", aspectRatio || "unknown"],
        context: prompt ? `prompt=${prompt}` : undefined
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloud upload failed"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    stream.end(buffer);
  });
}

async function uploadResponseToCloudinary(response, generationConfig, meta) {
  const arrayBuffer = await response.arrayBuffer();
  const resizedBuffer = await enforceExactDimensions(arrayBuffer, generationConfig);
  return uploadBufferToCloudinary(resizedBuffer, meta);
}

function buildImagePrompt({ prompt, aspectRatio, style, lighting, mode, textOverlay }) {
  const parts = [
    "Create an image.",
    `Prompt: ${prompt}.`,
    `Aspect Ratio: ${aspectRatio}.`,
    `Style: ${style}.`,
    `Lighting: ${lighting}.`
  ];

  if (mode === "thumbnail") {
    parts.push(
      "Generate a high-contrast thumbnail with bold composition, attention-grabbing visuals, a centered subject, and clear space for text.",
      "high contrast, bold lighting, cinematic, youtube thumbnail style, vibrant colors, sharp focus, dramatic composition."
    );

    if (textOverlay?.trim()) {
      parts.push(
        `Incorporate this headline as prominent overlay text: "${textOverlay.trim()}".`,
        "Use a large bold font positioned near the center or top for readability."
      );
    }
  }

  return parts.join(" ");
}

export async function generateImageFromPrompt({
  prompt,
  aspectRatio,
  style,
  lighting,
  mode = "image",
  type = "image",
  textOverlay = ""
}) {
  const generationConfig = getGenerationConfig({ aspectRatio, mode, type });
  const input = buildImagePrompt({
    prompt,
    aspectRatio: generationConfig.aspectRatio,
    style,
    lighting,
    mode: generationConfig.isThumbnail ? "thumbnail" : mode,
    textOverlay
  });

  const candidateModels = [
    env.huggingFaceImageModel,
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0"
  ].filter(Boolean);

  let lastError = "Image generation failed";

  console.log("Generated size:", generationConfig.width, generationConfig.height);

  if (env.huggingFaceApiKey) {
    for (const model of candidateModels) {
      try {
        const response = await fetch(`${HF_API_URL}/${model}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.huggingFaceApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            inputs: input,
            parameters: {
              width: generationConfig.width,
              height: generationConfig.height,
              aspect_ratio: generationConfig.isThumbnail ? "16:9" : generationConfig.aspectRatio
            }
          })
        });

        if (response.ok) {
          return uploadResponseToCloudinary(response, generationConfig, {
            folder: "studio-images/generated",
            prompt,
            aspectRatio: generationConfig.aspectRatio,
            type
          });
        }

        const errorPayload = await response.json().catch(() => ({}));
        lastError = errorPayload?.error || lastError;
      } catch (error) {
        lastError = error.message || lastError;
      }
    }
  }

  const fallbackResponse = await fetch(buildPollinationsUrl(input, generationConfig)).catch(() => null);
  if (fallbackResponse?.ok) {
    return uploadResponseToCloudinary(fallbackResponse, generationConfig, {
      folder: "studio-images/generated",
      prompt,
      aspectRatio: generationConfig.aspectRatio,
      type
    });
  }

  throw new Error(lastError);
}
