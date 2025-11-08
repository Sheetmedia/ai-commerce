import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ProductScraper } from '@/lib/scraper';

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

    // Get competitors with product information
    const { data: competitors, error: competitorsError } = await supabaseAdmin
      .from('competitors')
      .select(`
        *,
        tracked_products (
          id,
          product_name,
          current_price,
          current_sales
        )
      `)
      .eq('tracked_products.user_id', userId)
      .order('added_at', { ascending: false });

    if (competitorsError) throw competitorsError;

    // Transform data to include comparison fields
    const competitorsWithComparison = competitors?.map(competitor => {
      const product = competitor.tracked_products;
      return {
        ...competitor,
        product_name: product?.product_name,
        your_price: product?.current_price,
        your_sales: product?.current_sales,
        price_diff: product?.current_price ? competitor.latest_price - product.current_price : null,
        sales_diff: product?.current_sales ? competitor.latest_sales - product.current_sales : null,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: competitorsWithComparison
    });

  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, trackedProductId, competitorUrl, competitorName, competitorPlatform } = body;

    if (!userId || !trackedProductId || !competitorUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID, tracked product ID, and competitor URL are required' },
        { status: 400 }
      );
    }

    // Verify the tracked product belongs to the user
    const { data: product, error: productError } = await supabaseAdmin
      .from('tracked_products')
      .select('id, user_id')
      .eq('id', trackedProductId)
      .eq('user_id', userId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { success: false, error: 'Invalid tracked product' },
        { status: 400 }
      );
    }

    // Check if competitor already exists
    const { data: existingCompetitor } = await supabaseAdmin
      .from('competitors')
      .select('id')
      .eq('tracked_product_id', trackedProductId)
      .eq('competitor_url', competitorUrl)
      .single();

    if (existingCompetitor) {
      return NextResponse.json(
        { success: false, error: 'Competitor already exists for this product' },
        { status: 400 }
      );
    }

    // Scrape initial competitor data
    const scraper = new ProductScraper();
    const scrapedData = await scraper.scrapeProduct(competitorUrl, competitorPlatform || 'shopee');

    // Add competitor
    const { data: competitor, error: insertError } = await supabaseAdmin
      .from('competitors')
      .insert({
        tracked_product_id: trackedProductId,
        competitor_url: competitorUrl,
        competitor_name: competitorName || 'Unknown Competitor',
        competitor_platform: competitorPlatform || 'shopee',
        latest_price: scrapedData.price,
        latest_sales: scrapedData.sales,
        latest_rating: scrapedData.rating,
        last_checked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: competitor
    });

  } catch (error) {
    console.error('Error creating competitor:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create competitor' },
      { status: 500 }
    );
  }
}
