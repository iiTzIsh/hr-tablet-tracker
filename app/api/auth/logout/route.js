import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/auth/logout - Admin logout
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('admin_token');
  return response;
}
