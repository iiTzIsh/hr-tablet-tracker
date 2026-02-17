import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/members/active - Get active members (public, for dropdown)
export async function GET() {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, emp_id')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching active members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
