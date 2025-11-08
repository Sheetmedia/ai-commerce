'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, ChevronDown, Zap } from 'lucide-react';

export default function LandingHeader() {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [language, setLanguage] = useState('vi');

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
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
          <Link href="/pricing" className="text-gray-600 hover:text-purple-600 transition-colors">Pricing</Link>
          <Link href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">Testimonials</Link>
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
          <Link href="/auth/login" className="text-gray-600 hover:text-purple-600 transition-colors">Đăng nhập</Link>
          <Link href="/auth/signup" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all">
            Bắt đầu
          </Link>
        </div>
      </div>
    </header>
  );
}
