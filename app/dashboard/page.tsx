'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { DatabaseHelpers } from '@/lib/db/helpers';
import { TrackedProduct } from '@/lib/types/database';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  DollarSign,
  Star,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  Plus,
  ArrowRight
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalProducts: number;
  unreadInsights: number;
  aiQueriesUsed: number;
}

interface Product {
  id: string;
  product_name: string;
  platform: string;
  current_price?: number;
  current_sales?: number;
  current_rating?: number;
  stats?: {
    priceChange: string;
    salesChange: string;
  };
}

interface AIInsight {
  id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: string;
  confidence_score: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping dashboard data fetch');
      return;
    }

    try {
      setLoading(true);

      // Fetch stats
      const statsData = await DatabaseHelpers.getDashboardStats(user.id);
      setStats(statsData);

      // Fetch recent products (top 3)
      const productsData = await DatabaseHelpers.getUserProducts(user.id);
      setProducts(productsData.slice(0, 3));

      // Fetch recent insights (top 3)
      const insightsUrl = `/api/insights?limit=3&userId=${user.id}`;
      console.log('Fetching insights from:', insightsUrl);
      const response = await fetch(insightsUrl);
      const insightsData = await response.json();
      setInsights(insightsData.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Redirect if not authenticated
  if (!user && !authLoading) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Xin chào, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Đây là tổng quan về products của bạn
              </p>
            </div>
            <Link
              href="/dashboard/products/add"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Thêm sản phẩm
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<ShoppingCart className="w-6 h-6" />}
            label="Products Tracking"
            value={stats?.totalProducts || 0}
            change={null}
            color="blue"
          />
          <StatCard
            icon={<Lightbulb className="w-6 h-6" />}
            label="AI Insights Mới"
            value={stats?.unreadInsights || 0}
            change={null}
            color="yellow"
          />
          <StatCard
            icon={<Eye className="w-6 h-6" />}
            label="AI Queries Hôm Nay"
            value={`${stats?.aiQueriesUsed || 0}/500`}
            change={null}
            color="purple"
          />
          <StatCard
            icon={<Star className="w-6 h-6" />}
            label="Avg Rating"
            value="4.6"
            change={+0.2}
            color="green"
          />
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            disabled={loading}
          >
            <Eye className="w-4 h-4" />
            {loading ? 'Đang tải...' : 'Refresh Data'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Bắt đầu nhanh</h2>
              <p className="text-blue-100">Thêm sản phẩm đầu tiên để nhận AI insights</p>
            </div>
            <Link
              href="/dashboard/products/add"
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Thêm ngay →
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column - Products & Insights */}
          <div className="lg:col-span-2 space-y-8">

            {/* Recent Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Sản phẩm gần đây
                </h2>
                <Link
                  href="/dashboard/products"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Chưa có sản phẩm nào</p>
                  <Link
                    href="/dashboard/products/add"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Thêm sản phẩm đầu tiên
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-yellow-500" />
                  AI Insights
                </h2>
                <Link
                  href="/dashboard/insights"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {insights.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Chưa có insights nào</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Thêm sản phẩm để AI phân tích cho bạn
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Stats & Tips */}
          <div className="space-y-8">

            {/* Performance Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Performance Tuần Này
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Sales</span>
                  <span className="font-bold text-gray-900">2,547</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-bold text-gray-900">45.2M đ</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Conversion</span>
                  <span className="font-bold text-green-600">+12.5%</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                💡 Pro Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Check insights hàng ngày để không bỏ lỡ cơ hội</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Set alerts cho competitors để phản ứng nhanh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>Bật Auto-Pilot để AI tự động optimize</span>
                </li>
              </ul>
            </div>

            {/* Upgrade CTA */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Nâng cấp lên Pro</h3>
              <p className="text-sm text-purple-100 mb-4">
                Unlock thêm 45 products, unlimited AI queries, và Auto-Pilot mode
              </p>
              <Link
                href="/pricing"
                className="block text-center py-2 px-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Xem gói Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, change, color }: { icon: React.ReactNode; label: string; value: any; change: number | null; color: 'blue' | 'green' | 'yellow' | 'purple' }) {
  const colorClasses: Record<'blue' | 'green' | 'yellow' | 'purple', string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        {change !== null && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const platformColors = {
    tiktok: 'bg-black text-white',
    shopee: 'bg-orange-500 text-white',
    lazada: 'bg-blue-600 text-white',
    tiki: 'bg-blue-500 text-white'
  };

  return (
    <Link href={`/dashboard/products/${product.id}`} className="block">
      <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded ${platformColors[product.platform as keyof typeof platformColors]}`}>
                {product.platform.toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {product.product_name}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600 block mb-1">Price</span>
            <span className="font-semibold text-gray-900">
              {product.current_price?.toLocaleString()}đ
            </span>
            {product.stats && parseFloat(product.stats.priceChange) !== 0 && (
              <span className={`text-xs ml-1 ${parseFloat(product.stats.priceChange) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {product.stats.priceChange}%
              </span>
            )}
          </div>
          <div>
            <span className="text-gray-600 block mb-1">Sales</span>
            <span className="font-semibold text-gray-900">{product.current_sales}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-1">Rating</span>
            <span className="font-semibold text-gray-900">⭐ {product.current_rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Insight Card Component
function InsightCard({ insight }: { insight: AIInsight }) {
  const typeConfig = {
    opportunity: { icon: '🎯', color: 'border-green-500 bg-green-50', badge: 'bg-green-100 text-green-800' },
    warning: { icon: '⚠️', color: 'border-orange-500 bg-orange-50', badge: 'bg-orange-100 text-orange-800' },
    trend: { icon: '📈', color: 'border-blue-500 bg-blue-50', badge: 'bg-blue-100 text-blue-800' },
    action: { icon: '⚡', color: 'border-purple-500 bg-purple-50', badge: 'bg-purple-100 text-purple-800' },
    recommendation: { icon: '💡', color: 'border-yellow-500 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800' }
  };

  const config = typeConfig[insight.insight_type as keyof typeof typeConfig];

  return (
    <div className={`p-4 rounded-lg border-l-4 ${config.color}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.icon}</span>
          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${config.badge}`}>
          {Math.round(insight.confidence_score * 100)}%
        </span>
      </div>
      <p className="text-sm text-gray-700 line-clamp-2">{insight.description}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className={`text-xs px-2 py-1 rounded ${
          insight.priority === 'high' ? 'bg-red-100 text-red-800' :
          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {insight.priority.toUpperCase()}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(insight.created_at).toLocaleDateString('vi-VN')}
        </span>
      </div>
    </div>
  );
}
