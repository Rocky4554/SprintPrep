import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { ATTACHMENTS_BUCKET } from "@/models/MasterTopic";

export interface UploadedFileMeta {
  fileId: ObjectId;
  originalName: string;
  mimeType: string;
  size: number;
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

export function isAllowedFile(file: File): boolean {
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

async function getBucket(): Promise<GridFSBucket> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not connected.");
  return new GridFSBucket(db, { bucketName: ATTACHMENTS_BUCKET });
}

export async function uploadAttachment(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadedFileMeta> {
  const bucket = await getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(originalName, {
      metadata: { mimeType, originalName },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id,
        originalName,
        mimeType,
        size: buffer.length,
      });
    });

    uploadStream.end(buffer);
  });
}

export async function downloadAttachment(fileId: string) {
  const bucket = await getBucket();
  const objectId = new ObjectId(fileId);

  const files = await bucket.find({ _id: objectId }).toArray();
  if (files.length === 0) return null;

  const file = files[0];
  const stream = bucket.openDownloadStream(objectId);

  return {
    stream,
    filename: (file.metadata?.originalName as string) || file.filename,
    mimeType: (file.metadata?.mimeType as string) || "application/octet-stream",
    size: file.length,
  };
}

export async function deleteAttachment(fileId: string): Promise<void> {
  const bucket = await getBucket();
  await bucket.delete(new ObjectId(fileId));
}
