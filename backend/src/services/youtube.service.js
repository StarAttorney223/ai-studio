import { google } from "googleapis";
import { Readable } from "stream";
import { getDecryptedSocialAccount } from "./social-account.service.js";

function simulateUpload(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate exactly 11-char string
      const videoId = Math.random().toString(36).substring(2, 13).padEnd(11, 'x');
      resolve({
        platform: "youtube",
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`
      });
    }, 1500 + Math.random() * 500); // 1.5s - 2s delay
  });
}

async function realUpload(data) {
  throw new Error("YouTube API not configured yet");
  
  /* Placeholder for future logic that was in this file:
  const { userId, content, mediaUrls, meta } = data;
  const videoUrl = mediaUrls?.[0];
  const title = meta?.youtube?.title || "New YouTube Video";
  const description = meta?.youtube?.description || content || "";
  
  const socialAccount = await getDecryptedSocialAccount(userId, "youtube");
  if (!socialAccount?.accessToken) throw new Error("Connect your YouTube account first");

  const videoResp = await fetch(videoUrl);
  if (!videoResp.ok) throw new Error("Failed to download video from Cloudinary for YouTube upload");
  
  const arrayBuffer = await videoResp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: socialAccount.accessToken });

  const youtube = google.youtube({ version: "v3", auth });

  try {
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: { title, description },
        status: { privacyStatus: "public" },
      },
      media: { body: stream },
    });

    return {
      platform: "youtube",
      videoId: response.data.id,
      url: `https://www.youtube.com/watch?v=${response.data.id}`
    };
  } catch (error) {
    if (error.response && error.response.status === 403 && error.response.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
        throw new Error("YouTube API quota exceeded");
    }
    throw new Error(error.message || "Failed to upload to YouTube");
  }
  */
}

import { env } from "../config/env.js";

export async function publishToYouTube(data) {
  if (env.youtubeMode === "mock") {
    return simulateUpload(data);
  } else {
    return realUpload(data);
  }
}
