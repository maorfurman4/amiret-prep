/**
 * Bulk question seeding script — generates 10,000+ AMIRET questions with Hebrew explanations.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/seed-bulk-questions.ts
 *
 * Or set in .env.local and run:
 *   npx ts-node -r dotenv/config scripts/seed-bulk-questions.ts
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type QuestionType = 'sentence_completion' | 'restatement' | 'reading_comprehension';
type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

// How many questions to generate per batch call
const BATCH_SIZE = 10;

// Target counts per type × difficulty (adjust as needed)
// 10 batches × 10 questions × 5 difficulties × 3 types = 1,500 questions per run
// Run multiple times or increase RUNS_PER_CELL for more
const RUNS_PER_CELL = 20; // → 20 × 10 × 5 × 3 = 3,000 questions per run
const TYPES: QuestionType[] = ['sentence_completion', 'restatement', 'reading_comprehension'];
const DIFFICULTIES: DifficultyLevel[] = [1, 2, 3, 4, 5];

const IRT_B: Record<DifficultyLevel, number> = { 1: -2.0, 2: -1.0, 3: 0.0, 4: 1.0, 5: 2.0 };

const TYPE_PROMPTS: Record<QuestionType, string> = {
  sentence_completion: `Generate English sentence completion questions for the AMIRET exam (Israeli university English placement test by MALU).
Each question has a sentence with a blank (____) and 4 options. One option correctly completes the sentence.
Focus on: academic vocabulary, collocations, grammar, logical meaning.
ALL question text and options must be in English only.`,

  restatement: `Generate English restatement questions for the AMIRET exam (Israeli university English placement test by MALU).
Each question gives one English sentence, then 4 options. One option expresses the same meaning.
Focus on: paraphrase, synonym recognition, clause restructuring, logical equivalence.
ALL question text and options must be in English only.`,

  reading_comprehension: `Generate English reading comprehension questions for the AMIRET exam (Israeli university English placement test by MALU).
Each question is based on an academic passage (100-350 words). Include the passage in "passage_text".
Questions test: main idea, inference, vocabulary in context, detail retrieval, author's purpose.
ALL question text, passage, and options must be in English only.`,
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  1: 'very easy — high school vocabulary, simple sentence structures',
  2: 'easy — common academic vocabulary, straightforward logic',
  3: 'medium — standard AMIRET difficulty, university entrance level',
  4: 'hard — advanced academic vocabulary, complex reasoning required',
  5: 'very hard — sophisticated academic English, near-native level required',
};

interface RawQuestion {
  text: string;
  options: { id: string; text: string }[];
  correct_answer: number;
  explanation_he: {
    correct_reason: string;
    options_analysis: string[];
    strategy: string;
  };
  passage_text?: string;
}

async function generateBatch(
  type: QuestionType,
  difficulty: DifficultyLevel,
  count: number,
): Promise<RawQuestion[]> {
  const prompt = `${TYPE_PROMPTS[type]}
Difficulty: ${difficulty}/5 (${DIFFICULTY_LABELS[difficulty]})
Generate exactly ${count} questions.

For EACH question also write a detailed Hebrew explanation ("explanation_he") for Israeli students:
- correct_reason: מדוע התשובה הנכונה נכונה (2-3 משפטים)
- options_analysis: מערך של 4 הסברים, אחד לכל אפשרות (✅/❌ + הסבר)
- strategy: טיפ אסטרטגי לפתרון שאלות מסוג זה (1-2 משפטים)

Return a JSON object with a "questions" array. Each element:
{
  "text": "the question or sentence (English)",
  "options": [
    {"id":"a","text":"option A"},
    {"id":"b","text":"option B"},
    {"id":"c","text":"option C"},
    {"id":"d","text":"option D"}
  ],
  "correct_answer": 0,
  "passage_text": "the passage (reading_comprehension only, omit otherwise)",
  "explanation_he": {
    "correct_reason": "...",
    "options_analysis": ["...","...","...","..."],
    "strategy": "..."
  }
}

Rules:
- correct_answer is 0-indexed (0=a, 1=b, 2=c, 3=d)
- Vary the position of the correct answer
- All English text must be original and not from known textbooks
- explanation_he must be entirely in Hebrew`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.85,
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content ?? '{}') as { questions?: RawQuestion[] };
    return parsed.questions ?? [];
  } catch {
    return [];
  }
}

async function insertQuestions(questions: RawQuestion[], type: QuestionType, difficulty: DifficultyLevel) {
  const b = IRT_B[difficulty];
  const a = 1.0 + Math.random() * 0.8;
  const c = 0.25;

  for (const q of questions) {
    try {
      // For reading_comprehension: upsert passage first
      let passageId: string | null = null;
      if (type === 'reading_comprehension' && q.passage_text) {
        const { data: passage } = await supabase
          .from('passages')
          .insert({ text: q.passage_text, difficulty_level: difficulty, b })
          .select('id')
          .single();
        passageId = passage?.id ?? null;
      }

      await supabase.from('questions').insert({
        type,
        difficulty_level: difficulty,
        text: q.text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: JSON.stringify(q.explanation_he),
        passage_id: passageId,
        a,
        b,
        c,
      });
    } catch (err) {
      console.error('Insert error:', err);
    }
  }
}

async function main() {
  let totalInserted = 0;

  for (const type of TYPES) {
    for (const difficulty of DIFFICULTIES) {
      console.log(`\n▶ ${type} difficulty=${difficulty}`);

      for (let run = 0; run < RUNS_PER_CELL; run++) {
        process.stdout.write(`  run ${run + 1}/${RUNS_PER_CELL}... `);
        const questions = await generateBatch(type, difficulty, BATCH_SIZE);
        await insertQuestions(questions, type, difficulty);
        totalInserted += questions.length;
        console.log(`${questions.length} inserted (total: ${totalInserted})`);

        // Rate limit pause
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  console.log(`\n✅ Done — ${totalInserted} questions inserted.`);
}

main().catch(console.error);
