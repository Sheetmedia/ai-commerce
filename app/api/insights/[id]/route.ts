import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/insights/[id] - Get single insight
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the JWT token and get user
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: insight, error } = await supabaseAdmin
      .from('ai_insights')
      .select(`
        *,
        product:tracked_products!tracked_product_id (
          id,
          product_name,
          platform,
          current_price,
          current_sales,
          current_rating
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !insight) {
      return NextResponse.json(
        { error: 'Insight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: insight
    });

  } catch (error: any) {
    console.error('GET /api/insights/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/insights/[id] - Update insight
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the JWT token and get user
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const updates = await request.json();

    // Allowed fields to update
    const allowedFields = [
      'is_read',
      'is_starred',
      'status', // active, dismissed, actioned
      'read_at',
      'actioned_at'
    ];

    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    // Auto-set timestamps
    if (updates.is_read === true && !updates.read_at) {
      updateData.read_at = new Date().toISOString();
    }

    if (updates.status === 'actioned' && !updates.actioned_at) {
      updateData.actioned_at = new Date().toISOString();
    }

    const { data: insight, error } = await supabaseAdmin
      .from('ai_insights')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    if (!insight) {
      return NextResponse.json(
        { error: 'Insight not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: insight
    });

  } catch (error: any) {
    console.error('PATCH /api/insights/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/insights/[id] - Delete insight
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the JWT token and get user
    const { supabaseAdmin } = await import('@/lib/supabase/server');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabaseAdmin
      .from('ai_insights')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Insight deleted'
    });

  } catch (error: any) {
    console.error('DELETE /api/insights/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
