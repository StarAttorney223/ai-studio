import crypto from "crypto";
import { env } from "../config/env.js";
import { google } from "googleapis";
import {
  getDecryptedSocialAccount,
  getSocialAccount,
  upsertSocialAccount
} from "../services/social-account.service.js";
import { publishToYouTube } from "../services/youtube.service.js";

const YOUTUBE_SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];
const DEFAULT_FRONTEND_URL = "http://localhost:5173";
const DEFAULT_REDIRECT_PATH = "/create-post";

function requireYouTubeConfig() {
  if (!env.youtubeClientId || !env.youtubeClientSecret || !env.youtubeRedirectUri) {
    console.warn("YouTube OAuth is not configured on the server. Environment variables missing.");
  }
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    env.youtubeClientId || "dummy",
    env.youtubeClientSecret || "dummy",
    env.youtubeRedirectUri || "http://localhost:5000/auth/youtube/callback"
  );
}

function signYouTubeState(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", env.authSecret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function verifyYouTubeState(state) {
  const [encodedPayload, signature] = String(state || "").split(".");
  if (!encodedPayload || !signature) return null;
  const expectedSignature = crypto.createHmac("sha256", env.authSecret).update(encodedPayload).digest("base64url");
  if (expectedSignature !== signature) return null;
  try {
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function getFrontendRedirectUrl(origin, path = DEFAULT_REDIRECT_PATH, params = {}) {
  const safeOrigin = origin || env.frontendUrl || DEFAULT_FRONTEND_URL;
  const redirectUrl = new URL(path || DEFAULT_REDIRECT_PATH, safeOrigin);
  Object.entries(params).forEach(([key, value]) => {
    if (value) redirectUrl.searchParams.set(key, value);
  });
  return redirectUrl.toString();
}

export async function getYoutubeAuthUrlController(req, res) {
  requireYouTubeConfig();
  const frontendOrigin = req.headers.origin || env.frontendUrl || DEFAULT_FRONTEND_URL;
  const redirectPath = typeof req.query.redirectPath === "string" ? req.query.redirectPath : DEFAULT_REDIRECT_PATH;
  
  const state = signYouTubeState({
    userId: String(req.user._id),
    frontendOrigin,
    redirectPath,
    issuedAt: Date.now()
  });

  const oauth2Client = getOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: YOUTUBE_SCOPES,
    state,
    prompt: "consent"
  });

  return res.status(200).json({ success: true, data: { authUrl } });
}

export async function youtubeCallbackController(req, res) {
  requireYouTubeConfig();
  const { code, state, error: oauthError } = req.query;
  const statePayload = verifyYouTubeState(state);

  if (!statePayload?.userId) {
    return res.redirect(getFrontendRedirectUrl(undefined, DEFAULT_REDIRECT_PATH, { youtube: "error", message: "Invalid authorization state" }));
  }

  if (oauthError) {
    return res.redirect(getFrontendRedirectUrl(statePayload.frontendOrigin, statePayload.redirectPath, { youtube: "error", message: oauthError }));
  }

  if (!code) {
    return res.redirect(getFrontendRedirectUrl(statePayload.frontendOrigin, statePayload.redirectPath, { youtube: "error", message: "Missing authorization code" }));
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(String(code));
    
    await upsertSocialAccount({
      userId: statePayload.userId,
      platform: "youtube",
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || "", // Store refresh token securely
      expiresIn: Math.floor(((tokens.expiry_date || Date.now() + 3600000) - Date.now()) / 1000)
    });

    return res.redirect(getFrontendRedirectUrl(statePayload.frontendOrigin, statePayload.redirectPath, { youtube: "connected" }));
  } catch (error) {
    return res.redirect(getFrontendRedirectUrl(statePayload.frontendOrigin, statePayload.redirectPath, { youtube: "error", message: "YouTube connection failed" }));
  }
}

export async function getYoutubeStatusController(req, res) {
  if (env.youtubeMode === "mock") {
    return res.status(200).json({
      success: true,
      data: {
        connected: true,
        createdAt: new Date(),
        expiresAt: null
      }
    });
  }

  const account = await getSocialAccount(req.user._id, "youtube");
  return res.status(200).json({
    success: true,
    data: {
      connected: Boolean(account),
      createdAt: account?.createdAt || null,
      expiresAt: account?.tokenExpiresAt || null
    }
  });
}

export async function publishYouTubeController(req, res) {
  const { title, description, videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ success: false, message: "videoUrl is required" });
  }

  if (!title) {
    return res.status(400).json({ success: false, message: "title is required for YouTube video" });
  }

  try {
    if (env.youtubeMode === "real") {
      const socialAccount = await getDecryptedSocialAccount(req.user._id, "youtube");
      if (!socialAccount?.accessToken) {
        return res.status(400).json({ success: false, message: "Connect your YouTube account first" });
      }

      let accessToken = socialAccount.accessToken;
      
      // Check expiry
      if (socialAccount.account.tokenExpiresAt && new Date() > new Date(socialAccount.account.tokenExpiresAt)) {
        if (!socialAccount.refreshToken) {
           return res.status(401).json({ success: false, message: "YouTube session expired. Please reconnect." });
        }
        
        const oauth2Client = getOAuth2Client();
        oauth2Client.setCredentials({ refresh_token: socialAccount.refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        accessToken = credentials.access_token;
        
        await upsertSocialAccount({
          userId: req.user._id,
          platform: "youtube",
          accessToken,
          refreshToken: credentials.refresh_token || socialAccount.refreshToken,
          expiresIn: Math.floor(((credentials.expiry_date || Date.now() + 3600000) - Date.now()) / 1000)
        });
      }
    }

    const result = await publishToYouTube({
      platform: "youtube",
      userId: req.user._id,
      mediaUrls: [videoUrl],
      meta: {
        youtube: {
          title,
          description
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        youtubeVideoId: result.videoId || result.id
      }
    });
  } catch (error) {
    return res.status(error.message.includes("quota") ? 403 : 502).json({
      success: false,
      message: error.message || "Unable to publish to YouTube"
    });
  }
}
