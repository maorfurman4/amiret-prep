import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/exam/state?sessionId=xxx
 * Returns current session state for F5-recovery.
 * Enforces server timer: if current_section_expires_at has passed,
 * auto-advances the section (caller should handle this).
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessionId = req.nextUrl.searchParams.get('sessionId');
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

  const { data: session } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Calculate remaining time from server clock
  const now = Date.now();
  let remainingMs: number | null = null;
  let timerExpired = false;

  if (session.current_section_expires_at && !session.is_practice && !session.completed_at) {
    const expiresAt = new Date(session.current_section_expires_at).getTime();
    remainingMs = Math.max(0, expiresAt - now);
    timerExpired = remainingMs === 0;
  }

  return NextResponse.json({
    session,
    remainingMs,
    timerExpired,
    serverNow: now,
  });
}
