'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ArrowLeft, ExternalLink, RefreshCw, Edit, Trash2, BarChart3, DollarSign, Users, Star, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase/client';

interface Product {
  id: string;
  product_name: string;
  platform: 'tiktok' | 'shopee' | 'lazada' | 'tiki';
  product_url: string;
  current_price: number;
  current_sales: number;
  current_rating: number;
  current_reviews: number;
  category?: string;
  is_active: boolean;
  last_scraped_at?: string;
  stats?: {
    priceChange: string;
    salesChange: string;
    totalSnapshots: number;
  };
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const fetchProductDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all products and find the one with matching ID
      const response = await fetch(`/api/products?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const foundProduct = data.data.find((p: Product) => p.id === id);
          if (foundProduct) {
            setProduct(foundProduct);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, id]);

  useEffect(() => {
    if (user && id) {
      fetchProductDetails();
    }
  }, [user, id, fetchProductDetails]);

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      // First scrape fresh data
      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: id }),
      });

      if (scrapeResponse.ok) {
        // Then fetch updated details
        await fetchProductDetails();
      } else {
        console.error('Failed to scrape data');
        await fetchProductDetails(); // Still fetch existing data
      }
    } catch (error) {
      console.error('Refresh error:', error);
      await fetchProductDetails(); // Still fetch existing data
    }

    setRefreshing(false);
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/products');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!product) return;

    setAnalyzing(true);
    try {
      // Get the JWT token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('No access token available');
        return;
      }

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          productData: {
            name: product.product_name,
            platform: product.platform,
            price: product.current_price,
            sales: product.current_sales,
            rating: product.current_rating,
            reviews: product.current_reviews,
            category: product.category
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        console.error('AI analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const platformConfig = {
    tiktok: { name: 'TikTok Shop', color: 'bg-pink-500', icon: '🎵' },
    shopee: { name: 'Shopee', color: 'bg-orange-500', icon: '🛒' },
    lazada: { name: 'Lazada', color: 'bg-blue-500', icon: '📦' },
    tiki: { name: 'Tiki', color: 'bg-green-500', icon: '📚' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải chi tiết sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sản phẩm không tìm thấy</h2>
          <p className="text-gray-600 mb-6">Sản phẩm có thể đã bị xóa hoặc không tồn tại.</p>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const config = platformConfig[product.platform];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/products"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">
                  {product.product_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
                    {config.icon} {config.name}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <Link
                href={`/dashboard/products/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-5 h-5" />
                Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Key Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Key Metrics</h2>

              {/* Alert for missing data */}
              {(!product.current_price || !product.current_sales || !product.current_rating) && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Missing Data</AlertTitle>
                  <AlertDescription>
                    Some metrics are not available. Click the Refresh button to fetch the latest data from the platform.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(product.current_price / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Current Price</div>
                  {product.stats?.priceChange && (
                    <div className={`text-xs mt-1 ${
                      product.stats.priceChange.startsWith('+')
                        ? 'text-red-600'
                        : product.stats.priceChange.startsWith('-')
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}>
                      {product.stats.priceChange}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {product.current_sales ? product.current_sales.toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                  {product.stats?.salesChange && (
                    <div className={`text-xs mt-1 ${
                      product.stats.salesChange.startsWith('+')
                        ? 'text-green-600'
                        : product.stats.salesChange.startsWith('-')
                        ? 'text-red-600'
                        : 'text-gray-600'
                    }`}>
                      {product.stats.salesChange}
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-3">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {product.current_rating ? product.current_rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {product.current_reviews} reviews
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {product.stats?.totalSnapshots || 0}
                  </div>
                  <div className="text-sm text-gray-600">Data Points</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {product.last_scraped_at
                      ? new Date(product.last_scraped_at).toLocaleDateString('vi-VN')
                      : 'Never'
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>

              {analysis && (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3">
                      <span className="text-2xl font-bold text-white">{analysis.overall_score}</span>
                    </div>
                    <p className="text-sm text-gray-600">{analysis.summary}</p>
                  </div>

                  {/* Key Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Pricing</h4>
                      <p className="text-sm text-blue-700">{analysis.pricing.reasoning}</p>
                      <div className="mt-2 text-xs text-blue-600">
                        Recommended: {(analysis.pricing.recommended / 1000).toFixed(0)}K VNĐ
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Performance</h4>
                      <p className="text-sm text-green-700">{analysis.performance.reasoning}</p>
                      <div className="mt-2 text-xs text-green-600">
                        Sales: {analysis.performance.sales_score}/100 | Rating: {analysis.performance.rating_score}/100
                      </div>
                    </div>
                  </div>

                  {/* Action Items */}
                  {analysis.action_items && analysis.action_items.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recommended Actions</h4>
                      <div className="space-y-3">
                        {analysis.action_items.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{item.title}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Impact: {item.estimated_impact}</span>
                              <span>Effort: {item.effort}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!analysis && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Get AI-powered insights for this product</p>
                  <p className="text-sm text-gray-500">Analyze pricing, performance, and get actionable recommendations</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Product Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900">{product.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Platform URL</label>
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    View on {config.name}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-sm text-gray-900">
                    {product.last_scraped_at
                      ? new Date(product.last_scraped_at).toLocaleString('vi-VN')
                      : 'Never'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/products/${id}/edit`}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Edit Product</span>
                </Link>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium text-gray-900">Refresh Data</span>
                </button>
                <Link
                  href="/dashboard/insights"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">View Insights</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
