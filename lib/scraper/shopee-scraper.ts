import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ShopeeProductData {
  name: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  platform: 'shopee';
}

export class ShopeeScraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeProduct(url: string): Promise<ShopeeProductData | null> {
    try {
      // Shopee URLs typically look like:
      // https://shopee.vn/product/1234567890
      // or https://shopee.vn/item-name.i.123.4567890

      const productId = this.extractProductId(url);
      if (!productId) {
        console.error('Could not extract product ID from Shopee URL');
        return null;
      }

      // Try API approach first (more reliable)
      const apiData = await this.scrapeViaAPI(productId);
      if (apiData) {
        return apiData;
      }

      // Fallback to HTML scraping
      return await this.scrapeViaHTML(url);

    } catch (error) {
      console.error('Shopee scraping error:', error);
      return null;
    }
  }

  private extractProductId(url: string): string | null {
    // Extract product ID from various Shopee URL formats
    const patterns = [
      /\/product\/(\d+)/,
      /\.i\.\d+\.(\d+)/,
      /item\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  private async scrapeViaAPI(productId: string): Promise<ShopeeProductData | null> {
    try {
      // Shopee API endpoint (this may change)
      const apiUrl = `https://shopee.vn/api/v2/item/get?itemid=${productId}&shopid=1`;

      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Referer': 'https://shopee.vn/',
          'X-Requested-With': 'XMLHttpRequest',
        },
        timeout: 10000,
      });

      if (response.data && response.data.item) {
        const item = response.data.item;

        return {
          name: item.name || '',
          price: item.price ? Math.round(item.price / 100000) : 0, // Shopee stores price in smallest unit
          sales: item.sold || item.historical_sold || 0,
          rating: item.item_rating ? item.item_rating.rating_star || 0 : 0,
          reviews: item.item_rating ? item.item_rating.rating_count?.[0] || 0 : 0,
          platform: 'shopee'
        };
      }

      return null;

    } catch (error) {
      console.error('Shopee API scraping failed:', error);
      return null;
    }
  }

  private async scrapeViaHTML(url: string): Promise<ShopeeProductData | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Shopee HTML selectors (may need updates as site changes)
      const name = $('div[itemprop="name"]').text().trim() ||
                  $('h1[data-cy="product-title"]').text().trim() ||
                  $('h1.title').text().trim() ||
                  '';

      let price = 0;
      const priceText = $('div[data-cy="product-price"]').text().trim() ||
                       $('span[itemprop="price"]').attr('content') ||
                       $('div.price').text().trim();

      if (priceText) {
        // Remove currency symbols and parse
        const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '');
        const parsed = parseFloat(cleanPrice);
        price = isNaN(parsed) ? 0 : Math.round(parsed);
      }

      let sales = 0;
      const salesText = $('div[data-cy="product-sold-count"]').text().trim() ||
                       $('span.sold-count').text().trim() ||
                       $('div.sold').text().trim();

      if (salesText) {
        const salesMatch = salesText.match(/(\d+(?:,\d+)*)/);
        if (salesMatch) {
          sales = parseInt(salesMatch[1].replace(/,/g, ''));
        }
      }

      let rating = 0;
      const ratingText = $('div[data-cy="product-rating"]').text().trim() ||
                        $('span.rating-score').text().trim() ||
                        $('div.rating').text().trim();

      if (ratingText) {
        const parsed = parseFloat(ratingText);
        rating = isNaN(parsed) ? 0 : parsed;
      }

      let reviews = 0;
      const reviewsText = $('div[data-cy="product-reviews-count"]').text().trim() ||
                         $('span.review-count').text().trim() ||
                         $('a[href*="reviews"] span').text().trim();

      if (reviewsText) {
        const reviewsMatch = reviewsText.match(/(\d+(?:,\d+)*)/);
        if (reviewsMatch) {
          reviews = parseInt(reviewsMatch[1].replace(/,/g, ''));
        }
      }

      return {
        name,
        price,
        sales,
        rating,
        reviews,
        platform: 'shopee'
      };

    } catch (error) {
      console.error('Shopee HTML scraping failed:', error);
      return null;
    }
  }

  // Generate mock data for testing when scraping fails
  generateMockData(): ShopeeProductData {
    const mockNames = [
      'Áo thun cotton basic unisex',
      'Tai nghe bluetooth TWS 5.0',
      'Serum Vitamin C 20% trắng da',
      'Nồi chiên không dầu 5.5L',
      'Giày thể thao nam nữ running'
    ];

    return {
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      price: Math.floor(Math.random() * 500000) + 100000, // 100K - 600K
      sales: Math.floor(Math.random() * 2000) + 100, // 100 - 2100
      rating: parseFloat((Math.random() * 1 + 4).toFixed(1)), // 4.0 - 5.0
      reviews: Math.floor(Math.random() * 500) + 50, // 50 - 550
      platform: 'shopee'
    };
  }
}

// Export singleton instance
export const shopeeScraper = new ShopeeScraper();
