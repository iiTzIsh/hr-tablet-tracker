import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/tablets - Get all tablets with current status
export async function GET() {
  try {
    const { data: tablets, error } = await supabase
      .from('tablets')
      .select(`
        id,
        name,
        has_pen,
        is_active,
        taken_by,
        taken_at,
        members:taken_by (
          id,
          name,
          emp_id
        )
      `)
      .eq('is_active', true)
      .order('id');

    if (error) throw error;

    const formatted = tablets.map(t => ({
      id: t.id,
      name: t.name,
      hasPen: t.has_pen,
      isAvailable: !t.taken_by,
      takenBy: t.members ? {
        id: t.members.id,
        name: t.members.name,
        empId: t.members.emp_id,
      } : null,
      takenAt: t.taken_at,
    }));

    return NextResponse.json({ tablets: formatted });
  } catch (error) {
    console.error('Error fetching tablets:', error);
    return NextResponse.json({ error: 'Failed to fetch tablets: ' + (error?.message || String(error)) }, { status: 500 });
  }
}
