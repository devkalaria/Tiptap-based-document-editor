"use client";

import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <header className="mb-4 text-center">
          <h1 className="text-xl font-semibold">Legal Document Editor</h1>
          <p className="text-sm text-gray-500">US Letter, 1&quot; margins, real-time pagination</p>
        </header>
        <Editor />
      </div>
    </main>
  );
}
