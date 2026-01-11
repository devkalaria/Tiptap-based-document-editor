import React from 'react';

type Props = {
  pageMetrics: { widthPx: number; heightPx: number; contentWidthPx: number; contentHeightPx: number };
  pageCount: number;
};

export default function PageBackdrop({ pageMetrics, pageCount }: Props) {
  const pages = Array.from({ length: pageCount }, (_, i) => i);
  return (
    <div
      className="relative"
      style={{ width: `${pageMetrics.widthPx}px` }}
    >
      {pages.map((i) => (
        <div
          key={i}
          className="page mx-auto mb-6 last:mb-0 print:shadow-none relative"
          style={{
            width: `${pageMetrics.widthPx}px`,
            height: `${pageMetrics.heightPx}px`,
          }}
        >
          {/* Page number at bottom center */}
          <div
            className="absolute left-0 right-0 bottom-5 text-center text-xs text-gray-400 select-none pointer-events-none print:hidden"
            style={{pointerEvents: 'none'}}
            aria-label={`Page ${i+1}`}
          >
            Page {i+1}
          </div>
        </div>
      ))}
    </div>
  );
}
