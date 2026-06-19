'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ExamMode } from '@/types/exam';

const MODES: { mode: ExamMode; title: string; desc: string; icon: string; isPractice?: boolean }[] = [
  {
    mode: 'full',
    title: 'מבחן מלא',
    desc: '6 פרקים, טיימר קשיח, אלגוריתם אדפטיבי — בדיוק כמו האמירנ"ט האמיתי',
    icon: '🎯',
  },
  {
    mode: 'practice',
    title: 'מוד תרגול',
    desc: 'ללא טיימר, ניתן לראות הסברים מיד — לתרגול נינוח במובייל',
    icon: '📚',
    isPractice: true,
  },
  {
    mode: 'section',
    title: 'תרגול סעיף',
    desc: 'בחר סוג שאלות ספציפי לתרגול ממוקד',
    icon: '🔍',
  },
  {
    mode: 'esra',
    title: 'ESRA — אנגלית',
    desc: 'תרגול ממוקד לחלק האנגלית בנפרד',
    icon: '🇬🇧',
  },
];

export default function ExamModePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startExam = async (mode: ExamMode, isPractice = false) => {
    setLoading(true);
    setError(null);

    if (mode === 'esra') {
      router.push('/esra');
      return;
    }
    if (mode === 'section') {
      router.push('/practice');
      return;
    }

    try {
      const res = await fetch('/api/exam/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, isPractice }),
      });

      if (!res.ok) {
        setError('שגיאה ביצירת מבחן. נסה שוב.');
        return;
      }

      const { sessionId } = await res.json() as { sessionId: string };
      router.push(`/exam/${sessionId}`);
    } catch {
      setError('שגיאת רשת. בדוק חיבור אינטרנט.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12" dir="rtl">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">בחר מצב</h1>
          <p className="text-slate-500">בחר איך תרצה להתאמן היום</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODES.map(m => (
            <button
              key={m.mode}
              onClick={() => startExam(m.mode, m.isPractice)}
              disabled={loading}
              className="group text-right p-6 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all disabled:opacity-60"
            >
              <div className="text-3xl mb-3">{m.icon}</div>
              <div className="text-lg font-bold text-slate-900 mb-1">{m.title}</div>
              <div className="text-sm text-slate-500 leading-relaxed">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
