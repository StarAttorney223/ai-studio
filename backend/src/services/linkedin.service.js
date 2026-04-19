import { env } from "../config/env.js";

async function parseLinkedInResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

// ✅ GET USER PROFILE (OpenID)
export async function getProfile(accessToken) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "LinkedIn-Version": "202401" // ✅ REQUIRED
  };

  console.log("Headers being sent:", headers);

  const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers
  });

  const rawText = await profileResponse.clone().text();
  console.log("LinkedIn raw response:", rawText);

  const profileData = await parseLinkedInResponse(profileResponse);

  if (!profileResponse.ok) {
    console.error("LinkedIn API Error:", profileData);
    const error = new Error(profileData.message || "Unable to fetch LinkedIn profile");
    error.statusCode = profileResponse.status || 502;
    throw error;
  }

  return profileData;
}

export async function uploadImageToLinkedIn(accessToken, imageUrl, authorId) {
  const imageResp = await fetch(imageUrl);
  if (!imageResp.ok) throw new Error("Failed to download image for LinkedIn upload");
  const arrayBuffer = await imageResp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const registerResp = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202401"
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: authorId,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent"
          }
        ]
      }
    })
  });

  const registerData = await parseLinkedInResponse(registerResp);
  if (!registerResp.ok) throw new Error("Failed to register LinkedIn image upload");

  const uploadMechanism = registerData.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"];
  const uploadUrl = uploadMechanism?.uploadUrl;
  const assetUrn = registerData.value?.asset;

  if (!uploadUrl || !assetUrn) throw new Error("Invalid response from LinkedIn register upload");

  const uploadResp = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream"
    },
    body: buffer
  });

  if (!uploadResp.ok) throw new Error("Failed to upload binary image to LinkedIn");

  return assetUrn;
}

// ✅ CREATE POST
export async function createPost(accessToken, content, authorId, mediaUrl = null) {
  const specificContent = {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: {
        text: content.trim()
      },
      shareMediaCategory: "NONE"
    }
  };

  if (mediaUrl) {
    const assetUrn = await uploadImageToLinkedIn(accessToken, mediaUrl, authorId);
    specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory = "IMAGE";
    specificContent["com.linkedin.ugc.ShareContent"].media = [
      {
        status: "READY",
        media: assetUrn
      }
    ];
  }

  const publishResponse = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "LinkedIn-Version": "202401" // ✅ REQUIRED
    },
    body: JSON.stringify({
      author: authorId,
      lifecycleState: "PUBLISHED",
      specificContent,
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    })
  });

  const responseBody = await parseLinkedInResponse(publishResponse);

  if (!publishResponse.ok) {
    const error = new Error(responseBody.message || "Failed to publish to LinkedIn");
    error.statusCode = publishResponse.status || 502;
    throw error;
  }

  return {
    id: responseBody.id || publishResponse.headers.get("x-restli-id") || ""
  };
}