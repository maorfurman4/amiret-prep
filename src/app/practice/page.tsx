'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionCard } from '@/components/exam/QuestionCard';
import type { Question, QuestionType } from '@/types/exam';
import { BackNav } from '@/components/BackNav';

type Step = 'pick-type' | 'pick-difficulty' | 'pick-count' | 'practicing' | 'done';
type Difficulty = 1 | 2 | 3 | 4 | 5 | 'random';

const TYPE_OPTIONS: { type: QuestionType; label: string; desc: string; icon: string }[] = [
  { type: 'sentence_completion', label: 'השלמת משפטים', desc: 'בחר את המילה החסרה במשפט', icon: '✏️' },
  { type: 'restatement',        label: 'ניסוח מחדש',   desc: 'זהה את המשמעות הזהה במשפט', icon: '🔄' },
  { type: 'reading_comprehension', label: 'הבנת הנקרא', desc: 'קרא קטע וענה על שאלות הבנה', icon: '📖' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; sublabel: string }[] = [
  { value: 1, label: '1', sublabel: 'קל מאוד' },
  { value: 2, label: '2', sublabel: 'קל' },
  { value: 3, label: '3', sublabel: 'בינוני' },
  { value: 4, label: '4', sublabel: 'קשה' },
  { value: 5, label: '5', sublabel: 'קשה מאוד' },
  { value: 'random', label: '🎲', sublabel: 'מעורב' },
];

export default function PracticePage() {
  const router = useRouter();

  const [step, setStep]               = useState<Step>('pick-type');
  const [selectedType, setType]       = useState<QuestionType | null>(null);
  const [selectedDiff, setDiff]       = useState<Difficulty | null>(null);
  const [selectedCount, setCount]     = useState<5 | 10>(5);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [questions, setQuestions]     = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers]         = useState<(number | null)[]>([]);
  const [showResult, setShowResult]   = useState(false);

  const fetchQuestions = async (overrideDiff?: Difficulty) => {
    setLoading(true);
    setError(null);
    const diff = overrideDiff ?? selectedDiff;
    try {
      const params = new URLSearchParams({
        type: selectedType!,
        difficulty: String(diff),
        count: String(selectedCount),
      });
      const res = await fetch(`/api/practice/questions?${params}`);
      if (!res.ok) {
        setError('לא נמצאו שאלות. נסה רמת קושי אחרת.');
        setLoading(false);
        return;
      }
      const data = await res.json() as { questions: Question[] };
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(null));
      setCurrentIndex(0);
      setShowResult(false);
      setStep('practicing');
    } catch {
      setError('שגיאת רשת. בדוק חיבור אינטרנט.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionIndex: number) => {
    if (showResult) return;
    const next = [...answers];
    next[currentIndex] = optionIndex;
    setAnswers(next);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowResult(false);
    } else {
      setStep('done');
    }
  };

  const handleRestart = () => {
    setStep('pick-type');
    setType(null);
    setDiff(null);
    setCount(5);
    setQuestions([]);
    setAnswers([]);
    setError(null);
  };

  const correctCount = answers.filter((a, i) => a === questions[i]?.correct_answer).length;

  // ── Screens ────────────────────────────────────────────────────────────────

  if (step === 'pick-type') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
        <BackNav backHref="/exam" backLabel="מבחן" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">תרגול סעיף</h1>
          <p className="text-slate-500 mb-8 text-sm">בחר את סוג השאלות שתרצה לתרגל</p>
          <div className="space-y-3">
            {TYPE_OPTIONS.map(opt => (
              <button
                key={opt.type}
                onClick={() => { setType(opt.type); setStep('pick-difficulty'); }}
                className="w-full text-right p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-4"
              >
                <span className="text-3xl">{opt.icon}</span>
                <div>
                  <div className="font-bold text-slate-900 text-lg">{opt.label}</div>
                  <div className="text-slate-500 text-sm">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (step === 'pick-difficulty') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12" dir="rtl">
        <div className="w-full max-w-lg">
          <button onClick={() => setStep('pick-type')} className="text-slate-400 text-sm mb-6 hover:text-slate-600">
            ← חזרה
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">רמת קושי</h1>
          <p className="text-slate-500 mb-8 text-sm">בחר את רמת הקושי של השאלות</p>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTY_OPTIONS.map(opt => (
              <button
                key={String(opt.value)}
                onClick={() => {
                  setDiff(opt.value);
                  if (selectedType === 'reading_comprehension') {
                    // Skip count step — reading_comprehension always returns 5 questions
                    fetchQuestions(opt.value);
                  } else {
                    setStep('pick-count');
                  }
                }}
                className="p-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-center"
              >
                <div className="text-2xl font-black text-slate-900">{opt.label}</div>
                <div className="text-xs text-slate-500 mt-1">{opt.sublabel}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'pick-count') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12" dir="rtl">
        <div className="w-full max-w-lg">
          <button onClick={() => setStep('pick-difficulty')} className="text-slate-400 text-sm mb-6 hover:text-slate-600">
            ← חזרה
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">כמות שאלות</h1>
          <p className="text-slate-500 mb-8 text-sm">כמה שאלות תרצה לתרגל?</p>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {([5, 10] as const).map(n => (
              <button
                key={n}
                onClick={() => { setCount(n); }}
                className={`p-6 rounded-2xl border-2 transition-all text-center ${
                  selectedCount === n
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                }`}
              >
                <div className="text-4xl font-black">{n}</div>
                <div className="text-sm mt-1">שאלות</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchQuestions()}
            disabled={loading}
            className="mt-8 w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'טוען...' : 'התחל תרגול'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'practicing' && questions.length > 0) {
    const question = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;

    return (
      <div className="min-h-screen bg-slate-50" dir="rtl">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">
                {TYPE_OPTIONS.find(t => t.type === selectedType)?.label}
              </div>
              <div className="text-xs text-slate-500">
                שאלה {currentIndex + 1} מתוך {questions.length}
              </div>
            </div>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentIndex
                      ? answers[i] === questions[i].correct_answer ? 'bg-green-500' : 'bg-red-400'
                      : i === currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <QuestionCard
            question={question}
            questionNumber={currentIndex + 1}
            totalInSection={questions.length}
            selectedAnswer={answers[currentIndex] ?? null}
            onSelect={handleSelect}
            isPractice={true}
            showResult={showResult}
          />

          {showResult && (
            <div className="mt-6 flex justify-start">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                {isLast ? 'ראה תוצאות ✓' : 'שאלה הבאה ‹'}
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  if (step === 'done') {
    const pct = Math.round((correctCount / questions.length) * 100);
    const color = pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="text-6xl">{pct >= 80 ? '🎉' : pct >= 60 ? '💪' : '📚'}</div>
          <div>
            <div className={`text-5xl font-black ${color}`}>{correctCount}/{questions.length}</div>
            <div className="text-slate-500 mt-1 text-lg">{pct}% נכון</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
            {pct >= 80 && 'מצוין! אתה שולט בחומר הזה.'}
            {pct >= 60 && pct < 80 && 'טוב! עוד קצת תרגול ותגיע לשלמות.'}
            {pct < 60 && 'כדאי לחזור על החומר הזה ולתרגל שוב.'}
          </div>
          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              תרגול נוסף
            </button>
            <button
              onClick={() => router.push('/exam')}
              className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              חזרה לתפריט
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading / error fallback
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
      {loading
        ? <div className="text-slate-400">טוען שאלות...</div>
        : <div className="text-center">
            <div className="text-red-500 mb-3">{error ?? 'שגיאה לא צפויה'}</div>
            <button onClick={handleRestart} className="text-blue-600 underline text-sm">נסה שוב</button>
          </div>
      }
    </div>
  );
}
