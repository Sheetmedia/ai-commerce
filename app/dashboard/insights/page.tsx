'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { Lightbulb, TrendingUp, AlertCircle, Target, Zap, Filter, Search, CheckCircle, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface AIInsight {
  id: string;
  tracked_product_id: string;
  insight_type: 'opportunity' | 'warning' | 'trend' | 'action' | 'recommendation';
  title: string;
  description: string;
  confidence_score: number;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'dismissed' | 'actioned';
  is_read: boolean;
  is_starred: boolean;
  action_items?: any[];
  created_at: string;
  product?: {
    id: string;
    product_name: string;
    platform: string;
  };
}

export default function InsightsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insights');
      const data = await response.json();

      if (data.success) {
        setInsights(data.data);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...insights];

    if (selectedType !== 'all') {
      filtered = filtered.filter(i => i.insight_type === selectedType);
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(i => i.priority === selectedPriority);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(i => i.status === selectedStatus);
    }

    if (showUnreadOnly) {
      filtered = filtered.filter(i => !i.is_read);
    }

    if (searchQuery) {
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort: Starred first, then by priority, then by date
    filtered.sort((a, b) => {
      if (a.is_starred !== b.is_starred) return a.is_starred ? -1 : 1;

      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setFilteredInsights(filtered);
  }, [insights, selectedType, selectedPriority, selectedStatus, searchQuery, showUnreadOnly]);

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, fetchInsights]);

  useEffect(() => {
    applyFilters();
  }, [insights, selectedType, selectedPriority, selectedStatus, searchQuery, showUnreadOnly, applyFilters]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true })
      });
      
      setInsights(insights.map(i => 
        i.id === id ? { ...i, is_read: true } : i
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' })
      });
      
      setInsights(insights.map(i => 
        i.id === id ? { ...i, status: 'dismissed' } : i
      ));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const handleToggleStar = async (id: string, currentValue: boolean) => {
    try {
      await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_starred: !currentValue })
      });
      
      setInsights(insights.map(i => 
        i.id === id ? { ...i, is_starred: !currentValue } : i
      ));
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const insightTypeConfig = {
    opportunity: { 
      icon: Target, 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-500',
      badge: 'bg-green-100 text-green-800'
    },
    warning: { 
      icon: AlertCircle, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-500',
      badge: 'bg-orange-100 text-orange-800'
    },
    trend: { 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-500',
      badge: 'bg-blue-100 text-blue-800'
    },
    action: { 
      icon: Zap, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      border: 'border-purple-500',
      badge: 'bg-purple-100 text-purple-800'
    },
    recommendation: { 
      icon: Lightbulb, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-500',
      badge: 'bg-yellow-100 text-yellow-800'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải insights...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: insights.length,
    unread: insights.filter(i => !i.is_read).length,
    highPriority: insights.filter(i => i.priority === 'high' && i.status === 'active').length,
    starred: insights.filter(i => i.is_starred).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="w-7 h-7 text-yellow-500" />
                AI Insights
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredInsights.length} insights đang chờ xử lý
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Tổng insights</div>
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-sm text-orange-700 mb-1">Chưa đọc</div>
              <div className="text-2xl font-bold text-orange-900">{stats.unread}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-red-700 mb-1">Ưu tiên cao</div>
              <div className="text-2xl font-bold text-red-900">{stats.highPriority}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-sm text-yellow-700 mb-1">Đã đánh dấu</div>
              <div className="text-2xl font-bold text-yellow-900">{stats.starred}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">Tất cả loại</option>
              <option value="opportunity">Opportunities</option>
              <option value="warning">Warnings</option>
              <option value="trend">Trends</option>
              <option value="action">Actions</option>
              <option value="recommendation">Recommendations</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="all">Tất cả status</option>
              <option value="active">Active</option>
              <option value="actioned">Actioned</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Chưa đọc</span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredInsights.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không có insights
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedType !== 'all' || selectedPriority !== 'all'
                ? 'Thử điều chỉnh bộ lọc'
                : 'Thêm sản phẩm để nhận AI insights'}
            </p>
            {!searchQuery && selectedType === 'all' && (
              <Link
                href="/products/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm sản phẩm
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => {
              const config = insightTypeConfig[insight.insight_type];
              const Icon = config.icon;

              return (
                <div
                  key={insight.id}
                  className={`bg-white rounded-xl border-l-4 ${config.border} shadow-sm hover:shadow-md transition-all ${
                    !insight.is_read ? 'ring-2 ring-blue-100' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${config.bg}`}>
                          <Icon className={`w-6 h-6 ${config.color}`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 text-lg">{insight.title}</h3>
                            {!insight.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 mb-3">{insight.description}</p>
                          
                          <div className="flex items-center gap-3 text-sm">
                            <span className={`px-2 py-1 rounded ${config.badge}`}>
                              {insight.insight_type}
                            </span>
                            <span className={`px-2 py-1 rounded ${
                              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {insight.priority.toUpperCase()}
                            </span>
                            <span className="text-gray-500">
                              {Math.round(insight.confidence_score * 100)}% confident
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">
                              {new Date(insight.created_at).toLocaleDateString('vi-VN')}
                            </span>
                            {insight.product && (
                              <>
                                <span className="text-gray-400">•</span>
                                <Link
                                  href={`/products/${insight.tracked_product_id}`}
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  {insight.product.product_name.substring(0, 30)}...
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStar(insight.id, insight.is_starred)}
                          className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                            insight.is_starred ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                        >
                          <span className="text-xl">{insight.is_starred ? '⭐' : '☆'}</span>
                        </button>
                        {!insight.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(insight.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                            title="Đánh dấu đã đọc"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {insight.status === 'active' && (
                          <button
                            onClick={() => handleDismiss(insight.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                            title="Dismiss"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Items */}
                    {insight.action_items && insight.action_items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                          💡 Hành động đề xuất:
                        </p>
                        <div className="space-y-2">
                          {insight.action_items.map((action: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-sm">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                action.priority === 'high' ? 'bg-red-100 text-red-700' :
                                action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {action.priority}
                              </span>
                              <span className="text-gray-700 flex-1">{action.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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