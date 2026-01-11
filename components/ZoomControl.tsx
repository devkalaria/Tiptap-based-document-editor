import React from 'react';

interface ZoomControlProps {
  scale: number;
  setScale: (n: number) => void;
}

export function ZoomControl({ scale, setScale }: ZoomControlProps) {
  return (
    <div className="flex items-center gap-2 bg-white/85 border border-gray-200 rounded px-2 py-1 text-xs shadow-sm select-none z-30" style={{position: 'sticky', top: 8, left: 0}}>
      <span>Zoom:</span>
      <button
        className="px-1 py-0.5 rounded disabled:text-gray-300"
        onClick={() => setScale(Math.max(0.8, Math.round((scale - 0.1) * 10) / 10))}
        disabled={scale <= 0.8}
        aria-label="Decrease zoom"
      >-
      </button>
      <span className="w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
      <button
        className="px-1 py-0.5 rounded disabled:text-gray-300"
        onClick={() => setScale(Math.min(1.2, Math.round((scale + 0.1) * 10) / 10))}
        disabled={scale >= 1.2}
        aria-label="Increase zoom"
      >+
      </button>
    </div>
  );
}
