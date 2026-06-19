'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { classifyScore, SECTION_CONFIGS, type SectionResult, type Question } from '@/types/exam';
import { thetaToScore } from '@/lib/adaptive';

interface SessionData {
  score: number;
  theta_final: number;
  theta_history: { after_section: number; theta: number }[];
  section_results: SectionResult[];
  answers_by_section: Record<number, (number | null)[]>;
  questions_by_section: Record<number, Question[]>;
  is_practice: boolean;
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [session, setSession] = useState<SessionData | null>(null);
  const [explanations, setExplanations] = useState<string>('');
  const [loadingExplanations, setLoadingExplanations] = useState(false);

  useEffect(() => {
    supabase
      .from('exam_sessions')
      .select('score, theta_final, theta_history, section_results, answers_by_section, questions_by_section, is_practice')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => {
        if (data) setSession(data as SessionData);
      });
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExplanations = async () => {
    setLoadingExplanations(true);
    const res = await fetch('/api/ai/explanations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const data = await res.json() as { explanation: string };
    setExplanations(data.explanation);
    setLoadingExplanations(false);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">טוען תוצאות...</div>
      </div>
    );
  }

  const score = session.score ?? thetaToScore(session.theta_final ?? 0);
  const classification = classifyScore(score);
  const totalCorrect = (session.section_results as SectionResult[]).reduce((a, s) => a + (s.correctCount ?? 0), 0);
  const totalQuestions = (session.section_results as SectionResult[]).reduce((a, s) => a + (s.totalCount ?? 0), 0);

  const TYPE_LABELS: Record<string, string> = {
    sentence_completion: 'השלמת משפטים',
    restatement: 'ניסוח מחדש',
    reading_comprehension: 'הבנת הנקרא',
    esra: 'אנגלית ESRA',
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Score card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
          <div className="text-6xl font-black text-slate-900 mb-2">{score}</div>
          <div className={`text-xl font-bold mb-1 ${classification.color}`}>{classification.label}</div>
          <div className="text-slate-500 text-sm mb-6">{classification.description}</div>
          <div className="text-slate-700 font-medium">
            {totalCorrect} / {totalQuestions} תשובות נכונות
          </div>
        </div>

        {/* Score scale */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-4">סקאלת ציונים</h2>
          {[
            { range: '134–150', label: 'פטור מלא', color: 'bg-green-500' },
            { range: '120–133', label: 'מתקדמים ב\'', color: 'bg-blue-500' },
            { range: '100–119', label: 'מתקדמים א\'', color: 'bg-yellow-500' },
            { range: '85–99',  label: 'בסיסי', color: 'bg-orange-500' },
            { range: '50–84',  label: 'טרום-בסיסי', color: 'bg-red-500' },
          ].map(row => (
            <div key={row.range} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${
              score >= parseInt(row.range.split('–')[0]) && score <= parseInt(row.range.split('–')[1] ?? '150')
                ? 'bg-slate-100 ring-2 ring-blue-400' : ''
            }`}>
              <div className={`w-3 h-3 rounded-full ${row.color}`} />
              <span className="font-mono text-sm text-slate-600">{row.range}</span>
              <span className="text-sm text-slate-800">{row.label}</span>
            </div>
          ))}
        </div>

        {/* Section breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="font-bold text-slate-900 mb-4">פירוט לפי פרק</h2>
          <div className="space-y-3">
            {(session.section_results as SectionResult[]).map((sr) => {
              const cfg = SECTION_CONFIGS[sr.sectionIndex - 1];
              const pct = Math.round((sr.correctCount / sr.totalCount) * 100);
              return (
                <div key={sr.sectionIndex} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {sr.sectionIndex}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700">{TYPE_LABELS[cfg?.type ?? sr.type]}</span>
                      <span className="text-slate-500">{sr.correctCount}/{sr.totalCount}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 w-10 text-left">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Explanations */}
        {!session.is_practice && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">הסברים על טעויות</h2>
              {!explanations && (
                <button
                  onClick={loadExplanations}
                  disabled={loadingExplanations}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {loadingExplanations ? 'מייצר...' : 'צור הסברים עם AI ✨'}
                </button>
              )}
            </div>
            {explanations ? (
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{explanations}</div>
            ) : (
              <div className="text-slate-400 text-sm">לחץ כדי לקבל הסברים מותאמים אישית</div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/exam')}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            מבחן חדש
          </button>
          <button
            onClick={() => router.push('/stats')}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            הסטטיסטיקה שלי
          </button>
        </div>
      </div>
    </div>
  );
}
