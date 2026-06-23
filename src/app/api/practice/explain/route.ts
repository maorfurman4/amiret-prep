import { NextRequest, NextResponse } from 'next/server';
import { getServerClients } from '@/lib/supabase-server';
import OpenAI from 'openai';
import type { QuestionType } from '@/types/exam';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? 'placeholder' });

export interface ExplanationData {
  correct_reason: string;
  options_analysis: string[];
  strategy: string;
}

export async function POST(req: NextRequest) {
  let body: { questionId?: unknown };
  try {
    body = await req.json() as { questionId?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { questionId } = body;
  if (typeof questionId !== 'string' || !/^[0-9a-f-]{36}$/i.test(questionId)) {
    return NextResponse.json({ error: 'Invalid questionId' }, { status: 400 });
  }

  const { supabase } = await getServerClients();

  // Fetch the question from DB — use only DB-sourced data, never client-supplied text
  const { data: dbQuestion } = await supabase
    .from('questions')
    .select('text, options, correct_answer, type, explanation, passage_id')
    .eq('id', questionId)
    .single();

  if (!dbQuestion) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // Return cached rich explanation if available
  if (dbQuestion.explanation) {
    try {
      const parsed = JSON.parse(dbQuestion.explanation) as ExplanationData;
      if (parsed.correct_reason && parsed.options_analysis) {
        return NextResponse.json(parsed);
      }
    } catch {
      // Not JSON — will regenerate
    }
  }

  // Use only DB-sourced values for the prompt
  const questionText = dbQuestion.text as string;
  const options = dbQuestion.options as { text: string }[];
  const correctAnswer = dbQuestion.correct_answer as number;
  const questionType = dbQuestion.type as QuestionType;

  // Fetch passage text from DB if needed
  let passageText: string | undefined;
  if (dbQuestion.passage_id) {
    const { data: passage } = await supabase
      .from('passages')
      .select('text')
      .eq('id', dbQuestion.passage_id)
      .single();
    passageText = passage?.text as string | undefined;
  }

  const typeLabel: Record<string, string> = {
    sentence_completion: 'השלמת משפטים',
    restatement: 'ניסוח מחדש',
    reading_comprehension: 'הבנת הנקרא',
  };

  const optionsList = options
    .map((o, i) => `${i + 1}. ${o.text}${i === correctAnswer ? ' ← נכון' : ''}`)
    .join('\n');

  const passageBlock = passageText
    ? `\n\nקטע הקריאה (באנגלית):\n"""\n${passageText}\n"""\n`
    : '';

  const prompt = `אתה מורה מנוסה למבחן האמירנ"ט — מבחן מיקום באנגלית של המל"ג הישראלי.
סוג שאלה: ${typeLabel[questionType] ?? questionType}
${passageBlock}
שאלה (באנגלית): ${questionText}

אפשרויות:
${optionsList}

התשובה הנכונה: מספר ${correctAnswer + 1}.

כתוב הסבר מפורט בעברית עבור תלמיד מתכונן. כלול:
1. מדוע התשובה הנכונה נכונה — הסבר את המשמעות, הדקדוק, ההיגיון
2. לכל אחת מהאפשרויות (כולל הנכונה) — ניתוח קצר ומדויק
3. טיפ אסטרטגי: איך מזהים ופותרים שאלות מסוג זה במבחן

החזר JSON בדיוק בפורמט הזה (ללא markdown):
{
  "correct_reason": "הסבר מפורט מדוע התשובה הנכונה נכונה (2-3 משפטים)",
  "options_analysis": [
    "ניתוח אפשרות 1 — נכונה/שגויה כי...",
    "ניתוח אפשרות 2 — נכונה/שגויה כי...",
    "ניתוח אפשרות 3 — נכונה/שגויה כי...",
    "ניתוח אפשרות 4 — נכונה/שגויה כי..."
  ],
  "strategy": "טיפ אסטרטגי לפתרון שאלות מסוג זה (1-2 משפטים)"
}`;

  let explanationData: ExplanationData;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    explanationData = JSON.parse(response.choices[0].message.content ?? '{}') as ExplanationData;
  } catch {
    explanationData = {
      correct_reason: 'לא ניתן לטעון הסבר כרגע.',
      options_analysis: options.map((_, i) => i === correctAnswer ? 'זוהי התשובה הנכונה.' : 'תשובה שגויה.'),
      strategy: '',
    };
  }

  // Cache the explanation back to DB
  await supabase
    .from('questions')
    .update({ explanation: JSON.stringify(explanationData) })
    .eq('id', questionId);

  return NextResponse.json(explanationData);
}
