'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionCard } from '@/components/exam/QuestionCard';
import type { Question } from '@/types/exam';
import { BackNav } from '@/components/BackNav';

type Step = 'loading' | 'empty' | 'reviewing' | 'done';

export default function ReviewQueuePage() {
  const router = useRouter();

  const [guestId, setGuestId] = useState<string>('');
  const [step, setStep] = useState<Step>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    let id = localStorage.getItem('amiret_guest_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('amiret_guest_id', id);
    }
    setGuestId(id);
  }, []);

  useEffect(() => {
    if (!guestId) return;
    fetchDueQuestions(guestId);
  }, [guestId]);

  const fetchDueQuestions = async (id: string) => {
    setStep('loading');
    try {
      const res = await fetch(`/api/review-queue?guestId=${encodeURIComponent(id)}`);
      const data = await res.json() as { questions: Question[]; count: number };
      if (!data.questions || data.questions.length === 0) {
        setStep('empty');
      } else {
        setQuestions(data.questions);
        setAnswers(Array(data.questions.length).fill(null));
        setCurrentIndex(0);
        setShowResult(false);
        setCorrectCount(0);
        setStep('reviewing');
      }
    } catch {
      setStep('empty');
    }
  };

  const handleSelect = (optionIndex: number) => {
    if (showResult) return;
    const next = [...answers];
    next[currentIndex] = optionIndex;
    setAnswers(next);
    setShowResult(true);

    const wasCorrect = optionIndex === questions[currentIndex].correct_answer;
    if (wasCorrect) setCorrectCount(c => c + 1);

    // Update review queue (fire-and-forget)
    fetch('/api/review-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestId,
        questionId: questions[currentIndex].id,
        wasCorrect,
      }),
    }).catch(() => {});
  };

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowResult(false);
    } else {
      setStep('done');
    }
  }, [currentIndex, questions.length]);

  useEffect(() => {
    if (step !== 'reviewing') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (showResult) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); handleNext(); }
      } else {
        const idx = parseInt(e.key) - 1;
        if (idx >= 0 && idx < (questions[currentIndex]?.options.length ?? 0)) {
          handleSelect(idx);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, showResult, currentIndex, questions, handleNext]);

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <div className="text-slate-400 text-lg">טוען שאלות לחזרה...</div>
      </div>
    );
  }

  if (step === 'empty') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
        <BackNav backHref="/exam" backLabel="מבחן" />
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h1 className="text-2xl font-bold text-slate-900">כל הכבוד!</h1>
            <p className="text-slate-500">אין שאלות לחזרה כרגע. בוא שוב מחר 🎉</p>
            <button
              onClick={() => router.push('/exam')}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              חזרה לתפריט
            </button>
          </div>
        </div>
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
            <div className="text-slate-500 mt-1 text-lg">{pct}% נכון בחזרה</div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
            {pct >= 80 && 'מצוין! אתה שולט בשאלות האלה.'}
            {pct >= 60 && pct < 80 && 'טוב! עוד קצת תרגול ותגיע לשלמות.'}
            {pct < 60 && 'הלמידה לוקחת זמן — ממשיכים לחזור!'}
          </div>
          <div className="space-y-3">
            <button
              onClick={() => fetchDueQuestions(guestId)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              חזרה נוספת
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

  // Reviewing
  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">חזרה על טעויות</span>
              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">חזרה</span>
            </div>
            <div className="text-xs text-slate-500">
              יש לך {questions.length} שאלות לחזרה היום
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{currentIndex + 1}/{questions.length}</span>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentIndex
                      ? answers[i] === questions[i].correct_answer ? 'bg-green-500' : 'bg-red-400'
                      : i === currentIndex ? 'bg-orange-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
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
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              {isLast ? 'סיום חזרה ✓' : 'שאלה הבאה ‹'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
