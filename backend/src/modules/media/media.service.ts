import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

function cloudinaryEndpoint() {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(env.CLOUDINARY_CLOUD_NAME ?? "")}/image/upload`;
}

export const mediaService = {
  async uploadImage(file: Express.Multer.File) {
    const cloudName = env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = env.CLOUDINARY_API_SECRET?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      throw new AppError(
        503,
        "MEDIA_STORAGE_MISCONFIGURED",
        "Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to the backend environment.",
      );
    }

    if (!env.CLOUDINARY_ENABLED && env.NODE_ENV !== "production") {
      console.warn(
        "Cloudinary credentials are present while CLOUDINARY_ENABLED=false; uploads are being allowed using the configured credentials.",
      );
    }

    const body = new FormData();
    body.append(
      "file",
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname,
    );
    body.append("folder", env.CLOUDINARY_FOLDER.trim() || "delsu-compass");

    // Cloudinary's backend Upload API supports HTTP Basic Authentication.
    // Using it here avoids fragile manual signature generation while keeping
    // the API secret server-side only.
    const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

    let response: Response;
    try {
      response = await fetch(cloudinaryEndpoint(), {
        method: "POST",
        headers: {
          Authorization: `Basic ${authorization}`,
          Accept: "application/json",
        },
        body,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      console.error("Cloudinary upload request failed:", error instanceof Error ? error.message : error);
      throw new AppError(
        503,
        "MEDIA_UPLOAD_UNAVAILABLE",
        "The image service could not be reached. Check the server internet connection and try again.",
      );
    }

    const payload = (await response.json().catch(() => ({}))) as {
      secure_url?: string;
      public_id?: string;
      width?: number;
      height?: number;
      error?: { message?: string };
    };

    if (!response.ok || !payload.secure_url || !payload.public_id) {
      const providerMessage = payload.error?.message;
      console.error(
        `Cloudinary upload rejected (${response.status})${providerMessage ? `: ${providerMessage}` : ""}`,
      );
      throw new AppError(
        response.status === 401 || response.status === 403 ? 502 : response.status >= 500 ? 503 : 502,
        "MEDIA_UPLOAD_FAILED",
        providerMessage ?? "Cloudinary rejected the image upload. Re-check the cloud name, API key and API secret.",
      );
    }

    return {
      url: payload.secure_url,
      publicId: payload.public_id,
      width: payload.width,
      height: payload.height,
    };
  },
};
