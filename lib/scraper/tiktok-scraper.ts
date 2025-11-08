import axios from 'axios';
import * as cheerio from 'cheerio';

export interface TikTokProductData {
  name: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  platform: 'tiktok';
}

export class TikTokScraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  async scrapeProduct(url: string): Promise<TikTokProductData | null> {
    try {
      // TikTok Shop URLs typically look like:
      // https://shop.tiktok.com/view/product/1234567890
      // or https://t.tiktok.com/api/item/detail/?itemId=1234567890

      const productId = this.extractProductId(url);
      if (!productId) {
        console.error('Could not extract product ID from TikTok URL');
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
      console.error('TikTok scraping error:', error);
      return null;
    }
  }

  private extractProductId(url: string): string | null {
    // Extract product ID from various TikTok Shop URL formats
    const patterns = [
      /\/product\/(\d+)/,
      /itemId=(\d+)/,
      /\/view\/product\/(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  private async scrapeViaAPI(productId: string): Promise<TikTokProductData | null> {
    try {
      // TikTok Shop API endpoint (this may change)
      const apiUrl = `https://t.tiktok.com/api/item/detail/?itemId=${productId}`;

      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json',
          'Referer': 'https://shop.tiktok.com/',
        },
        timeout: 10000,
      });

      if (response.data && response.data.item) {
        const item = response.data.item;

        return {
          name: item.name || item.title || '',
          price: item.price ? Math.round(item.price / 100) : 0, // TikTok stores price in cents
          sales: item.sales || item.sold_count || 0,
          rating: item.rating || item.avg_rating || 0,
          reviews: item.review_count || item.rating_count || 0,
          platform: 'tiktok'
        };
      }

      return null;

    } catch (error) {
      console.error('TikTok API scraping failed:', error);
      return null;
    }
  }

  private async scrapeViaHTML(url: string): Promise<TikTokProductData | null> {
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

      // TikTok Shop HTML selectors (may need updates as site changes)
      const name = $('h1[data-e2e="product-title"]').text().trim() ||
                  $('h1.product-title').text().trim() ||
                  $('h1.title').text().trim() ||
                  '';

      let price = 0;
      const priceText = $('[data-e2e="product-price"]').text().trim() ||
                       $('span.price').text().trim() ||
                       $('div.price').text().trim();

      if (priceText) {
        // Remove currency symbols and parse
        const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '');
        const parsed = parseFloat(cleanPrice);
        price = isNaN(parsed) ? 0 : Math.round(parsed);
      }

      let sales = 0;
      const salesText = $('[data-e2e="sales-count"]').text().trim() ||
                       $('span.sales').text().trim() ||
                       $('div.sold-count').text().trim();

      if (salesText) {
        const salesMatch = salesText.match(/(\d+(?:,\d+)*)/);
        if (salesMatch) {
          sales = parseInt(salesMatch[1].replace(/,/g, ''));
        }
      }

      let rating = 0;
      const ratingText = $('[data-e2e="rating-value"]').text().trim() ||
                        $('span.rating').text().trim() ||
                        $('div.rating-score').text().trim();

      if (ratingText) {
        const parsed = parseFloat(ratingText);
        rating = isNaN(parsed) ? 0 : parsed;
      }

      let reviews = 0;
      const reviewsText = $('[data-e2e="review-count"]').text().trim() ||
                         $('span.reviews').text().trim() ||
                         $('div.review-count').text().trim();

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
        platform: 'tiktok'
      };

    } catch (error) {
      console.error('TikTok HTML scraping failed:', error);
      return null;
    }
  }

  // Generate mock data for testing when scraping fails
  generateMockData(): TikTokProductData {
    const mockNames = [
      'Áo thun TikTok trending',
      'Tai nghe gaming RGB',
      'Điện thoại selfie 64MP',
      'Balo laptop chống nước',
      'Đồng hồ thông minh fitness'
    ];

    return {
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      price: Math.floor(Math.random() * 300000) + 50000, // 50K - 350K
      sales: Math.floor(Math.random() * 1000) + 50, // 50 - 1050
      rating: parseFloat((Math.random() * 1 + 4).toFixed(1)), // 4.0 - 5.0
      reviews: Math.floor(Math.random() * 200) + 20, // 20 - 220
      platform: 'tiktok'
    };
  }
}

// Export singleton instance
export const tiktokScraper = new TikTokScraper();
