'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic'
import { Zap, TrendingUp, Target, Brain, Clock, DollarSign, CheckCircle, ArrowRight, Star, Sparkles, BarChart3, Shield, ChevronDown } from 'lucide-react';

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Co-Pilot",
    description: "AI tự động phân tích và đưa ra hành động cụ thể, không chỉ báo cáo khô khan",
    badge: "Độc quyền"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Auto-Pilot Mode",
    description: "Bật và quên đi. AI tự động optimize giá, description, quảng cáo 24/7",
    badge: "Tự động"
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Predictive Analytics",
    description: "Dự đoán trend 30 ngày tới với độ chính xác 85%+",
    badge: "Thông minh"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Competitor Spy",
    description: "Monitor đối thủ real-time: giá, sales, marketing tactics",
    badge: "Real-time"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "5 Giây Insights",
    description: "Báo cáo chi tiết trong 5 giây thay vì 5 ngày",
    badge: "Nhanh gấp 1000x"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Multi-Platform",
    description: "TikTok Shop, Shopee, Lazada, Tiki tất cả trong 1 dashboard",
    badge: "Toàn diện"
  }
];

const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    role: "Owner, Beauty Store",
    avatar: "👩",
    text: "Doanh thu tăng 43% sau 2 tháng dùng AI Commerce. Auto-Pilot mode giúp tôi tiết kiệm 20 giờ/tuần!",
    rating: 5
  },
  {
    name: "Trần Văn Hùng",
    role: "Fashion Brand",
    avatar: "👨",
    text: "Từng dùng Metric.vn nhưng chuyển sang đây vì rẻ hơn 70% mà insights thực chiến hơn nhiều.",
    rating: 5
  },
  {
    name: "Lê Thị Mai",
    role: "Electronics Seller",
    avatar: "👩",
    text: "AI suggest tôi adjust giá 1 sản phẩm, sales tăng gấp đôi tuần sau. Crazy accurate!",
    rating: 5
  }
];

const pricing = [
  {
    name: "Free",
    price: "0đ",
    period: "mãi mãi",
    description: "Để thử nghiệm và làm quen",
    features: [
      "Track 5 sản phẩm",
      "10 competitor checks/ngày",
      "AI insights cơ bản",
      "Community access",
      "Email support"
    ],
    cta: "Bắt đầu miễn phí",
    popular: false
  },
  {
    name: "Pro",
    price: "590K",
    period: "tháng",
    description: "Cho sellers nghiêm túc",
    features: [
      "Track 50 sản phẩm",
      "Unlimited checks",
      "AI Co-Pilot đầy đủ",
      "Auto-Pilot mode",
      "Predictive analytics",
      "API access",
      "Priority support",
      "Custom reports"
    ],
    cta: "Dùng thử 14 ngày",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "liên hệ",
    description: "Cho brands & agencies",
    features: [
      "Tất cả Pro features",
      "Unlimited products",
      "White-label",
      "Custom AI agents",
      "Team collaboration",
      "Dedicated account manager",
      "Custom integration",
      "SLA guarantee"
    ],
    cta: "Liên hệ sales",
    popular: false
  }
];

const comparisonData = [
  { feature: "Giá khởi điểm", metric: "~2-3 triệu/tháng", us: "0đ (Free tier)" },
  { feature: "AI Co-Pilot", metric: "❌", us: "✅" },
  { feature: "Auto-Pilot", metric: "❌", us: "✅" },
  { feature: "Insights", metric: "Manual reports", us: "AI tự động real-time" },
  { feature: "Action items", metric: "Không có", us: "Cụ thể + Auto-execute" },
  { feature: "Learning curve", metric: "2-3 tuần", us: "5 phút" },
  { feature: "Support", metric: "Email only", us: "AI chat 24/7 + Email" },
];

