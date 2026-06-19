import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-server';
import { SECTION_CONFIGS, type Question, type SectionResult } from '@/types/exam';
import { updateThetaAfterSection, routeNextDifficulty, thetaToScore, correctCount } from '@/lib/adaptive';

/**
 * POST /api/exam/answer
 * Called when the user submits answers for a section (manual or timer-expired).
 * Updates θ via IRT, routes next section questions, advances server timer.
 */
export async function POST(req: NextRequest) {
  const supabase = await createAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    sessionId: string;
    sectionIndex: number;
    answers: (number | null)[]; // answers for completed section
  };

  // Fetch current session
  const { data: session, error: fetchErr } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', body.sessionId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.current_section_index !== body.sectionIndex) {
    return NextResponse.json({ error: 'Section mismatch' }, { status: 400 });
  }

  const questionsBySection = session.questions_by_section as Record<number, Question[]>;
  const currentQuestions = questionsBySection[body.sectionIndex] ?? [];
  const cfg = SECTION_CONFIGS[body.sectionIndex - 1];

  // Compute new theta
  const sectionForAdaptive = { questions: currentQuestions, answers: body.answers };
  const newTheta = updateThetaAfterSection(session.theta, sectionForAdaptive);

  const result: SectionResult = {
    sectionIndex: body.sectionIndex,
    type: cfg.type,
    questions: currentQuestions,
    answers: body.answers,
    thetaBefore: session.theta,
    thetaAfter: newTheta,
    correctCount: correctCount(sectionForAdaptive),
    totalCount: currentQuestions.length,
  };

  const newHistory = [...(session.theta_history as object[]), { after_section: body.sectionIndex, theta: newTheta }];
  const nextSectionIndex = body.sectionIndex + 1;
  const isLastSection = nextSectionIndex > SECTION_CONFIGS.length;

  let updatePayload: Record<string, unknown> = {
    theta: newTheta,
    theta_history: newHistory,
    current_section_index: nextSectionIndex,
    answers_by_section: { ...session.answers_by_section, [body.sectionIndex]: body.answers },
    section_results: [...(session.section_results as object[]), result],
  };

  if (isLastSection) {
    // Exam complete
    updatePayload.completed_at = new Date().toISOString();
    updatePayload.theta_final = newTheta;
    updatePayload.score = thetaToScore(newTheta);
    updatePayload.current_section_expires_at = null;
  } else {
    // Pre-fetch next section questions at new difficulty
    const nextDifficulty = routeNextDifficulty(newTheta);
    const nextCfg = SECTION_CONFIGS[nextSectionIndex - 1];
    let nextQuestions: Question[] = questionsBySection[nextSectionIndex] ?? [];

    // Fetch fresh set from DB at correct difficulty level (adaptive routing)
    if (nextCfg.type === 'reading_comprehension') {
      const { data: passages } = await supabase
        .from('passages')
        .select('id, text, difficulty_level, b')
        .eq('difficulty_level', nextDifficulty)
        .limit(20);

      const passage = passages?.[Math.floor(Math.random() * (passages?.length ?? 1))];
      if (passage) {
        const { data: qs } = await supabase
          .from('questions')
          .select('*')
          .eq('type', 'reading_comprehension')
          .eq('passage_id', passage.id)
          .limit(5);

        nextQuestions = (qs ?? []).map(q => ({
          ...q,
          passage: { id: passage.id, text: passage.text, difficulty_level: passage.difficulty_level, b: passage.b },
        })) as Question[];
      }
    } else {
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .eq('type', nextCfg.type)
        .eq('difficulty_level', nextDifficulty)
        .limit(nextCfg.questionCount + 10);

      nextQuestions = (qs ?? []).sort(() => Math.random() - 0.5).slice(0, nextCfg.questionCount) as Question[];
    }

    const updatedQuestions = { ...questionsBySection, [nextSectionIndex]: nextQuestions };
    updatePayload.questions_by_section = updatedQuestions;

    // Server timer for next section
    if (!session.is_practice) {
      const expiresAt = new Date(Date.now() + nextCfg.durationSeconds * 1000).toISOString();
      updatePayload.current_section_expires_at = expiresAt;
    }
  }

  const { error: updateErr } = await supabase
    .from('exam_sessions')
    .update(updatePayload)
    .eq('id', body.sessionId);

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }

  return NextResponse.json({
    newTheta,
    score: isLastSection ? thetaToScore(newTheta) : null,
    isComplete: isLastSection,
    nextSectionIndex: isLastSection ? null : nextSectionIndex,
    nextExpiresAt: updatePayload.current_section_expires_at ?? null,
  });
}
