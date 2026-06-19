import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'הכנה לאמירנ"ט',
  description: 'פלטפורמת הכנה אדפטיבית למבחן אמירנ"ט — אלגוריתם IRT 3PL מדויק',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">{children}</body>
    </html>
  );
}
