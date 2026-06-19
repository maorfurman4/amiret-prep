'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { classifyScore } from '@/types/exam';

interface Stats {
  total_exams: number;
  best_score: number | null;
  avg_score: number | null;
  score_history: { date: string; score: number }[];
  performance_by_type: Record<string, { correct: number; total: number }>;
}

const TYPE_LABELS: Record<string, string> = {
  sentence_completion: 'השלמת משפטים',
  restatement: 'ניסוח מחדש',
  reading_comprehension: 'הבנת הנקרא',
  esra: 'אנגלית ESRA',
};

export default function StatsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setStats(data as Stats);
          setLoading(false);
        });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">טוען...</div>;
  }

  if (!stats || stats.total_exams === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-4" dir="rtl">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">אין עדיין נתונים</h1>
        <p className="text-slate-500 mb-6">סיים לפחות מבחן אחד כדי לראות סטטיסטיקות</p>
        <a href="/exam" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          התחל מבחן
        </a>
      </div>
    );
  }

  const classification = stats.best_score ? classifyScore(stats.best_score) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-slate-900">הסטטיסטיקה שלי</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'מבחנים', value: stats.total_exams },
            { label: 'ציון מקסימלי', value: stats.best_score ?? '—' },
            { label: 'ממוצע', value: stats.avg_score ? Math.round(stats.avg_score) : '—' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 text-center">
              <div className="text-2xl font-black text-slate-900">{card.value}</div>
              <div className="text-xs text-slate-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Best score classification */}
        {classification && stats.best_score && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm text-slate-500 mb-1">ציון מקסימלי</div>
            <div className="text-4xl font-black text-slate-900">{stats.best_score}</div>
            <div className={`text-lg font-bold mt-1 ${classification.color}`}>
              {classification.label} — {classification.description}
            </div>
          </div>
        )}

        {/* Score history */}
        {stats.score_history.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-900 mb-4">היסטוריית ציונים</h2>
            <div className="flex items-end gap-2 h-24">
              {stats.score_history.slice(-20).map((entry, i) => {
                const height = Math.max(8, ((entry.score - 50) / 100) * 100);
                const cls = classifyScore(entry.score);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t transition-all ${
                        cls.label === 'פטור מלא' ? 'bg-green-500' :
                        cls.label.includes('מתקדמים') ? 'bg-blue-500' :
                        cls.label === 'בסיסי' ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-slate-400 hidden sm:block">{entry.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance by type */}
        {Object.keys(stats.performance_by_type).length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <h2 className="font-bold text-slate-900 mb-4">ביצועים לפי סוג שאלה</h2>
            <div className="space-y-3">
              {Object.entries(stats.performance_by_type).map(([type, data]) => {
                const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{TYPE_LABELS[type] ?? type}</span>
                      <span className="text-slate-500">{data.correct}/{data.total} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
