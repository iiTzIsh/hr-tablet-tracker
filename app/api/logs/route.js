import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// GET /api/logs - Get activity logs
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const tabletId = searchParams.get('tabletId');
    const memberId = searchParams.get('memberId');

    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (tabletId) query = query.eq('tablet_id', tabletId);
    if (memberId) query = query.eq('member_id', memberId);

    const { data: logs, error } = await query;

    if (error) throw error;

    const response = NextResponse.json({ logs });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
