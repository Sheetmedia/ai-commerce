'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import Link from 'next/link';
import { Plus, Search, RefreshCw, TrendingUp, TrendingDown, Minus, Users, Target, AlertTriangle, Zap } from 'lucide-react';

interface Competitor {
  id: string;
  tracked_product_id: string;
  competitor_url: string;
  competitor_name: string;
  competitor_platform: string;
  latest_price: number;
  latest_sales: number;
  latest_rating: number;
  is_active: boolean;
  added_at: string;
  last_checked_at: string;
  product_name?: string;
  your_price?: number;
  your_sales?: number;
  price_diff?: number;
  sales_diff?: number;
}

export default function CompetitorsPage() {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const fetchCompetitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/competitors?userId=${user?.id}`);
      const data = await response.json();

      if (data.success) {
        setCompetitors(data.data);
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCompetitors();
    setRefreshing(false);
  }, [fetchCompetitors]);

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.competitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competitor.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || competitor.competitor_platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const handleDeleteCompetitor = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa competitor này?')) return;

    try {
      const response = await fetch(`/api/competitors/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCompetitors(competitors.filter(c => c.id !== id));
      } else {
        console.error('Failed to delete competitor');
      }
    } catch (error) {
      console.error('Error deleting competitor:', error);
    }
  };

  const getPriceStatus = (priceDiff: number) => {
    if (priceDiff > 0) return { status: 'higher', color: 'text-red-600', icon: TrendingUp };
    if (priceDiff < 0) return { status: 'lower', color: 'text-green-600', icon: TrendingDown };
    return { status: 'same', color: 'text-gray-600', icon: Minus };
  };

  const getSalesStatus = (salesDiff: number) => {
    if (salesDiff > 0) return { status: 'higher', color: 'text-red-600', icon: TrendingUp };
    if (salesDiff < 0) return { status: 'lower', color: 'text-green-600', icon: TrendingDown };
    return { status: 'same', color: 'text-gray-600', icon: Minus };
  };

  useEffect(() => {
    if (user) {
      fetchCompetitors();
    }
  }, [user, fetchCompetitors]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải competitors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Competitor Spy</h1>
              <p className="text-gray-600 mt-1">
                Monitor {filteredCompetitors.length} competitors real-time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <Link
                href="/dashboard/products"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Competitor
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm competitor hoặc sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">Tất cả platforms</option>
              <option value="tiktok">TikTok Shop</option>
              <option value="shopee">Shopee</option>
              <option value="lazada">Lazada</option>
              <option value="tiki">Tiki</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Competitors</p>
                <p className="text-2xl font-bold text-gray-900">{competitors.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Price Advantages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competitors.filter(c => c.price_diff && c.price_diff < 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Price Threats</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competitors.filter(c => c.price_diff && c.price_diff > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Monitoring</p>
                <p className="text-2xl font-bold text-gray-900">
                  {competitors.filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Competitors Grid */}
        {filteredCompetitors.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có competitor nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bắt đầu bằng cách thêm competitor từ trang sản phẩm của bạn
            </p>
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Thêm Competitor
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitors.map((competitor) => {
              const priceStatus = competitor.price_diff ? getPriceStatus(competitor.price_diff) : null;
              const salesStatus = competitor.sales_diff ? getSalesStatus(competitor.sales_diff) : null;
              const PriceIcon = priceStatus?.icon || Minus;
              const SalesIcon = salesStatus?.icon || Minus;

              return (
                <div key={competitor.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{competitor.competitor_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{competitor.product_name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          competitor.competitor_platform === 'tiktok' ? 'bg-pink-100 text-pink-700' :
                          competitor.competitor_platform === 'shopee' ? 'bg-orange-100 text-orange-700' :
                          competitor.competitor_platform === 'lazada' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {competitor.competitor_platform}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          competitor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {competitor.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCompetitor(competitor.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Price Comparison */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Giá:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{competitor.latest_price?.toLocaleString()}đ</span>
                        {priceStatus && (
                          <div className={`flex items-center gap-1 ${priceStatus.color}`}>
                            <PriceIcon className="w-4 h-4" />
                            <span className="text-xs">
                              {priceStatus.status === 'higher' ? '+' : priceStatus.status === 'lower' ? '' : ''}
                              {Math.abs(competitor.price_diff!)}đ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sales Comparison */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sales:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{competitor.latest_sales?.toLocaleString()}</span>
                        {salesStatus && (
                          <div className={`flex items-center gap-1 ${salesStatus.color}`}>
                            <SalesIcon className="w-4 h-4" />
                            <span className="text-xs">
                              {salesStatus.status === 'higher' ? '+' : salesStatus.status === 'lower' ? '' : ''}
                              {Math.abs(competitor.sales_diff!)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="font-semibold">{competitor.latest_rating}/5</span>
                    </div>

                    {/* Last Updated */}
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Cập nhật: {new Date(competitor.last_checked_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
