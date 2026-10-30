export const IMAGE_SIZES = [600, 1400] as const;

export function imageUrl(key: string | null | undefined, size: (typeof IMAGE_SIZES)[number] = 600) {
  return key ? `/uploads/${key}-${size}.webp` : null;
}

export function imageSrcSet(key: string) {
  return IMAGE_SIZES.map((w) => `/uploads/${key}-${w}.webp ${w}w`).join(", ");
}
