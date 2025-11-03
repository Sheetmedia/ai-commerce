import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Test 1: Create test user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@example.com',
        full_name: 'Test User',
        plan: 'free'
      })
      .select()
      .single();

    if (profileError) throw profileError;

    // Test 2: Add tracked product
    const { data: product, error: productError } = await supabaseAdmin
      .from('tracked_products')
      .insert({
        user_id: profile.id,
        platform: 'tiktok',
        product_id: 'test123',
        product_url: 'https://shop.tiktok.com/test',
        product_name: 'Test Product',
        current_price: 199000,
        current_sales: 100
      })
      .select()
      .single();

    if (productError) throw productError;

    // Test 3: Add snapshot
    const { data: snapshot, error: snapshotError} = await supabaseAdmin
      .from('product_snapshots')
      .insert({
        tracked_product_id: product.id,
        price: 199000,
        sales_count: 100,
        rating: 4.5,
        snapshot_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (snapshotError) throw snapshotError;

    // Test 4: Add AI insight
    const { data: insight, error: insightError } = await supabaseAdmin
      .from('ai_insights')
      .insert({
        user_id: profile.id,
        tracked_product_id: product.id,
        insight_type: 'opportunity',
        title: 'Test Insight',
        description: 'This is a test insight',
        confidence_score: 0.85,
        priority: 'high'
      })
      .select()
      .single();

    if (insightError) throw insightError;

    // Test 5: Query data back
    const { data: products, error: queryError } = await supabaseAdmin
      .from('tracked_products')
      .select(`
        *,
        product_snapshots(count),
        ai_insights(count)
      `)
      .eq('user_id', profile.id);

    if (queryError) throw queryError;

    return NextResponse.json({
      success: true,
      message: 'All database tests passed!',
      data: {
        profile,
        product,
        snapshot,
        insight,
        query_result: products
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}