// =======================================================================
// File: src/app/api/auth/logout/route.ts
// Purpose: Clears the authentication cookie to log the user out.
// Status: No changes needed.
// =======================================================================
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  // Clear the cookie by setting its maxAge to a past date
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  return response;
}