import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4 py-12 text-white" dir="rtl">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-4xl font-black mb-2">הכנה לאמירנ&quot;ט</h1>
          <p className="text-slate-300">פלטפורמת ההכנה המדוייקת ביותר לציון הטוב ביותר</p>
        </div>

        {/* Primary action */}
        <Link href="/exam" className="block w-full py-4 bg-blue-500 hover:bg-blue-400 rounded-2xl text-xl font-bold text-center transition-colors">
          🎯 התחל מבחן
        </Link>

        {/* Navigation grid */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/practice" className="flex flex-col items-center gap-2 py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-center transition-colors">
            <span className="text-3xl">✏️</span>
            <span className="font-semibold text-sm">תרגול ממוקד</span>
            <span className="text-slate-400 text-xs">לפי סוג שאלה</span>
          </Link>
          <Link href="/vocabulary" className="flex flex-col items-center gap-2 py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-center transition-colors">
            <span className="text-3xl">📖</span>
            <span className="font-semibold text-sm">אוצר מילים</span>
            <span className="text-slate-400 text-xs">מעל 1,000 מילים</span>
          </Link>
          <Link href="/review-queue" className="flex flex-col items-center gap-2 py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-center transition-colors">
            <span className="text-3xl">🔄</span>
            <span className="font-semibold text-sm">חזרה חכמה</span>
            <span className="text-slate-400 text-xs">שאלות שטעית בהן</span>
          </Link>
          <Link href="/stats" className="flex flex-col items-center gap-2 py-5 bg-white/10 hover:bg-white/20 rounded-2xl text-center transition-colors">
            <span className="text-3xl">📊</span>
            <span className="font-semibold text-sm">הסטטיסטיקה שלי</span>
            <span className="text-slate-400 text-xs">היסטוריה וגרפים</span>
          </Link>
        </div>

        {/* Score scale */}
        <div className="bg-white/5 rounded-2xl p-5 text-right">
          <div className="text-sm font-semibold text-slate-300 mb-3">סקאלת הציונים (50–150):</div>
          <div className="space-y-1.5 text-sm">
            {[
              { range: '134+', label: 'פטור מלא מאנגלית', color: 'text-green-400' },
              { range: '120–133', label: "מתקדמים ב'", color: 'text-blue-400' },
              { range: '100–119', label: "מתקדמים א'", color: 'text-yellow-400' },
              { range: '85–99', label: 'קורס בסיסי', color: 'text-orange-400' },
              { range: '50–84', label: 'טרום-בסיסי', color: 'text-red-400' },
            ].map(row => (
              <div key={row.range} className="flex items-center gap-2">
                <span className={`font-mono font-bold w-20 ${row.color}`}>{row.range}</span>
                <span className="text-slate-300">{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/tips" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
            💡 טיפים אסטרטגיים לבחינה ←
          </Link>
        </div>
      </div>
    </div>
  );
}
