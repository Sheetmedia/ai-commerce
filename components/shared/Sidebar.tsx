'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Lightbulb,
  BarChart3,
  Users,
  Settings,
  Zap,
  TrendingUp,
  Target,
  Bell,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainNavItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Products',
      href: '/products',
      icon: ShoppingBag,
      badge: null
    },
    {
      label: 'Insights',
      href: '/insights',
      icon: Lightbulb,
      badge: { count: 5, color: 'bg-yellow-500' }
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      label: 'Competitors',
      href: '/competitors',
      icon: Users,
      badge: null
    }
  ];

  const secondaryNavItems = [
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      badge: null
    },
    {
      label: 'Billing',
      href: '/settings/billing',
      icon: CreditCard,
      badge: null
    },
    {
      label: 'Help & Support',
      href: '/help',
      icon: HelpCircle,
      badge: null
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">AI Commerce</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-600" />
          )}
        </button>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`flex-shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={`${item.badge.color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
                          {item.badge.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Upgrade Banner */}
          {!collapsed && (
            <div className="px-3 py-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold text-sm">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-purple-100 mb-3">
                  Unlock Auto-Pilot mode và unlimited AI queries
                </p>
                <Link
                  href="/pricing"
                  className="block w-full text-center py-2 bg-white text-purple-600 text-sm font-semibold rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          )}

          {/* Secondary Navigation */}
          <nav className="px-3 py-4 border-t border-gray-200 space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    active
                      ? 'bg-gray-100 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={`flex-shrink-0 ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Spacer to push content */}
      <div className={`${collapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300`} />
    </>
  );
}
