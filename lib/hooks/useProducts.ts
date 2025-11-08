import { useState, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/lib/hooks/use-toast';

export interface TrackedProduct {
  id: string;
  name: string;
  platform: 'tiktok' | 'shopee' | 'lazada' | 'tiki';
  url: string;
  current_price: number;
  current_sales: number;
  current_rating: number;
  current_reviews: number;
  last_updated: string;
  created_at: string;
  user_id: string;
  is_active: boolean;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalValue: number;
  averageRating: number;
  totalSales: number;
  priceChanges: number;
  salesChanges: number;
}

export interface UseProductsReturn {
  products: TrackedProduct[];
  stats: ProductStats;
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (productData: Omit<TrackedProduct, 'id' | 'created_at' | 'last_updated' | 'user_id'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<TrackedProduct>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  scrapeProduct: (url: string, platform: string) => Promise<any>;
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalValue: 0,
    averageRating: 0,
    totalSales: 0,
    priceChanges: 0,
    salesChanges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('tracked_products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProducts(data || []);
      calculateStats(data || []);

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Lỗi tải sản phẩm',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  // Calculate statistics
  const calculateStats = useCallback((productList: TrackedProduct[]) => {
    const totalProducts = productList.length;
    const activeProducts = productList.filter(p => p.is_active).length;
    const totalValue = productList.reduce((sum, p) => sum + p.current_price, 0);
    const totalSales = productList.reduce((sum, p) => sum + p.current_sales, 0);
    const averageRating = totalProducts > 0
      ? productList.reduce((sum, p) => sum + p.current_rating, 0) / totalProducts
      : 0;

    // Mock price and sales changes (in real app, compare with historical data)
    const priceChanges = Math.floor(Math.random() * 20) - 10; // -10% to +10%
    const salesChanges = Math.floor(Math.random() * 30) - 15; // -15% to +15%

    setStats({
      totalProducts,
      activeProducts,
      totalValue,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalSales,
      priceChanges,
      salesChanges,
    });
  }, []);

  // Add new product
  const addProduct = useCallback(async (productData: Omit<TrackedProduct, 'id' | 'created_at' | 'last_updated' | 'user_id'>): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('tracked_products')
        .insert({
          ...productData,
          user_id: session.user.id,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProducts(prev => [data, ...prev]);
      calculateStats([data, ...products]);

      toast({
        title: 'Thêm sản phẩm thành công',
        description: `${productData.name} đã được thêm vào danh sách theo dõi`,
      });

      return true;

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Lỗi thêm sản phẩm',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [supabase, products, calculateStats, toast]);

  // Update product
  const updateProduct = useCallback(async (id: string, updates: Partial<TrackedProduct>): Promise<boolean> => {
    try {
      const { data, error: updateError } = await supabase
        .from('tracked_products')
        .update({
          ...updates,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setProducts(prev => prev.map(p => p.id === id ? data : p));

      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin sản phẩm đã được cập nhật',
      });

      return true;

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Lỗi cập nhật',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [supabase, toast]);

  // Delete product
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('tracked_products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setProducts(prev => prev.filter(p => p.id !== id));
      calculateStats(products.filter(p => p.id !== id));

      toast({
        title: 'Xóa thành công',
        description: 'Sản phẩm đã được xóa khỏi danh sách theo dõi',
      });

      return true;

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Lỗi xóa sản phẩm',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [supabase, products, calculateStats, toast]);

  // Scrape product data
  const scrapeProduct = useCallback(async (url: string, platform: string): Promise<any> => {
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, platform }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape product');
      }

      const data = await response.json();
      return data.data;

    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Lỗi scraping',
        description: 'Không thể lấy thông tin sản phẩm từ URL',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // Refresh products
  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    stats,
    loading,
    error,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    scrapeProduct,
  };
}

export default useProducts;
