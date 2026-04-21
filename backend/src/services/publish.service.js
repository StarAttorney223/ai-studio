import { publishToYouTube } from "./youtube.service.js";
import { getDecryptedSocialAccount, updateLinkedInMemberId } from "./social-account.service.js";
import { getProfile, createPost } from "./linkedin.service.js";

export async function publishToLinkedIn(data) {
  const { userId, content, mediaUrls } = data;
  const mediaUrl = mediaUrls?.[0]; // take the first media url
  
  const socialAccount = await getDecryptedSocialAccount(userId, "linkedin");
  if (!socialAccount?.accessToken) {
    const err = new Error("Connect your LinkedIn account first");
    err.statusCode = 400;
    throw err;
  }
  
  try {
    const profile = await getProfile(socialAccount.accessToken);
    const author = `urn:li:person:${profile.sub}`;
    
    if (profile.sub && socialAccount.account.linkedinMemberId !== profile.sub) {
      await updateLinkedInMemberId(userId, profile.sub);
    }
    
    const result = await createPost(socialAccount.accessToken, content, author, mediaUrl);
    
    return {
      platform: "linkedin",
      linkedInPostId: result.id,
      url: `https://www.linkedin.com/feed/update/${result.id}`
    };
  } catch (error) {
    const statusCode = error.statusCode || 502;
    const err = new Error(
      statusCode === 401
        ? "LinkedIn session expired. Please reconnect your account."
        : error.message || "Unable to publish to LinkedIn"
    );
    err.statusCode = statusCode;
    throw err;
  }
}

export async function publishPost(data) {
  switch (data.platform) {
    case "youtube":
      return publishToYouTube(data);
    case "linkedin":
      return publishToLinkedIn(data);
    default:
      throw new Error(`Unsupported platform: ${data.platform}`);
  }
}
