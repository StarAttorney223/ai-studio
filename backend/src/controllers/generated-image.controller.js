import {
  deleteGeneratedImageById,
  listGeneratedImages,
  reorderGeneratedImages,
  toggleFavoriteImageById
} from "../services/generated-image.service.js";

export async function listGeneratedImagesController(req, res) {
  const images = await listGeneratedImages();
  return res.status(200).json({ success: true, data: images });
}

export async function toggleFavoriteImageController(req, res) {
  const image = await toggleFavoriteImageById(req.params.id);

  if (!image) {
    return res.status(404).json({ success: false, message: "Image not found" });
  }

  return res.status(200).json({ success: true, data: image });
}

export async function reorderGeneratedImagesController(req, res) {
  const { items = [] } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: "items must be an array" });
  }

  const images = await reorderGeneratedImages(items);
  return res.status(200).json({ success: true, data: images });
}

export async function deleteGeneratedImageController(req, res) {
  const deleted = await deleteGeneratedImageById(req.params.id);

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Image not found" });
  }

  return res.status(200).json({ success: true, message: "Image deleted" });
}
