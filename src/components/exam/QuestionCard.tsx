'use client';

import type { Question } from '@/types/exam';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalInSection: number;
  selectedAnswer: number | null;
  onSelect: (index: number) => void;
  isPractice?: boolean;
  showResult?: boolean; // practice mode only
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
              key={option.id}
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
              {showResult && isCorrect && <span className="text-green-600">✓</span>}
              {isWrong && <span className="text-red-500">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Practice mode: show explanation */}
      {isPractice && showResult && question.explanation && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
          <div className="font-semibold mb-1">הסבר:</div>
          {question.explanation}
        </div>
      )}
    </div>
  );
}
