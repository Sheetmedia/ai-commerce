import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { DatabaseHelpers } from '@/lib/db/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's products using admin client to bypass RLS
    const { data: products, error: fetchError } = await supabaseAdmin
      .from('tracked_products')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    // Get stats for each product
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        // Get latest snapshot for comparison
        const { data: snapshots } = await supabaseAdmin
          .from('product_snapshots')
          .select('*')
          .eq('tracked_product_id', product.id)
          .order('snapshot_date', { ascending: false })
          .limit(2);

        const latest = snapshots?.[0];
        const previous = snapshots?.[1];

        let priceChange = '0%';
        let salesChange = '0%';

        if (latest && previous) {
          const priceDiff = ((latest.price - previous.price) / previous.price) * 100;
          const salesDiff = ((latest.sales - previous.sales) / previous.sales) * 100;

          priceChange = `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(1)}%`;
          salesChange = `${salesDiff >= 0 ? '+' : ''}${salesDiff.toFixed(1)}%`;
        }

        return {
          ...product,
          stats: {
            priceChange,
            salesChange,
            totalSnapshots: snapshots?.length || 0
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: productsWithStats
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productData } = body;

    if (!userId || !productData) {
      return NextResponse.json(
        { success: false, error: 'User ID and product data are required' },
        { status: 400 }
      );
    }

    // Add new product using admin client to bypass RLS
    const { data: product, error: insertError } = await supabaseAdmin
      .from('tracked_products')
      .insert({
        user_id: userId,
        ...productData
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
