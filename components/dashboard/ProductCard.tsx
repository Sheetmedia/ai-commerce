import Link from 'next/link';
import { TrendingUp, TrendingDown, MoreVertical, ExternalLink, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
  product: {
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
  };
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function ProductCard({ product, onDelete, onEdit }: ProductCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const platformConfig = {
    tiktok: {
      name: 'TikTok Shop',
      color: 'bg-black',
      textColor: 'text-white',
      icon: '🎵'
    },
    shopee: {
      name: 'Shopee',
      color: 'bg-orange-500',
      textColor: 'text-white',
      icon: '🛍️'
    },
    lazada: {
      name: 'Lazada',
      color: 'bg-blue-600',
      textColor: 'text-white',
      icon: '🏪'
    },
    tiki: {
      name: 'Tiki',
      color: 'bg-blue-500',
      textColor: 'text-white',
      icon: '📦'
    }
  };

  const config = platformConfig[product.platform];
  const priceChange = parseFloat(product.stats?.priceChange || '0');
  const salesChange = parseFloat(product.stats?.salesChange || '0');

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">

      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${config.color} ${config.textColor} flex items-center gap-1`}>
                <span>{config.icon}</span>
                {config.name}
              </span>
              {!product.is_active && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                  Paused
                </span>
              )}
              {product.category && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {product.category}
                </span>
              )}
            </div>

            <Link href={`/dashboard/products/${product.id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2 cursor-pointer">
                {product.product_name}
              </h3>
            </Link>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                >
                  Xem trên {config.name}
                </a>
              </span>
              {product.last_scraped_at && (
                <span>
                  Cập nhật: {new Date(product.last_scraped_at).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                  <Link
                    href={`/dashboard/products/${product.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Chi tiết
                  </Link>
                  <button
                    onClick={() => {
                      onEdit?.(product.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Chỉnh sửa
                  </button>
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Mở link gốc
                  </a>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onDelete?.(product.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 p-5 bg-gray-50">

        {/* Price */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Giá</div>
          <div className="flex items-baseline gap-1">
            <div className="font-bold text-gray-900">
              {(product.current_price / 1000).toFixed(0)}K
            </div>
            {priceChange !== 0 && (
              <div className={`flex items-center text-xs font-medium ${
                priceChange > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {priceChange > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(priceChange).toFixed(1)}%
              </div>
            )}
          </div>
        </div>

        {/* Sales */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Đã bán</div>
          <div className="flex items-baseline gap-1">
            <div className="font-bold text-gray-900">
              {product.current_sales >= 1000
                ? `${(product.current_sales / 1000).toFixed(1)}K`
                : product.current_sales}
            </div>
            {salesChange !== 0 && (
              <div className={`flex items-center text-xs font-medium ${
                salesChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {salesChange > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(salesChange).toFixed(0)}%
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Rating</div>
          <div className="font-bold text-gray-900 flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            {product.current_rating?.toFixed(1) || 'N/A'}
          </div>
          {product.current_reviews > 0 && (
            <div className="text-xs text-gray-500">
              ({product.current_reviews} reviews)
            </div>
          )}
        </div>

        {/* Performance */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Performance</div>
          <div className="font-bold">
            {getPerformanceScore(product.current_rating, salesChange) >= 80 ? (
              <span className="text-green-600">Tốt 🔥</span>
            ) : getPerformanceScore(product.current_rating, salesChange) >= 50 ? (
              <span className="text-yellow-600">TB 📊</span>
            ) : (
              <span className="text-red-600">Yếu ⚠️</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/products/${product.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Xem chi tiết →
          </Link>
        </div>

        {product.stats && product.stats.totalSnapshots > 0 && (
          <div className="text-xs text-gray-500">
            {product.stats.totalSnapshots} snapshots
          </div>
        )}
      </div>

      {/* Warning if not scraped recently */}
      {product.last_scraped_at &&
       new Date().getTime() - new Date(product.last_scraped_at).getTime() > 24 * 60 * 60 * 1000 && (
        <div className="px-5 py-2 bg-yellow-50 border-t border-yellow-100 flex items-center gap-2 text-xs text-yellow-800">
          <AlertCircle className="w-4 h-4" />
          <span>Data có thể đã cũ. Đang cập nhật...</span>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate performance score
function getPerformanceScore(rating: number, salesChange: number): number {
  const ratingScore = (rating / 5) * 50;
  const salesScore = Math.min(Math.max(salesChange + 50, 0), 50);
  return ratingScore + salesScore;
}
