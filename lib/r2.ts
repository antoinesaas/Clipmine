import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { readFile } from "fs/promises";

export const hasR2 = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET,
);

const r2 = hasR2
  ? new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const BUCKET = process.env.R2_BUCKET ?? "";
const EXPORT_PREFIX = "exports/";

export function exportStorageKey(jobId: string) {
  return `${EXPORT_PREFIX}${jobId}.mp4`;
}

export async function uploadToR2(localPath: string, key: string): Promise<string> {
  if (!r2) throw new Error("R2 not configured");
  const body = await readFile(localPath);
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: "video/mp4" }));
  return signR2Key(key);
}

export async function signR2Key(key: string, expiresIn = 60 * 60 * 24 * 7): Promise<string> {
  if (!r2) throw new Error("R2 not configured");
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
}

export async function deleteR2Key(key: string): Promise<void> {
  if (!r2) return;
  try {
    await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (e) {
    console.error("[r2] delete failed", key, e);
  }
}
