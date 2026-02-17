import { NextResponse } from 'next/server';

// POST /api/auth/logout - Admin logout
export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('admin_token');
  return response;
}