function PricingCard({ plan }: { plan: any }) {
  return (
    <div className={`relative bg-white rounded-2xl p-8 ${plan.popular ? 'ring-2 ring-purple-500 shadow-xl scale-105' : 'shadow-lg'}`}>
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
          Phổ biến nhất
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
          <span className="text-slate-600">/{plan.period}</span>
        </div>
        <p className="text-slate-600 text-sm">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-slate-700 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
        plan.popular
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
      }`}>
        {plan.cta}
      </button>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [language, setLanguage] = useState('vi');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">AI Commerce</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 relative">
            <div className="relative">
              <button
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
                className="text-gray-600 hover:text-purple-600 transition-colors flex items-center space-x-1"
              >
                <span>Features</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isMegaMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-50"
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                  onMouseLeave={() => setIsMegaMenuOpen(false)}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Analytics</h4>
                      <ul className="space-y-2">
                        <li><a href="#ai-co-pilot" className="text-gray-600 hover:text-purple-600 text-sm">AI CoPilot</a></li>
                        <li><a href="#predictive" className="text-gray-600 hover:text-purple-600 text-sm">Predictive Analytics</a></li>
                        <li><a href="#competitor" className="text-gray-600 hover:text-purple-600 text-sm">Competitor Spy</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Automation</h4>
                      <ul className="space-y-2">
                        <li><a href="#auto-pilot" className="text-gray-600 hover:text-purple-600 text-sm">Auto-Pilot Mode</a></li>
                        <li><a href="#5s-insights" className="text-gray-600 hover:text-purple-600 text-sm">5 Giây Insights</a></li>
                        <li><a href="#multi-platform" className="text-gray-600 hover:text-purple-600 text-sm">Multi-Platform</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">Testimonials</a>
            <a href="/api/test-db" className="text-gray-600 hover:text-purple-600 transition-colors">API Test</a>
          </nav>
          <div className="flex items-center space-x-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-gray-600 border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="vi">VN</option>
              <option value="en">EN</option>
            </select>
            <a href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors">Đăng nhập</a>
            <a href="/auth/register" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
              Bắt đầu
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Cạnh tranh thông minh với Metric.vn
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              AI Marketing Thông Minh
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Hơn 10X</span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Không chỉ là data. AI tự động phân tích, dự đoán và <strong>thực hiện</strong> để tăng doanh số của bạn.
              Dùng thử miễn phí, không cần thẻ tín dụng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <input
                type="email"
                placeholder="Email của bạn..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-6 py-4 rounded-lg border-2 border-slate-200 focus:border-purple-500 focus:outline-none text-lg"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                Dùng thử miễn phí <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free 14 ngày</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Không cần thẻ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Setup 5 phút</span>
              </div>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-slate-600 mb-2">Được tin dùng bởi</p>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
                <span className="text-slate-900 font-bold ml-2">5.0</span>
                <span className="text-slate-600">(127 reviews)</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">1,247+</p>
                <p className="text-slate-600 text-sm">Sellers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">$4.3M</p>
                <p className="text-slate-600 text-sm">Revenue tracked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">38%</p>
                <p className="text-slate-600 text-sm">Avg growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Tại Sao Chọn AI Commerce?
            </h2>
            <p className="text-xl text-slate-600">
              Features mà Metric.vn không có (hoặc phải trả thêm tiền)
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              So Sánh Với Metric.vn
            </h2>
            <p className="text-xl text-slate-600">
              Giá rẻ hơn, features nhiều hơn, AI thông minh hơn
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-slate-900 font-bold">Feature</th>
                  <th className="px-6 py-4 text-center text-slate-900 font-bold">Metric.vn</th>
                  <th className="px-6 py-4 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                    AI Commerce
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-200">
                    <td className="px-6 py-4 text-slate-900 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{row.metric}</td>
                    <td className="px-6 py-4 text-center text-slate-900 font-semibold bg-purple-50">
                      {row.us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Sellers Nói Gì Về Chúng Tôi
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-600">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Giá Cả Minh Bạch
            </h2>
            <p className="text-xl text-slate-600">
              Không có phí ẩn. Hủy bất cứ lúc nào.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, idx) => (
              <PricingCard key={idx} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sẵn Sàng Tăng Trưởng 10X?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Tham gia 1,247+ sellers đang dùng AI để thống trị thị trường
          </p>
          <button className="bg-white text-purple-600 px-12 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all">
            Bắt Đầu Miễn Phí Ngay
          </button>
          <p className="text-white text-sm mt-4 opacity-75">
            Free 14 ngày • Không cần thẻ • Setup 5 phút
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">AI Commerce</span>
              </div>
              <p className="text-slate-400 text-sm">
                E-commerce analytics powered by AI. Smarter than Metric.vn.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>API</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            © 2025 AI Commerce. Made with AI in Vietnam.
          </div>
        </div>
      </footer>
    </div>
  );
}
