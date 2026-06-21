import { NextRequest, NextResponse } from 'next/server';

// Auth is handled client-side (localStorage). No server-side protection needed.
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
