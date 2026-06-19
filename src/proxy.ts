import { NextResponse, type NextRequest } from 'next/server';

// All routes are public — no login required.
// Auth is optional: logged-in users get stats/leaderboard saved; guests use a local session.
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
