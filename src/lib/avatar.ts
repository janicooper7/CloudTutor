import { createAvatar } from "@dicebear/core";
import { personas } from "@dicebear/collection";

// Generates a friendly illustrated avatar as a local SVG data URI.
// "personas" is a CC0 (public-domain) style — no copyright, and because the
// people are illustrated (not real), there's no false-endorsement concern.
// Deterministic per seed, so server and client render identically.
export function avatarUri(seed: string): string {
  const svg = createAvatar(personas, {
    seed,
    size: 72,
    radius: 50,
    backgroundColor: ["e6f1ff", "d5e7fb", "bcd8fb"],
  }).toString();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
