import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center px-4 py-16 text-white" dir="rtl">
      <div className="w-full max-w-lg text-center space-y-8">
        <div>
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-4xl font-black mb-3">הכנה לאמירנ&quot;ט</h1>
          <p className="text-slate-300 text-lg">
            פלטפורמת ההכנה המדוייקת ביותר שמכינה אותכם לציון הטוב ביותר
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/exam" className="block w-full py-4 bg-blue-500 hover:bg-blue-400 rounded-2xl text-xl font-bold transition-colors">
            התחל מבחן
          </Link>
          <Link href="/stats" className="block w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
            הסטטיסטיקה שלי
          </Link>
        </div>

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
      </div>
    </div>
  );
}
