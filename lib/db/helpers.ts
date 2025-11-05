import { supabase } from '@/lib/supabase/client';
import type { TrackedProduct, AIInsight } from '@/lib/types/database';

export class DatabaseHelpers {

  // Get user's products
  static async getUserProducts(userId: string) {
    const { data, error } = await supabase
      .from('tracked_products')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as TrackedProduct[];
  }

  // Add new product
  static async addProduct(userId: string, productData: Partial<TrackedProduct>) {
    const { data, error } = await supabase
      .from('tracked_products')
      .insert({
        user_id: userId,
        ...productData
      })
      .select()
      .single();

    if (error) throw error;
    return data as TrackedProduct;
  }

  // Get product snapshots (history)
  static async getProductHistory(productId: string, days: number = 30) {
    const { data, error } = await supabase
      .from('product_snapshots')
      .select('*')
      .eq('tracked_product_id', productId)
      .gte('snapshot_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('snapshot_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get AI insights for product
  static async getProductInsights(productId: string) {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('tracked_product_id', productId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AIInsight[];
  }

  // Check usage limits
  static async checkUsageLimits(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('ai_queries_limit, ai_queries_used_today, products_limit')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const { data: productCount } = await supabase
      .from('tracked_products')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    const productCountNumber = Array.isArray(productCount) ? productCount.length : (productCount as any || 0);
    return {
      aiQueriesRemaining: data.ai_queries_limit - data.ai_queries_used_today,
      productsRemaining: data.products_limit - productCountNumber,
      canAddProduct: productCountNumber < data.products_limit,
      canMakeAIQuery: data.ai_queries_used_today < data.ai_queries_limit
    };
  }

  // Get dashboard stats
  static async getDashboardStats(userId: string) {
    // Get product count
    const { count: productCount, error: productError } = await supabase
      .from('tracked_products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (productError) throw productError;

    // Get unread insights count
    const { count: unreadInsights, error: insightsError } = await supabase
      .from('ai_insights')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (insightsError) throw insightsError;

    // Get today's AI queries used
    const today = new Date().toISOString().split('T')[0];
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('ai_queries_used_today')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    return {
      totalProducts: productCount || 0,
      unreadInsights: unreadInsights || 0,
      aiQueriesUsed: profile?.ai_queries_used_today || 0
    };
  }

  // Increment AI query usage
  static async incrementAIUsage(userId: string) {
    // First get current value
    const { data: currentData, error: fetchError } = await supabase
      .from('profiles')
      .select('ai_queries_used_today')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Then update with incremented value
    const { error } = await supabase
      .from('profiles')
      .update({
        ai_queries_used_today: (currentData.ai_queries_used_today || 0) + 1
      })
      .eq('id', userId);

    if (error) throw error;
  }
}
