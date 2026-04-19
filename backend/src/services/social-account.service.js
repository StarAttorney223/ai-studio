import crypto from "crypto";
import { env } from "../config/env.js";
import { SocialAccount } from "../models/SocialAccount.js";

function getEncryptionKey() {
  return crypto.createHash("sha256").update(env.authSecret).digest();
}

function encryptValue(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decryptValue(value) {
  const [ivPart, authTagPart, encryptedPart] = String(value || "").split(".");
  if (!ivPart || !authTagPart || !encryptedPart) {
    return "";
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(authTagPart, "base64url"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

export async function upsertSocialAccount({
  userId,
  platform,
  accessToken,
  expiresIn = 0,
  linkedinMemberId = ""
}) {
  const tokenExpiresAt = expiresIn ? new Date(Date.now() + Number(expiresIn) * 1000) : null;

  return SocialAccount.findOneAndUpdate(
    { userId, platform },
    {
      accessToken: encryptValue(accessToken),
      tokenExpiresAt,
      ...(linkedinMemberId ? { linkedinMemberId } : {})
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    }
  );
}

export async function getSocialAccount(userId, platform) {
  return SocialAccount.findOne({ userId, platform });
}

export async function getDecryptedSocialAccount(userId, platform) {
  const account = await getSocialAccount(userId, platform);
  if (!account) {
    return null;
  }

  return {
    account,
    accessToken: decryptValue(account.accessToken)
  };
}

export async function updateLinkedInMemberId(userId, linkedinMemberId) {
  return SocialAccount.findOneAndUpdate(
    { userId, platform: "linkedin" },
    { linkedinMemberId },
    { new: true }
  );
}
