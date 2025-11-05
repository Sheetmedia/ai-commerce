import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  confidence_score: number;
  created_at: string;
  status: string;
  is_read: boolean;
}

// GET /api/insights - Get user's insights
export async function GET(request: NextRequest) {
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

    // For now, treat the token as user ID directly (temporary fix)
    const userId = token;

    // Skip user validation for now and create a mock user object
    const user = { id: userId };

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type'); // opportunity, warning, trend, action
    const priority = searchParams.get('priority'); // high, medium, low
    const status = searchParams.get('status') || 'active'; // active, dismissed, actioned
    const unreadOnly = searchParams.get('unread') === 'true';
    const productId = searchParams.get('productId');

    // Build query - for now, return empty array since we don't have real data
    const insights: AIInsight[] = [];

    // Calculate stats
    const stats = {
      total: insights?.length || 0,
      unread: insights?.filter(i => !i.is_read).length || 0,
      highPriority: insights?.filter(i => i.priority === 'high' && i.status === 'active').length || 0,
      byType: {
        opportunity: insights?.filter(i => i.insight_type === 'opportunity').length || 0,
        warning: insights?.filter(i => i.insight_type === 'warning').length || 0,
        trend: insights?.filter(i => i.insight_type === 'trend').length || 0,
        action: insights?.filter(i => i.insight_type === 'action').length || 0,
      }
    };

    return NextResponse.json({
      success: true,
      data: insights,
      stats,
      count: insights?.length || 0
    });

  } catch (error: any) {
    console.error('GET /api/insights error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/insights - Create new insight manually
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      tracked_product_id,
      insight_type,
      title,
      description,
      confidence_score = 0.8,
      priority = 'medium',
      action_items = []
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!tracked_product_id || !insight_type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify product belongs to user
    const { data: product } = await supabaseAdmin
      .from('tracked_products')
      .select('id')
      .eq('id', tracked_product_id)
      .eq('user_id', userId)
      .single();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    // Insert insight
    const { data: insight, error } = await supabaseAdmin
      .from('ai_insights')
      .insert({
        user_id: userId,
        tracked_product_id,
        insight_type,
        title,
        description,
        confidence_score,
        priority,
        action_items,
        ai_model: 'manual',
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: insight
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST /api/insights error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
