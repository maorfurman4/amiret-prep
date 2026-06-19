'use client';

import { SECTION_CONFIGS } from '@/types/exam';

interface SectionProgressProps {
  currentSection: number;
  completedSections: number[];
}

const TYPE_LABELS: Record<string, string> = {
  sentence_completion: 'השלמת משפטים',
  restatement: 'ניסוח מחדש',
  reading_comprehension: 'הבנת הנקרא',
  esra: 'אנגלית ESRA',
};

export function SectionProgress({ currentSection, completedSections }: SectionProgressProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1" dir="rtl">
      {SECTION_CONFIGS.map((cfg) => {
        const isDone = completedSections.includes(cfg.index);
        const isCurrent = currentSection === cfg.index;
        const isPending = !isDone && !isCurrent;

        return (
          <div key={cfg.index} className="flex items-center gap-1 flex-shrink-0">
            <div className={`flex flex-col items-center ${isCurrent ? 'scale-105' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                isDone    ? 'bg-green-500 border-green-500 text-white' :
                isCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' :
                            'bg-white border-slate-300 text-slate-400'
              }`}>
                {isDone ? '✓' : cfg.index}
              </div>
              <span className={`mt-1 text-[10px] whitespace-nowrap ${
                isCurrent ? 'text-blue-600 font-semibold' :
                isDone    ? 'text-green-600' : 'text-slate-400'
              }`}>
                {TYPE_LABELS[cfg.type]}
              </span>
            </div>
            {cfg.index < SECTION_CONFIGS.length && (
              <div className={`w-6 h-0.5 mb-4 transition-all ${isDone ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
