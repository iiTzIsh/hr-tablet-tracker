import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/checkout - Take or return a tablet
export async function POST(request) {
  try {
    const body = await request.json();
    const { tabletId, memberId, action } = body;

    if (!tabletId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current tablet status
    const { data: tablet, error: fetchError } = await supabase
      .from('tablets')
      .select('*')
      .eq('id', tabletId)
      .single();

    if (fetchError || !tablet) {
      return NextResponse.json({ error: 'Tablet not found' }, { status: 404 });
    }

    if (action === 'TAKE') {
      if (!memberId) {
        return NextResponse.json({ error: 'Member ID required for checkout' }, { status: 400 });
      }

      if (tablet.taken_by) {
        return NextResponse.json({ error: 'Tablet is already taken' }, { status: 409 });
      }

      // Get member info for log
      const { data: member } = await supabase
        .from('members')
        .select('name')
        .eq('id', memberId)
        .single();

      // Update tablet
      const { error: updateError } = await supabase
        .from('tablets')
        .update({
          taken_by: memberId,
          taken_at: new Date().toISOString(),
        })
        .eq('id', tabletId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_log').insert({
        tablet_id: tabletId,
        member_id: memberId,
        action: 'TAKE',
        member_name: member?.name || 'Unknown',
        tablet_name: tablet.name,
      });

      return NextResponse.json({
        success: true,
        message: `${tablet.name} checked out successfully`,
      });

    } else if (action === 'RETURN') {
      if (!tablet.taken_by) {
        return NextResponse.json({ error: 'Tablet is not checked out' }, { status: 409 });
      }

      // Get member info for log
      const { data: member } = await supabase
        .from('members')
        .select('name')
        .eq('id', tablet.taken_by)
        .single();

      // Update tablet
      const { error: updateError } = await supabase
        .from('tablets')
        .update({
          taken_by: null,
          taken_at: null,
        })
        .eq('id', tabletId);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_log').insert({
        tablet_id: tabletId,
        member_id: tablet.taken_by,
        action: 'RETURN',
        member_name: member?.name || 'Unknown',
        tablet_name: tablet.name,
      });

      return NextResponse.json({
        success: true,
        message: `${tablet.name} returned successfully`,
      });

    } else {
      return NextResponse.json({ error: 'Invalid action. Use TAKE or RETURN' }, { status: 400 });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
