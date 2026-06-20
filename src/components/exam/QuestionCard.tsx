'use client';

import type { Question } from '@/types/exam';

interface ExplanationData {
  correct_reason: string;
  options_analysis: string[];
  strategy: string;
}

function parseExplanation(raw: string | undefined): ExplanationData | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ExplanationData;
    if (parsed.correct_reason && Array.isArray(parsed.options_analysis)) return parsed;
  } catch {
    // plain text — wrap it
    return { correct_reason: raw, options_analysis: [], strategy: '' };
  }
  return null;
}

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalInSection: number;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  isPractice?: boolean;
  showResult?: boolean;
}

const OPTION_LABELS = ['1', '2', '3', '4'];

export function QuestionCard({
  question,
  questionNumber,
  totalInSection,
  selectedAnswer,
  onSelect,
  isPractice = false,
  showResult = false,
}: QuestionCardProps) {
  const explanation = isPractice && showResult ? parseExplanation(question.explanation) : null;

  return (
    <div className="w-full max-w-2xl mx-auto" dir="ltr">
      {/* Question header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500 font-medium">
          שאלה {questionNumber} מתוך {totalInSection}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalInSection }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < questionNumber - 1 ? 'bg-blue-500' :
                i === questionNumber - 1 ? 'bg-blue-700' :
                'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Passage for reading comprehension */}
      {question.passage && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm leading-relaxed text-slate-700 font-medium">
          <div className="text-xs text-slate-400 mb-2 font-normal">Reading Passage</div>
          {question.passage.text}
        </div>
      )}

      {/* Question text */}
      <div className="mb-6 text-lg font-semibold text-slate-900 leading-relaxed">
        {question.text}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = question.correct_answer === i;
          const isWrong = showResult && isSelected && !isCorrect;
          const showCorrect = showResult && isCorrect;

          return (
            <button
              key={option.id ?? i}
              onClick={() => onSelect(i)}
              disabled={showResult}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                showCorrect  ? 'border-green-500 bg-green-50 text-green-800' :
                isWrong      ? 'border-red-500 bg-red-50 text-red-800' :
                isSelected   ? 'border-blue-500 bg-blue-50 text-blue-900 font-medium' :
                               'border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:bg-blue-50/40'
              }`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                showCorrect  ? 'border-green-500 bg-green-500 text-white' :
                isWrong      ? 'border-red-500 bg-red-500 text-white' :
                isSelected   ? 'border-blue-500 bg-blue-500 text-white' :
                               'border-slate-300 text-slate-500'
              }`}>
                {OPTION_LABELS[i]}
              </span>
              <span className="flex-1">{option.text}</span>
              {showResult && isCorrect && <span className="text-green-600 font-bold">✓</span>}
              {isWrong && <span className="text-red-500 font-bold">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Practice explanation — shown immediately from DB data, no API call */}
      {isPractice && showResult && explanation && (
        <div className="mt-6 space-y-3" dir="rtl">
          {/* Why correct */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✅</span>
              <span className="font-bold text-green-800 text-sm">מדוע התשובה הנכונה נכונה</span>
            </div>
            <p className="text-green-900 text-sm leading-relaxed">{explanation.correct_reason}</p>
          </div>

          {/* Per-option analysis */}
          {explanation.options_analysis.length > 0 && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <div className="font-bold text-slate-700 text-sm mb-3">ניתוח כל האפשרויות:</div>
              <div className="space-y-2">
                {question.options.map((opt, i) => {
                  const correct = i === question.correct_answer;
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 text-sm p-2.5 rounded-lg ${correct ? 'bg-green-50' : 'bg-red-50/60'}`}
                    >
                      <span className={`font-bold flex-shrink-0 w-4 mt-0.5 ${correct ? 'text-green-600' : 'text-red-400'}`}>
                        {correct ? '✓' : '✗'}
                      </span>
                      <div dir="ltr" className="flex-1">
                        <span className="font-medium text-slate-800">{opt.text}</span>
                        {explanation.options_analysis[i] && (
                          <p className={`mt-1 text-xs leading-relaxed ${correct ? 'text-green-700' : 'text-red-600'}`} dir="rtl">
                            {explanation.options_analysis[i]}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strategy tip */}
          {explanation.strategy && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="font-bold text-blue-800 text-sm">טיפ אסטרטגי</span>
              </div>
              <p className="text-blue-900 text-sm leading-relaxed">{explanation.strategy}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
