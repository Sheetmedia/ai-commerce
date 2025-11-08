import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitorId = params.id;

    if (!competitorId) {
      return NextResponse.json(
        { success: false, error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // Delete competitor
    const { error: deleteError } = await supabaseAdmin
      .from('competitors')
      .delete()
      .eq('id', competitorId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Competitor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete competitor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitorId = params.id;
    const body = await request.json();
    const { isActive } = body;

    if (!competitorId) {
      return NextResponse.json(
        { success: false, error: 'Competitor ID is required' },
        { status: 400 }
      );
    }

    // Update competitor
    const { data: competitor, error: updateError } = await supabaseAdmin
      .from('competitors')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', competitorId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: competitor
    });

  } catch (error) {
    console.error('Error updating competitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update competitor' },
      { status: 500 }
    );
  }
}
