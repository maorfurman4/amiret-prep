import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { generateMistakeExplanations } from '@/lib/ai';
import type { QuestionType } from '@/types/exam';

/**
 * POST /api/ai/explanations
 * Called ONLY from /results page — generates personalized mistake explanations.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    sessionId: string;
  };

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('section_results, questions_by_section, answers_by_section')
    .eq('id', body.sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Collect all mistakes across sections
  const mistakes: Array<{
    questionText: string;
    type: QuestionType;
    userAnswer: string;
    correctAnswer: string;
    options: string[];
  }> = [];

  const answersBySection = session.answers_by_section as Record<string, (number | null)[]>;
  const questionsBySection = session.questions_by_section as Record<string, Array<{
    text: string;
    type: QuestionType;
    options: { id: string; text: string }[];
    correct_answer: number;
  }>>;

  for (const [sectionIdx, answers] of Object.entries(answersBySection)) {
    const questions = questionsBySection[sectionIdx] ?? [];
    answers.forEach((ans, i) => {
      const q = questions[i];
      if (!q) return;
      const correct = q.correct_answer;
      if (ans !== correct) {
        mistakes.push({
          questionText: q.text,
          type: q.type,
          userAnswer: ans !== null ? (q.options[ans]?.text ?? 'לא נענה') : 'לא נענה',
          correctAnswer: q.options[correct]?.text ?? '',
          options: q.options.map(o => o.text),
        });
      }
    });
  }

  if (mistakes.length === 0) {
    return NextResponse.json({ explanation: 'כל הכבוד! לא טעית בשום שאלה.' });
  }

  const explanation = await generateMistakeExplanations(mistakes.slice(0, 10));
  return NextResponse.json({ explanation });
}
