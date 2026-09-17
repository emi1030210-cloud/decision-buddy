// Next's metadata-route loader reads these exports statically, so each route file
// declares its own rather than re-exporting them from the shared module.
import { ogAlt, ogContentType, ogSize, renderOgImage } from "@/lib/og-image";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage();
}
