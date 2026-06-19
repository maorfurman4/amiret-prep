import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { SECTION_CONFIGS, type ExamMode, type Question } from '@/types/exam';
import { routeNextDifficulty } from '@/lib/adaptive';

/**
 * POST /api/exam/start
 * Creates a new exam session, pre-loads all questions from DB,
 * writes the first section timer to Supabase (server-driven).
 */
export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabaseClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as { mode?: ExamMode; isPractice?: boolean };
  const mode: ExamMode = body.mode ?? 'full';
  const isPractice = body.isPractice ?? false;

  // For 'full' mode: pre-fetch all 6 sections at difficulty=3 (θ=0 start).
  // Routing adjusts after each section in /api/exam/answer.
  const questionsBySection: Record<number, Question[]> = {};

  const configs = SECTION_CONFIGS;
  const initialDifficulty = routeNextDifficulty(0); // = 3

  for (const cfg of configs) {
    if (cfg.type === 'reading_comprehension') {
      // Fetch a passage + its 5 questions together
      const { data: passages } = await supabase
        .from('passages')
        .select('id, text, difficulty_level, b')
        .eq('difficulty_level', initialDifficulty)
        .limit(20);

      const passage = passages?.[Math.floor(Math.random() * (passages?.length ?? 1))];
      if (!passage) {
        questionsBySection[cfg.index] = [];
        continue;
      }

      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('type', 'reading_comprehension')
        .eq('passage_id', passage.id)
        .limit(5);

      questionsBySection[cfg.index] = (qs ?? []).map(q => ({
        ...q,
        passage: { id: passage.id, text: passage.text, difficulty_level: passage.difficulty_level, b: passage.b },
      })) as Question[];
    } else {
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('type', cfg.type)
        .eq('difficulty_level', initialDifficulty)
        .limit(cfg.questionCount + 10); // fetch more, pick randomly

      const shuffled = (qs ?? []).sort(() => Math.random() - 0.5).slice(0, cfg.questionCount);
      questionsBySection[cfg.index] = shuffled as Question[];
    }
  }

  // Create session with server timer for section 1
  const firstSection = configs[0];
  const expiresAt = new Date(Date.now() + firstSection.durationSeconds * 1000).toISOString();

  const { data: session, error: insertError } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: user.id,
      mode,
      is_practice: isPractice,
      current_section_index: 1,
      current_section_expires_at: isPractice ? null : expiresAt,
      theta: 0,
      theta_history: [],
      questions_by_section: questionsBySection,
      answers_by_section: {},
      section_results: [],
    })
    .select()
    .single();

  if (insertError || !session) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return NextResponse.json({ sessionId: session.id, expiresAt });
}
