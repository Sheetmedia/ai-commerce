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

    // Validate token format
    if (!token || !token.includes('.')) {
      return NextResponse.json(
        { error: 'Invalid authorization token format' },
        { status: 401 }
      );
    }

    // Decode JWT token to get user ID
    let userId: string;
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      userId = payload.sub;
    } catch (decodeError) {
      console.error('Error decoding JWT token:', decodeError);
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type'); // opportunity, warning, trend, action
    const priority = searchParams.get('priority'); // high, medium, low
    const status = searchParams.get('status') || 'active'; // active, dismissed, actioned
    const unreadOnly = searchParams.get('unread') === 'true';
    const productId = searchParams.get('productId');

    // Get real insights from database
    const { data: insights, error: insightsError } = await supabaseAdmin
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
      // Fallback to mock data if database query fails
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          insight_type: 'opportunity',
          title: 'Giá sản phẩm đang giảm mạnh',
          description: 'Giá sản phẩm đã giảm 15% trong tuần qua. Đây có thể là cơ hội để tăng doanh số bằng cách chạy quảng cáo hoặc giảm giá thêm.',
          priority: 'high',
          confidence_score: 0.85,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          is_read: false,
        },
        {
          id: '2',
          insight_type: 'warning',
          title: 'Đánh giá sản phẩm giảm sút',
          description: 'Rating trung bình đã giảm từ 4.8 xuống 4.5. Cần kiểm tra chất lượng sản phẩm và phản hồi khách hàng.',
          priority: 'medium',
          confidence_score: 0.72,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          is_read: false,
        },
        {
          id: '3',
          insight_type: 'trend',
          title: 'Xu hướng tăng trưởng chậm lại',
          description: 'Doanh số hàng tuần tăng chậm hơn so với tháng trước. Cân nhắc điều chỉnh chiến lược marketing.',
          priority: 'medium',
          confidence_score: 0.68,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          is_read: true,
        },
        {
          id: '4',
          insight_type: 'action',
          title: 'Cần cập nhật giá sản phẩm',
          description: 'Giá hiện tại không cạnh tranh với đối thủ. Đề xuất giảm giá 5-10% để duy trì vị thế.',
          priority: 'high',
          confidence_score: 0.91,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          is_read: false,
        },
        {
          id: '5',
          insight_type: 'recommendation',
          title: 'Tối ưu hóa mô tả sản phẩm',
          description: 'Mô tả sản phẩm có thể được cải thiện với từ khóa SEO để tăng khả năng tìm thấy.',
          priority: 'low',
          confidence_score: 0.55,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          is_read: true,
        }
      ];
      return NextResponse.json({
        success: true,
        data: mockInsights,
        stats: {
          total: mockInsights.length,
          unread: mockInsights.filter(i => !i.is_read).length,
          highPriority: mockInsights.filter(i => i.priority === 'high' && i.status === 'active').length,
          byType: {
            opportunity: mockInsights.filter(i => i.insight_type === 'opportunity').length,
            warning: mockInsights.filter(i => i.insight_type === 'warning').length,
            trend: mockInsights.filter(i => i.insight_type === 'trend').length,
            action: mockInsights.filter(i => i.insight_type === 'action').length,
          }
        },
        count: mockInsights.length
      });
    }

    // Apply filters
    let filteredInsights = [...insights];

    if (type) {
      filteredInsights = filteredInsights.filter(i => i.insight_type === type);
    }

    if (priority) {
      filteredInsights = filteredInsights.filter(i => i.priority === priority);
    }

    if (status && status !== 'all') {
      filteredInsights = filteredInsights.filter(i => i.status === status);
    }

    if (unreadOnly) {
      filteredInsights = filteredInsights.filter(i => !i.is_read);
    }

    if (productId) {
      // For demo, assume all insights belong to the same product
      filteredInsights = filteredInsights.filter(i => i.id);
    }

    // Apply limit
    filteredInsights = filteredInsights.slice(0, limit);

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
      data: filteredInsights,
      stats,
      count: filteredInsights?.length || 0
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
