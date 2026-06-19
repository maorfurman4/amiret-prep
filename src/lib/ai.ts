import OpenAI from 'openai';
import type { QuestionType, DifficultyLevel } from '@/types/exam';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GeneratedQuestion {
  text: string;
  options: { id: string; text: string }[];
  correct_answer: number;
  explanation: string;
  a: number;
  b: number;
  c: number;
  difficulty_level: DifficultyLevel;
}

const DIFFICULTY_B: Record<DifficultyLevel, number> = {
  1: -2.0,
  2: -1.0,
  3:  0.0,
  4:  1.0,
  5:  2.0,
};

const TYPE_PROMPTS: Record<QuestionType, string> = {
  sentence_completion: `Generate a Hebrew sentence completion question (השלמת משפטים) as used in the AMIRET (אמירנ"ט) exam by MALU.
The sentence should have a blank (____) that the student must complete from 4 options.
The sentence should test vocabulary, logic, and Hebrew language proficiency.`,

  restatement: `Generate a Hebrew restatement question (ניסוח מחדש) as used in the AMIRET exam.
Provide a Hebrew sentence and ask the student to identify which of 4 options expresses the same meaning.
Test comprehension of complex Hebrew phrasing.`,

  reading_comprehension: `Generate a Hebrew reading comprehension question (שאלת הבנת הנקרא) for the AMIRET exam.
The question should be based on a provided passage (do NOT include the passage in the question text — it will be linked separately).
Test the student's ability to identify main ideas, inferences, and vocabulary in context.`,

  esra: `Generate an English reading comprehension / vocabulary question (ESRA style) as used in the AMIRET exam.
Questions should test English reading comprehension, vocabulary in context, or sentence completion.
All text should be in English.`,
};

/**
 * Generate N questions of a given type and difficulty for admin bulk seeding.
 * NOT called during live exams.
 */
export async function generateQuestions(
  type: QuestionType,
  difficulty: DifficultyLevel,
  count: number = 5,
  passageText?: string, // for reading_comprehension
): Promise<GeneratedQuestion[]> {
  const b = DIFFICULTY_B[difficulty];
  const a = 1.0 + Math.random() * 0.8; // 1.0–1.8
  const c = type === 'esra' ? 0.25 : 0.25;

  const passageContext = passageText
    ? `\n\nThe questions should relate to this passage:\n"""\n${passageText}\n"""`
    : '';

  const prompt = `${TYPE_PROMPTS[type]}${passageContext}

Difficulty level: ${difficulty}/5 (IRT difficulty b ≈ ${b})
Generate exactly ${count} questions.

Return a JSON array where each element has:
{
  "text": "the question text in the appropriate language",
  "options": [
    {"id": "a", "text": "option A"},
    {"id": "b", "text": "option B"},
    {"id": "c", "text": "option C"},
    {"id": "d", "text": "option D"}
  ],
  "correct_answer": 0, // 0-indexed (0=a, 1=b, 2=c, 3=d)
  "explanation": "clear explanation in Hebrew of why the correct answer is right"
}

IMPORTANT:
- All Hebrew text must be grammatically correct Modern Israeli Hebrew
- Questions must be original and not from any known textbook
- The correct answer should not be predictable by position (vary it)
- Distractors must be plausible
- Return ONLY valid JSON, no markdown`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert in Israeli academic entrance exams, specifically the AMIRET (אמירנ"ט) exam by MALU. You generate high-quality practice questions.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const raw = response.choices[0].message.content ?? '{"questions":[]}';
  let parsed: { questions?: GeneratedQuestion[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { questions: [] };
  }

  const questions = (Array.isArray(parsed) ? parsed : parsed.questions ?? []) as GeneratedQuestion[];

  return questions.slice(0, count).map(q => ({
    ...q,
    a,
    b,
    c,
    difficulty_level: difficulty,
  }));
}

/**
 * Generate a reading passage for Section 3 at a given difficulty.
 */
export async function generatePassage(difficulty: DifficultyLevel): Promise<{ text: string; b: number }> {
  const b = DIFFICULTY_B[difficulty];
  const lengthGuide = difficulty <= 2 ? '150-200' : difficulty <= 3 ? '200-280' : '280-380';

  const prompt = `Write a Hebrew reading comprehension passage (קטע הבנת הנקרא) for the AMIRET exam.
Difficulty: ${difficulty}/5. Length: ${lengthGuide} words.
The passage should be on a topic relevant to Israeli academic life (science, society, history, culture).
It should be factual, well-structured, and not mention any real specific people or contain copyrighted content.
Return ONLY the passage text in Hebrew, no markdown, no title.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  return {
    text: response.choices[0].message.content?.trim() ?? '',
    b,
  };
}

/**
 * Generate personalized post-exam explanations for mistakes.
 * Called ONLY on the /results page, never during an active exam.
 */
export async function generateMistakeExplanations(
  mistakes: Array<{
    questionText: string;
    type: QuestionType;
    userAnswer: string;
    correctAnswer: string;
    options: string[];
  }>
): Promise<string> {
  if (mistakes.length === 0) return '';

  const mistakeList = mistakes.map((m, i) =>
    `שאלה ${i + 1} (${m.type}):\nטקסט: ${m.questionText}\nתשובת המשתמש: ${m.userAnswer}\nתשובה נכונה: ${m.correctAnswer}`
  ).join('\n\n');

  const prompt = `אתה מורה מנוסה למבחן האמירנ"ט. המשתמש טעה בשאלות הבאות:

${mistakeList}

לכל שאלה, ספק:
1. הסבר קצר (2-3 משפטים) מדוע התשובה הנכונה נכונה
2. טיפ מעשי כיצד לזהות שאלות מהסוג הזה בעתיד

כתוב בעברית, בצורה ברורה ומעודדת. אל תחזור על טקסט השאלה המלא.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 1500,
  });

  return response.choices[0].message.content?.trim() ?? '';
}
