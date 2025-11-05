'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface PriceChartProps {
  data: Array<{
    date: string;
    price: number;
    sales?: number;
    rating?: number;
  }>;
  productName?: string;
  showSales?: boolean;
  showRating?: boolean;
}

export default function PriceChart({ 
  data, 
  productName = 'Product',
  showSales = false,
  showRating = false 
}: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Filter data based on time range
  const filterData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return data.slice(-days);
  };

  const filteredData = filterData();

  // Calculate stats
  const latestPrice = filteredData[filteredData.length - 1]?.price || 0;
  const oldestPrice = filteredData[0]?.price || 0;
  const priceChange = oldestPrice > 0 ? ((latestPrice - oldestPrice) / oldestPrice) * 100 : 0;
  const avgPrice = filteredData.reduce((sum, item) => sum + item.price, 0) / filteredData.length;
  const maxPrice = Math.max(...filteredData.map(item => item.price));
  const minPrice = Math.min(...filteredData.map(item => item.price));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {payload[0].payload.date}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {entry.name === 'Price' 
                  ? `${entry.value.toLocaleString()}đ`
                  : entry.name === 'Rating'
                  ? `${entry.value.toFixed(1)} ⭐`
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format Y axis
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Price History
          </h3>
          <p className="text-sm text-gray-500">{productName}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                chartType === 'line'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Area
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="text-xs text-blue-700 mb-1">Current Price</div>
          <div className="text-xl font-bold text-blue-900">
            {latestPrice.toLocaleString()}đ
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${
            priceChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {priceChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(priceChange).toFixed(1)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="text-xs text-purple-700 mb-1">Average</div>
          <div className="text-xl font-bold text-purple-900">
            {avgPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="text-xs text-green-700 mb-1">Lowest</div>
          <div className="text-xl font-bold text-green-900">
            {minPrice.toLocaleString()}đ
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="text-xs text-orange-700 mb-1">Highest</div>
          <div className="text-xl font-bold text-orange-900">
            {maxPrice.toLocaleString()}đ
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                {showSales && (
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatYAxis}
              />
              {showSales && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
              {showSales && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorSales)"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatYAxis}
              />
              {showSales && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              {showSales && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sales"
                  name="Sales"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              )}
              {showRating && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rating"
                  name="Rating"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      {priceChange !== 0 && (
        <div className={`mt-6 p-4 rounded-lg ${
          priceChange > 10 ? 'bg-red-50 border border-red-200' :
          priceChange < -10 ? 'bg-green-50 border border-green-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            {priceChange > 10 ? (
              <TrendingUp className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            ) : priceChange < -10 ? (
              <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {priceChange > 10 ? '⚠️ Giá tăng đáng kể' :
                 priceChange < -10 ? '✅ Giá giảm mạnh' :
                 '📊 Giá ổn định'}
              </p>
              <p className="text-xs text-gray-600">
                {priceChange > 10 
                  ? `Giá đã tăng ${priceChange.toFixed(1)}% trong ${timeRange}. Có thể ảnh hưởng conversion rate.`
                  : priceChange < -10
                  ? `Giá giảm ${Math.abs(priceChange).toFixed(1)}% - cơ hội tốt để boost sales!`
                  : `Giá biến động nhẹ (${Math.abs(priceChange).toFixed(1)}%) - đang trong vùng ổn định.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}