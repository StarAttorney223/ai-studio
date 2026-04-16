import { GeneratedImage } from "../models/GeneratedImage.js";

export async function listGeneratedImages(limit = 200) {
  return GeneratedImage.find()
    .sort({ order: 1, createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getNextImageOrder() {
  const latest = await GeneratedImage.findOne().sort({ order: -1 }).lean();
  return typeof latest?.order === "number" ? latest.order + 1 : 0;
}

export async function createGeneratedImage(payload) {
  return GeneratedImage.create(payload);
}

export async function deleteGeneratedImageById(id) {
  return GeneratedImage.findByIdAndDelete(id).lean();
}

export async function toggleFavoriteImageById(id) {
  const image = await GeneratedImage.findById(id);

  if (!image) {
    return null;
  }

  image.isFavorite = !image.isFavorite;
  await image.save();
  return image.toObject();
}

export async function reorderGeneratedImages(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  await Promise.all(
    items.map((item, index) =>
      GeneratedImage.findByIdAndUpdate(item.id, { order: typeof item.order === "number" ? item.order : index })
    )
  );

  return listGeneratedImages();
}
