import { publishPost } from "../services/publish.service.js";

export async function publishPostController(req, res) {
  try {
    const data = {
      ...req.body,
      userId: req.user._id // add userId from the request
    };
    
    if (!data.platform) {
      return res.status(400).json({ success: false, message: "platform is required" });
    }

    const result = await publishPost(data);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to publish post"
    });
  }
}
