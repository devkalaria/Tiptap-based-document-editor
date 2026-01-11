export type PageMetrics = {
  widthPx: number;
  heightPx: number;
  contentWidthPx: number;
  contentHeightPx: number;
  marginPx: number;
};

// US Letter 8.5in x 11in with 1in margins
export function computePageMetrics(dpi: number): PageMetrics {
  const widthPx = 8.5 * dpi;
  const heightPx = 11 * dpi;
  const marginPx = 1 * dpi;
  const contentWidthPx = widthPx - marginPx * 2;
  const contentHeightPx = heightPx - marginPx * 2;
  return { widthPx, heightPx, contentWidthPx, contentHeightPx, marginPx };
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
