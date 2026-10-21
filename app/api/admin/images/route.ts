import { getAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Uploads one image to the public Supabase `images` bucket for a signed-in admin. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return jsonError("Image uploads must come from this site.", 403);
  }

  const admin = await getAdmin();
  if (!admin) return jsonError("Sign in to upload images.", 401);

  const supabaseUrl = (
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/+$/, "");
  const storageKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !storageKey) {
    return jsonError("Image storage is not configured on the server.", 503);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Choose an image file and try again.", 400);
  }

  const scope = formData.get("scope");
  const file = formData.get("file");
  if (scope !== "products" && scope !== "categories") {
    return jsonError("Choose products or categories for this image.", 400);
  }
  if (!(file instanceof File)) return jsonError("Choose an image file.", 400);
  if (!file.size || file.size > MAX_FILE_SIZE) {
    return jsonError("Images must be 4 MB or smaller.", 413);
  }

  const extension = IMAGE_TYPES[file.type];
  if (!extension) {
    return jsonError("Use a JPG, PNG, WebP, or AVIF image.", 415);
  }

  const objectPath = `${scope}/${crypto.randomUUID()}.${extension}`;
  const headers = new Headers({
    apikey: storageKey,
    "content-type": file.type,
    "cache-control": "public, max-age=31536000, immutable",
    "x-upsert": "false",
  });
  // New sb_secret_ keys are accepted through apikey alone. Legacy service-role
  // JWT keys require the matching Authorization header as well.
  if (!storageKey.startsWith("sb_secret_")) {
    headers.set("authorization", `Bearer ${storageKey}`);
  }

  let upload: Response;
  try {
    upload = await fetch(
      `${supabaseUrl}/storage/v1/object/images/${objectPath}`,
      { method: "POST", headers, body: file, cache: "no-store" },
    );
  } catch {
    return jsonError("Could not reach Supabase Storage. Try again.", 502);
  }

  if (!upload.ok) {
    return jsonError(
      upload.status === 404
        ? 'The "images" bucket was not found. Create it in Supabase Storage.'
        : "Supabase Storage rejected the upload. Check the server storage key and bucket settings.",
      502,
    );
  }

  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  return Response.json({
    url: `${supabaseUrl}/storage/v1/object/public/images/${encodedPath}`,
    path: objectPath,
  });
}
