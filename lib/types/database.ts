export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  plan: 'free' | 'pro' | 'enterprise';
  products_limit: number;
  ai_queries_limit: number;
  ai_queries_used_today: number;
  created_at: string;
};

export type TrackedProduct = {
  id: string;
  user_id: string;
  platform: 'shopee' | 'lazada' | 'tiktok' | 'tiki';
  product_id: string;
  product_url: string;
  product_name: string;
  current_price?: number;
  current_sales?: number;
  current_rating?: number;
  is_active: boolean;
  created_at: string;
  last_scraped_at?: string;
};

export type AIInsight = {
  id: string;
  user_id: string;
  tracked_product_id: string;
  insight_type: 'opportunity' | 'warning' | 'trend' | 'action';
  title: string;
  description: string;
  confidence_score: number;
  priority: 'high' | 'medium' | 'low';
  is_read: boolean;
  created_at: string;
  action_items?: any[];
};

export type ProductSnapshot = {
  id: number;
  tracked_product_id: string;
  price: number;
  sales_count: number;
  rating: number;
  snapshot_date: string;
};