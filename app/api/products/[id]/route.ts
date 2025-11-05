import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/products/[id] - Get single product with analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get product
    const { data: product, error: productError } = await supabase
      .from('tracked_products')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get historical snapshots (last 30 days)
    const { data: snapshots } = await supabase
      .from('product_snapshots')
      .select('*')
      .eq('tracked_product_id', params.id)
      .gte('snapshot_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('snapshot_date', { ascending: true });

    // Get competitors
    const { data: competitors } = await supabase
      .from('competitors')
      .select('*')
      .eq('tracked_product_id', params.id)
      .eq('is_active', true);

    // Get AI insights
    const { data: insights } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('tracked_product_id', params.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate analytics
    const analytics = calculateAnalytics(product, snapshots || []);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        snapshots: snapshots || [],
        competitors: competitors || [],
        insights: insights || [],
        analytics
      }
    });

  } catch (error: any) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Allowed fields to update
    const allowedFields = [
      'product_name',
      'category',
      'is_active',
      'tracking_frequency',
      'alert_on_price_change',
      'alert_on_sales_spike'
    ];

    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in updates) {
        updateData[field] = updates[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from('tracked_products')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error: any) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete will cascade to snapshots, insights, competitors
    const { error } = await supabase
      .from('tracked_products')
      .delete()
      .eq('id', params.id)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Helper: Calculate analytics from snapshots
function calculateAnalytics(product: any, snapshots: any[]) {
  if (!snapshots || snapshots.length === 0) {
    return {
      priceChange: 0,
      salesChange: 0,
      ratingChange: 0,
      averagePrice: product.current_price || 0,
      totalSales: product.current_sales || 0,
      trend: 'stable'
    };
  }

  const sortedSnapshots = [...snapshots].sort((a, b) => 
    new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
  );

  const firstSnapshot = sortedSnapshots[0];
  const lastSnapshot = sortedSnapshots[sortedSnapshots.length - 1];

  // Calculate changes
  const priceChange = firstSnapshot.price > 0
    ? ((lastSnapshot.price - firstSnapshot.price) / firstSnapshot.price) * 100
    : 0;

  const salesChange = firstSnapshot.sales_count > 0
    ? ((lastSnapshot.sales_count - firstSnapshot.sales_count) / firstSnapshot.sales_count) * 100
    : 0;

  const ratingChange = lastSnapshot.rating - firstSnapshot.rating;

  // Calculate averages
  const averagePrice = snapshots.reduce((sum, s) => sum + s.price, 0) / snapshots.length;
  const totalSales = lastSnapshot.sales_count || 0;

  // Determine trend
  let trend = 'stable';
  if (salesChange > 10) trend = 'up';
  else if (salesChange < -10) trend = 'down';

  // Calculate velocity (sales per day)
  const daysCovered = snapshots.length;
  const salesVelocity = daysCovered > 0 ? totalSales / daysCovered : 0;

  // Price volatility
  const prices = snapshots.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceVolatility = averagePrice > 0
    ? ((maxPrice - minPrice) / averagePrice) * 100
    : 0;

  return {
    priceChange: parseFloat(priceChange.toFixed(2)),
    salesChange: parseFloat(salesChange.toFixed(2)),
    ratingChange: parseFloat(ratingChange.toFixed(2)),
    averagePrice: Math.round(averagePrice),
    totalSales,
    trend,
    salesVelocity: parseFloat(salesVelocity.toFixed(1)),
    priceVolatility: parseFloat(priceVolatility.toFixed(2)),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    dataPoints: snapshots.length
  };
}