import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import sharp from "sharp";

// Images uploaded in the admin. Converted to WebP (max 1600px wide) and
// stored in Vercel Blob when BLOB_READ_WRITE_TOKEN is set; otherwise in the
// local uploads/ folder, served by /api/media (development).

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export type StoredImage = { src: string; width: number; height: number };

export class UploadError extends Error {}

export async function saveImage(file: File, folder: string, opts: { maxWidth?: number; lossless?: boolean } = {}): Promise<StoredImage> {
  if (!ACCEPTED.includes(file.type)) throw new UploadError("Envie uma imagem JPG, PNG, WebP ou AVIF.");
  if (file.size > MAX_BYTES) throw new UploadError("A imagem passa de 10 MB.");

  const input = Buffer.from(await file.arrayBuffer());
  const { data, info } = await sharp(input)
    .rotate()
    .resize({ width: opts.maxWidth ?? 1600, withoutEnlargement: true })
    .webp(opts.lossless ? { lossless: true } : { quality: 80 })
    .toBuffer({ resolveWithObject: true });

  const name = `${folder}/${Date.now()}-${randomUUID().slice(0, 8)}.webp`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(name, data, { access: "public", contentType: "image/webp" });
    return { src: blob.url, width: info.width, height: info.height };
  }

  const dest = path.join(LOCAL_UPLOAD_DIR, name);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, data);
  return { src: `/api/media/${name}`, width: info.width, height: info.height };
}

/** The file field is empty when the admin did not pick a new image. */
export function pickedFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size > 0 ? value : null;
}
