import Link from 'next/link';

interface BackNavProps {
  backHref?: string;
  backLabel?: string;
}

export function BackNav({ backHref = '/', backLabel = 'דף הבית' }: BackNavProps) {
  return (
    <nav className="flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-100" dir="rtl">
      <Link href={backHref} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm transition-colors">
        <span>→</span>
        <span>{backLabel}</span>
      </Link>
      <span className="text-slate-200">|</span>
      <Link href="/" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">דף הבית</Link>
      <Link href="/exam" className="text-sm text-slate-400 hover:text-slate-900 transition-colors">מבחן</Link>
    </nav>
  );
}
