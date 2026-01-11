import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Document Editor',
  description: 'Print-accurate legal document editor with pagination',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
