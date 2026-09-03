import { pickFallbackPhoto } from "../domain/photos.js";

/** GET /api/place-image?query= — deterministic stand-in imagery for a place. */
export function placeImage(req, res) {
  const query = String(req.query.query || "").trim();
  res.json({ imageUrl: pickFallbackPhoto(query) });
}
