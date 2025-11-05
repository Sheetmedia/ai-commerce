'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers/AuthProvider';
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<'tiktok' | 'shopee' | 'lazada' | 'tiki'>('tiktok');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'scraping' | 'analyzing' | 'done'>('input');
  const [productData, setProductData] = useState<any>(null);

  const platformExamples = {
    tiktok: 'https://shop.tiktok.com/view/product/1234567890123456789',
    shopee: 'https://shopee.vn/product-name-i.123.9876543210',
    lazada: 'https://www.lazada.vn/products/product-name-i123456789.html',
    tiki: 'https://tiki.vn/product-name-p12345678.html'
  };

  const detectPlatform = (inputUrl: string) => {
    if (inputUrl.includes('tiktok.com')) return 'tiktok';
    if (inputUrl.includes('shopee.vn')) return 'shopee';
    if (inputUrl.includes('lazada.vn')) return 'lazada';
    if (inputUrl.includes('tiki.vn')) return 'tiki';
    return null;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const detected = detectPlatform(value);
    if (detected) {
      setPlatform(detected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Scraping
      setStep('scraping');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, productData: { product_url: url, platform, product_id: 'temp_' + Date.now(), product_name: 'Loading...' } })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      setProductData(data.data);

      // Step 2: AI Analysis
      setStep('analyzing');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing

      // Step 3: Done
      setStep('done');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/products/${data.data.id}`);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return detectPlatform(urlString) !== null;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại Products
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
          <p className="text-gray-600 mt-1">
            Nhập URL sản phẩm để bắt đầu tracking và nhận AI insights
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Progress Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            {[
              { id: 'input', label: 'Nhập URL', icon: '🔗' },
              { id: 'scraping', label: 'Thu thập data', icon: '🕷️' },
              { id: 'analyzing', label: 'AI phân tích', icon: '🤖' },
              { id: 'done', label: 'Hoàn thành', icon: '✅' }
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 transition-all ${
                    step === s.id ? 'bg-blue-600 text-white scale-110' :
                    ['scraping', 'analyzing', 'done'].indexOf(step) > ['scraping', 'analyzing', 'done'].indexOf(s.id as any)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s.icon}
                  </div>
                  <span className={`text-sm font-medium ${
                    step === s.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-1 w-24 mx-4 rounded-full transition-all ${
                    ['scraping', 'analyzing', 'done'].indexOf(step) > idx
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn platform
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {(['tiktok', 'shopee', 'lazada', 'tiki'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        platform === p
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {p === 'tiktok' ? '🎵' : p === 'shopee' ? '🛍️' : p === 'lazada' ? '🏪' : '📦'}
                      </div>
                      <div className={`text-sm font-medium ${
                        platform === p ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL sản phẩm
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder={platformExamples[platform]}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Ví dụ: {platformExamples[platform]}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Lỗi</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Sau khi thêm, bạn sẽ nhận được:
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Tracking giá và sales tự động</li>
                      <li>• AI insights và recommendations</li>
                      <li>• So sánh với competitors</li>
                      <li>• Alerts khi có thay đổi quan trọng</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !isValidUrl(url)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Thêm sản phẩm
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'scraping' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-3xl">🕷️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Đang thu thập dữ liệu...
              </h3>
              <p className="text-gray-600 mb-6">
                Đang crawl thông tin sản phẩm từ {platform}
              </p>
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

          {step === 'analyzing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI đang phân tích...
              </h3>
              <p className="text-gray-600 mb-6">
                Claude đang tạo insights cho sản phẩm của bạn
              </p>
              <div className="max-w-md mx-auto space-y-2 text-left">
                {[
                  'Phân tích giá cả...',
                  'So sánh với competitors...',
                  'Dự đoán trends...',
                  'Tạo recommendations...'
                ].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'done' && productData && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Thành công! 🎉
              </h3>
              <p className="text-gray-600 mb-6">
                Sản phẩm đã được thêm và AI đang phân tích
              </p>

              {/* Product Preview */}
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 line-clamp-2">
                  {productData.product_name}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block mb-1">Giá</span>
                    <span className="font-bold">{(productData.current_price / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Sales</span>
                    <span className="font-bold">{productData.current_sales}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Rating</span>
                    <span className="font-bold">⭐ {productData.current_rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Đang chuyển hướng đến trang chi tiết...
              </p>
            </div>
          )}
        </div>

        {/* Tips */}
        {step === 'input' && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              💡 Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Copy toàn bộ URL từ thanh địa chỉ của browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>URL phải là link đến trang sản phẩm cụ thể, không phải trang shop</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Sản phẩm public, không cần login mới xem được</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Free tier: Track tối đa 5 sản phẩm. Upgrade Pro để track 50+</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
