import React from 'react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-sm shadow-sm hover:bg-gray-100 active:bg-gray-200 transition-colors"
    >
      Print / Export PDF
    </button>
  );
}
