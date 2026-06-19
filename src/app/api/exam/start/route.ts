import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { SECTION_CONFIGS, type ExamMode, type Question } from '@/types/exam';
import { routeNextDifficulty } from '@/lib/adaptive';

/**
 * POST /api/exam/start
 * True Multistage CAT: initializes ONLY Section 1 at difficulty=3 (θ=0 start).
 * Every subsequent section is fetched in /api/exam/answer after θ is updated.
 */
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  const body = await req.json() as { mode?: ExamMode; isPractice?: boolean; guestId?: string };
  const sessionOwner = user?.id ?? body.guestId ?? crypto.randomUUID();

  const mode: ExamMode = body.mode ?? 'full';
  const isPractice = body.isPractice ?? false;

  // Initial θ=0 → difficulty level 3
  const initialDifficulty = routeNextDifficulty(0); // = 3
  const section1Cfg = SECTION_CONFIGS[0]; // { index:1, type:'sentence_completion', questionCount:4 }

  // Fetch ONLY Section 1 questions
  const { data: qs, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .eq('type', section1Cfg.type)
    .eq('difficulty_level', initialDifficulty)
    .limit(section1Cfg.questionCount + 10);

  if (qErr || !qs) {
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }

  const section1Questions = (qs as Question[])
    .sort(() => Math.random() - 0.5)
    .slice(0, section1Cfg.questionCount);

  const questionsBySection: Record<number, Question[]> = {
    1: section1Questions,
  };

  // Server timer for Section 1
  const expiresAt = new Date(Date.now() + section1Cfg.durationSeconds * 1000).toISOString();

  const { data: session, error: insertError } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: sessionOwner,
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
