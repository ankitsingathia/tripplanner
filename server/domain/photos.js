/**
 * Deterministic stand-in imagery.
 *
 * There is no image provider wired up; the same destination always resolves to
 * the same photo so a trip's hero image doesn't change between renders. Swap
 * this module for a real provider (Unsplash API, Wikimedia, etc.) and nothing
 * upstream has to change — the contract is just `seed -> url`.
 */
const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
];

export function pickFallbackPhoto(seed = "") {
  const score = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FALLBACK_PHOTOS[score % FALLBACK_PHOTOS.length];
}
