import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Platform-specific scraping configurations
const platformConfigs = {
  tiktok: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    selectors: {
      name: 'h1[data-e2e="product-title"]',
      price: '[data-e2e="product-price"]',
      sales: '[data-e2e="sales-count"]',
      rating: '[data-e2e="rating-value"]',
      reviews: '[data-e2e="review-count"]'
    }
  },
  shopee: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    selectors: {
      name: 'div[class*="product-title"]',
      price: 'div[class*="price"]',
      sales: 'div[class*="sold"]',
      rating: 'div[class*="rating"]',
      reviews: 'div[class*="review"]'
    }
  },
  lazada: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    selectors: {
      name: 'h1[class*="title"]',
      price: 'span[class*="price"]',
      sales: 'span[class*="sold"]',
      rating: 'span[class*="rating"]',
      reviews: 'span[class*="review"]'
    }
  },
  tiki: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    selectors: {
      name: 'h1[class*="title"]',
      price: 'div[class*="price"]',
      sales: 'div[class*="sold"]',
      rating: 'div[class*="rating"]',
      reviews: 'div[class*="review"]'
    }
  }
};

// POST /api/scrape - Scrape product data from URL
export async function POST(request: NextRequest) {
  try {
    const { url, platform } = await request.json();

    if (!url || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields: url, platform' },
        { status: 400 }
      );
    }

    if (!['tiktok', 'shopee', 'lazada', 'tiki'].includes(platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Try different scraping methods in order of preference
    let productData = null;
    let method = '';

    // Method 1: Try API endpoint (fastest, most reliable)
    try {
      productData = await scrapeViaAPI(url, platform);
      method = 'api';
    } catch (error) {
      console.log('API scraping failed, trying HTML parsing...');
    }

    // Method 2: HTML scraping (fallback)
    if (!productData) {
      try {
        productData = await scrapeViaHTML(url, platform);
        method = 'html';
      } catch (error) {
        console.error('HTML scraping failed:', error);
      }
    }

    // Method 3: Mock data (for development/testing)
    if (!productData && process.env.NODE_ENV === 'development') {
      productData = generateMockData(platform);
      method = 'mock';
    }

    if (!productData) {
      return NextResponse.json(
        { error: 'Failed to scrape product data. URL may be invalid or protected.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: productData,
      method,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Scrape API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Method 1: Scrape via undocumented API endpoints
async function scrapeViaAPI(url: string, platform: string) {
  // Extract product ID from URL
  const productId = extractProductId(url, platform);
  if (!productId) throw new Error('Invalid product URL');

  // Platform-specific API endpoints (reverse-engineered)
  const apiEndpoints: Record<string, string> = {
    tiktok: `https://api.tiktok.com/product/get?product_id=${productId}`,
    shopee: `https://shopee.vn/api/v4/item/get?itemid=${productId}`,
    lazada: `https://www.lazada.vn/api/pdp/get?itemId=${productId}`,
    tiki: `https://tiki.vn/api/v2/products/${productId}`
  };

  const endpoint = apiEndpoints[platform];
  if (!endpoint) throw new Error('API endpoint not available');

  const response = await axios.get(endpoint, {
    headers: {
      'User-Agent': platformConfigs[platform as keyof typeof platformConfigs].userAgent,
      'Accept': 'application/json',
    },
    timeout: 10000
  });

  return parseAPIResponse(response.data, platform);
}

// Method 2: Scrape via HTML parsing
async function scrapeViaHTML(url: string, platform: string) {
  const config = platformConfigs[platform as keyof typeof platformConfigs];

  const response = await axios.get(url, {
    headers: {
      'User-Agent': config.userAgent,
      'Accept': 'text/html',
      'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    },
    timeout: 15000
  });

  const $ = cheerio.load(response.data);

  // Extract data using selectors
  const name = $(config.selectors.name).first().text().trim();
  const priceText = $(config.selectors.price).first().text().trim();
  const salesText = $(config.selectors.sales).first().text().trim();
  const ratingText = $(config.selectors.rating).first().text().trim();
  const reviewsText = $(config.selectors.reviews).first().text().trim();

  // Parse and clean data
  const price = parsePrice(priceText);
  const sales = parseInt(salesText.replace(/\D/g, '')) || 0;
  const rating = parseFloat(ratingText.replace(/[^\d.]/g, '')) || 0;
  const reviews = parseInt(reviewsText.replace(/\D/g, '')) || 0;

  if (!name || price === 0) {
    throw new Error('Failed to extract product data from HTML');
  }

  return {
    name,
    price,
    sales,
    rating,
    reviews,
    platform
  };
}

// Helper: Extract product ID from URL
function extractProductId(url: string, platform: string): string | null {
  try {
    const urlObj = new URL(url);

    switch (platform) {
      case 'tiktok':
        // https://shop.tiktok.com/view/product/1234567890
        const tiktokMatch = urlObj.pathname.match(/\/product\/(\d+)/);
        return tiktokMatch ? tiktokMatch[1] : null;

      case 'shopee':
        // https://shopee.vn/product/123/456 or https://shopee.vn/product-name-i.123.456
        const shopeeMatch = urlObj.pathname.match(/[.-]i\.(\d+)\.(\d+)/) || 
                           urlObj.pathname.match(/\/(\d+)$/);
        return shopeeMatch ? shopeeMatch[shopeeMatch.length - 1] : null;

      case 'lazada':
        // https://www.lazada.vn/products/i123456.html
        const lazadaMatch = urlObj.pathname.match(/\/i(\d+)/);
        return lazadaMatch ? lazadaMatch[1] : null;

      case 'tiki':
        // https://tiki.vn/product-name-p12345678.html
        const tikiMatch = urlObj.pathname.match(/[.-]p(\d+)/);
        return tikiMatch ? tikiMatch[1] : null;

      default:
        return null;
    }
  } catch {
    return null;
  }
}

// Helper: Parse price from text
function parsePrice(priceText: string): number {
  // Remove all non-digit characters except decimal point
  const cleaned = priceText.replace(/[^\d.]/g, '');
  const price = parseFloat(cleaned);
  
  // If price seems too low (likely in thousands), multiply
  if (price < 1000 && price > 0) {
    return price * 1000;
  }
  
  return Math.round(price);
}

// Helper: Parse API response (platform-specific)
function parseAPIResponse(data: any, platform: string) {
  // This would need to be customized for each platform's API response format
  // For now, return a standardized format
  
  switch (platform) {
    case 'shopee':
      return {
        name: data.item?.name || '',
        price: data.item?.price / 100000 || 0, // Shopee stores price in smallest unit
        sales: data.item?.sold || 0,
        rating: data.item?.item_rating?.rating_star || 0,
        reviews: data.item?.item_rating?.rating_count?.[0] || 0,
        platform
      };
      
    case 'tiki':
      return {
        name: data.name || '',
        price: data.price || 0,
        sales: data.quantity_sold?.value || 0,
        rating: data.rating_average || 0,
        reviews: data.review_count || 0,
        platform
      };
      
    default:
      throw new Error('API response parsing not implemented for this platform');
  }
}

// Helper: Generate mock data for testing
function generateMockData(platform: string) {
  const mockNames = [
    'Áo thun cotton basic unisex form rộng',
    'Tai nghe bluetooth TWS 5.0 chống ồn',
    'Serum Vitamin C 20% trắng da mờ thâm',
    'Nồi chiên không dầu 5.5L cao cấp',
    'Giày thể thao nam nữ running'
  ];

  return {
    name: mockNames[Math.floor(Math.random() * mockNames.length)],
    price: Math.floor(Math.random() * 500000) + 100000, // 100K - 600K
    sales: Math.floor(Math.random() * 2000) + 100, // 100 - 2100
    rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 - 5.0
    reviews: Math.floor(Math.random() * 500) + 50, // 50 - 550
    platform,
    _isMock: true
  };
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Scrape API endpoint',
    usage: {
      method: 'POST',
      body: {
        url: 'https://shop.tiktok.com/view/product/123',
        platform: 'tiktok | shopee | lazada | tiki'
      }
    },
    supportedPlatforms: ['tiktok', 'shopee', 'lazada', 'tiki'],
    methods: ['api', 'html', 'mock (dev only)']
  });
}