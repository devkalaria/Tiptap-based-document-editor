import React from 'react';

export function OverflowWarning({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 rounded text-white px-3 py-2 text-xs font-semibold shadow-md animate-pulse-pointer-events-none pointer-events-none">
      Content extends outside safe page area for printing. Please shorten or edit to fit within page bounds.
    </div>
  );
}
