export const ORIENTATION_LABELS: Record<number, string> = {
  1: 'Normal', 2: 'Mirrored horizontally', 3: 'Rotated 180°', 4: 'Mirrored vertically',
  5: 'Mirrored horizontally, then rotated 90° counter-clockwise', 6: 'Rotated 90° clockwise',
  7: 'Mirrored horizontally, then rotated 90° clockwise', 8: 'Rotated 90° counter-clockwise',
};

export function orientationNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 8) return value;
  const text = String(value ?? '').toLowerCase();
  const match = text.match(/\b([1-8])\b/);
  if (match) return Number(match[1]);
  const names: Record<string, number> = { 'top-left': 1, 'top-right': 2, 'bottom-right': 3, 'bottom-left': 4, 'left-top': 5, 'right-top': 6, 'right-bottom': 7, 'left-bottom': 8 };
  for (const [name, number] of Object.entries(names)) if (text.includes(name)) return number;
  if (/90.*clockwise|rotate 90 cw/.test(text)) return 6;
  if (/90.*counter|rotate 270/.test(text)) return 8;
  if (/180/.test(text)) return 3;
  return undefined;
}

export function displayDimensions(width: number, height: number, orientation?: number): { width: number; height: number } {
  return orientation && orientation >= 5 ? { width: height, height: width } : { width, height };
}
