import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/members - Get all members
export async function GET() {
  try {
    const { data: members, error } = await supabase
      .from('members')
      .select('id, name, emp_id, pin, is_active, created_at')
      .order('name');

    if (error) throw error;

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/members - Create a new member
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, empId, pin } = body;

    if (!name || !empId || !pin) {
      return NextResponse.json({ error: 'Name, Employee ID, and PIN are required' }, { status: 400 });
    }

    if (pin.length < 4) {
      return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('members')
      .insert({
        name,
        emp_id: empId,
        pin,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ member: data, message: 'Member created successfully' });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

// PUT /api/members - Update a member
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, empId, pin, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (empId !== undefined) updateData.emp_id = empId;
    if (pin !== undefined) updateData.pin = pin;
    if (isActive !== undefined) updateData.is_active = isActive;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ member: data, message: 'Member updated successfully' });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

// DELETE /api/members - Delete a member
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    // Check if member has a tablet checked out
    const { data: tablets } = await supabase
      .from('tablets')
      .select('id, name')
      .eq('taken_by', id);

    if (tablets && tablets.length > 0) {
      return NextResponse.json({
        error: `Cannot delete: member has ${tablets[0].name} checked out. Return it first.`,
      }, { status: 409 });
    }

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
