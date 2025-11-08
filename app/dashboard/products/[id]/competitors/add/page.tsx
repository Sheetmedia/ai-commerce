'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ArrowLeft, Plus, ExternalLink, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Product {
  id: string;
  product_name: string;
  platform: string;
  product_url: string;
}

export default function AddCompetitorPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    competitorUrl: '',
    competitorName: '',
    competitorPlatform: 'shopee'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const foundProduct = data.data.find((p: Product) => p.id === id);
            if (foundProduct) {
              setProduct(foundProduct);
              // Auto-detect platform from URL if possible
              if (foundProduct.product_url.includes('tiktok')) {
                setFormData(prev => ({ ...prev, competitorPlatform: 'tiktok' }));
              } else if (foundProduct.product_url.includes('lazada')) {
                setFormData(prev => ({ ...prev, competitorPlatform: 'lazada' }));
              } else if (foundProduct.product_url.includes('tiki')) {
                setFormData(prev => ({ ...prev, competitorPlatform: 'tiki' }));
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchProduct();
    }
  }, [user, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          trackedProductId: id,
          competitorUrl: formData.competitorUrl,
          competitorName: formData.competitorName,
          competitorPlatform: formData.competitorPlatform
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/competitors');
      } else {
        setError(data.error || 'Failed to add competitor');
      }
    } catch (error) {
      console.error('Error adding competitor:', error);
      setError('Failed to add competitor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, competitorUrl: url }));

    // Auto-detect platform from URL
    if (url.includes('tiktok.com') || url.includes('tiktokshop.com')) {
      setFormData(prev => ({ ...prev, competitorPlatform: 'tiktok' }));
    } else if (url.includes('lazada.vn')) {
      setFormData(prev => ({ ...prev, competitorPlatform: 'lazada' }));
    } else if (url.includes('tiki.vn')) {
      setFormData(prev => ({ ...prev, competitorPlatform: 'tiki' }));
    } else if (url.includes('shopee.vn')) {
      setFormData(prev => ({ ...prev, competitorPlatform: 'shopee' }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/dashboard/products/${id}`}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Competitor</h1>
              <p className="text-gray-600 mt-1">
                Monitor competitor for: <span className="font-medium">{product.product_name}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8">

          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Competitor URL */}
            <div>
              <label htmlFor="competitorUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Competitor Product URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="competitorUrl"
                required
                value={formData.competitorUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://shopee.vn/product/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                Paste the full URL of the competitor product you want to monitor
              </p>
            </div>

            {/* Platform */}
            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                Platform <span className="text-red-500">*</span>
              </label>
              <select
                id="platform"
                value={formData.competitorPlatform}
                onChange={(e) => setFormData(prev => ({ ...prev, competitorPlatform: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="shopee">Shopee</option>
                <option value="lazada">Lazada</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="tiki">Tiki</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Platform will be auto-detected from URL, but you can change it manually
              </p>
            </div>

            {/* Competitor Name */}
            <div>
              <label htmlFor="competitorName" className="block text-sm font-medium text-gray-700 mb-2">
                Competitor Name (Optional)
              </label>
              <input
                type="text"
                id="competitorName"
                value={formData.competitorName}
                onChange={(e) => setFormData(prev => ({ ...prev, competitorName: e.target.value }))}
                placeholder="e.g., Brand X Official Store"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave blank to auto-detect from the product page
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding Competitor...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Competitor
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• We'll scrape the competitor's product data automatically</li>
              <li>• Data is updated every few hours to keep you informed</li>
              <li>• Compare prices, sales, and ratings in real-time</li>
              <li>• Get AI insights on competitive positioning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
