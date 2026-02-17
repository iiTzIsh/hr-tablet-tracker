import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/auth/verify-pin - Verify member PIN (for device registration)
export async function POST(request) {
  try {
    const body = await request.json();
    const { memberId, pin } = body;

    if (!memberId || !pin) {
      return NextResponse.json({ error: 'Member ID and PIN are required' }, { status: 400 });
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('id, name, emp_id, pin, is_active')
      .eq('id', memberId)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (!member.is_active) {
      return NextResponse.json({ error: 'Account is deactivated. Contact admin.' }, { status: 403 });
    }

    if (member.pin !== pin) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        empId: member.emp_id,
      },
    });
  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
