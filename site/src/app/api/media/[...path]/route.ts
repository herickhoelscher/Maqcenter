import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_UPLOAD_DIR } from "@/lib/storage";

// Serves images uploaded in the admin when Vercel Blob is not configured
// (local development).
export async function GET(_request: Request, ctx: RouteContext<"/api/media/[...path]">) {
  const { path: parts } = await ctx.params;
  const file = path.normalize(path.join(LOCAL_UPLOAD_DIR, ...parts));
  if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep) || !file.endsWith(".webp")) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
