import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
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
    
    return {
      aiQueriesRemaining: data.ai_queries_limit - data.ai_queries_used_today,
      productsRemaining: data.products_limit - (productCount || 0),
      canAddProduct: (productCount || 0) < data.products_limit,
      canMakeAIQuery: data.ai_queries_used_today < data.ai_queries_limit
    };
  }
  
  // Increment AI query usage
  static async incrementAIUsage(userId: string) {
    const { error } = await supabaseAdmin
      .