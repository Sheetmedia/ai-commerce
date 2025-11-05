import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Test 1: Check if test profile exists, if not create it
    let { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', 'demo@aicommerce.vn')
      .single();

    let profile;
    if (checkError && checkError.code === 'PGRST116') {
      // Profile doesn't exist, create it using auth.users
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: 'demo@aicommerce.vn',
        password: 'demo123456',
        email_confirm: true
      });

      if (authError) throw authError;

      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: 'demo@aicommerce.vn',
          full_name: 'Test User',
          plan: 'free'
        })
        .select()
        .single();

      if (profileError) throw profileError;
      profile = newProfile;
    } else if (checkError) {
      throw checkError;
    } else {
      profile = existingProfile;
    }

    // Test 2: Add tracked product (with conflict handling)
    const { data: product, error: productError } = await supabaseAdmin
      .from('tracked_products')
      .upsert({
        user_id: profile.id,
        platform: 'tiktok',
        product_id: 'test123',
        product_url: 'https://shop.tiktok.com/test',
        product_name: 'Test Product',
        current_price: 199000,
        current_sales: 100
      }, {
        onConflict: 'user_id,platform,product_id'
      })
      .select()
      .single();

    if (productError) throw productError;

    // Test 3: Add snapshot (with conflict handling)
    const { data: snapshot, error: snapshotError} = await supabaseAdmin
      .from('product_snapshots')
      .upsert({
        tracked_product_id: product.id,
        price: 199000,
        sales_count: 100,
        rating: 4.5,
        snapshot_date: new Date().toISOString().split('T')[0]
      }, {
        onConflict: 'tracked_product_id,snapshot_date'
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