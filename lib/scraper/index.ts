import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedProductData {
  price: number | null;
  sales: number | null;
  rating: number | null;
  reviews: number | null;
  stock: number | null;
  seller_name?: string;
  brand?: string;
  category?: string;
}

export class ProductScraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

  private async makeRequest(url: string): Promise<string | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent.toString(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
        maxRedirects: 5,
      });

      return response.data;
    } catch (error) {
      console.error('Scraping request failed:', error);
      return null;
    }
  }

  async scrapeShopee(url: string): Promise<ScrapedProductData> {
    try {
      const html = await this.makeRequest(url);
      if (!html) return this.getEmptyData();

      const $ = cheerio.load(html);

      // Extract price
      let price = null;
      const priceText = $('div.item-price span').first().text() ||
                       $('div.price-and-shipping span').first().text() ||
                       $('[data-testid="item-price"]').text();

      if (priceText) {
        const priceMatch = priceText.replace(/[^\d]/g, '');
        price = priceMatch ? parseInt(priceMatch) : null;
      }

      // Extract sales
      let sales = null;
      const salesText = $('div.item-sold span').text() ||
                       $('[data-testid="item-sold"]').text() ||
                       $('div.sold-count').text();

      if (salesText) {
        const salesMatch = salesText.replace(/[^\d]/g, '');
        sales = salesMatch ? parseInt(salesMatch) : null;
      }

      // Extract rating
      let rating = null;
      const ratingText = $('div.rating-stars span').text() ||
                        $('[data-testid="item-rating"]').text() ||
                        $('div.rating-score').text();

      if (ratingText) {
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
      }

      // Extract reviews count
      let reviews = null;
      const reviewsText = $('div.rating-count').text() ||
                         $('[data-testid="item-reviews"]').text();

      if (reviewsText) {
        const reviewsMatch = reviewsText.replace(/[^\d]/g, '');
        reviews = reviewsMatch ? parseInt(reviewsMatch) : null;
      }

      return {
        price,
        sales,
        rating,
        reviews,
        stock: null, // Shopee doesn't show stock easily
        seller_name: undefined,
        brand: undefined,
        category: undefined
      };

    } catch (error) {
      console.error('Shopee scraping error:', error);
      return this.getEmptyData();
    }
  }

  async scrapeLazada(url: string): Promise<ScrapedProductData> {
    try {
      const html = await this.makeRequest(url);
      if (!html) return this.getEmptyData();

      const $ = cheerio.load(html);

      // Extract price - Lazada uses multiple price selectors, try all
      let price = null;
      const priceSelectors = [
        'span.pdp-price_color_orange',
        'span.pdp-price',
        '[data-qa-locator="product-price"]',
        '.pdp-price_color_orange',
        '.pdp-price',
        'span.price',
        '.price--notranslate',
        '[data-price]',
        '.price-current',
        // Additional selectors for different Lazada layouts
        '.currency',
        '.price',
        '[data-testid="price"]',
        '.product-price',
        '.item-price'
      ];

      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        if (priceText) {
          // Handle Vietnamese currency formatting (₫ symbol and commas)
          const cleanPrice = priceText.replace(/[₫,\s]/g, '');
          const priceMatch = cleanPrice.match(/(\d+)/);
          if (priceMatch) {
            price = parseInt(priceMatch[1]);
            break;
          }
        }
      }

      // Extract sales - Lazada sales count
      let sales = null;
      const salesSelectors = [
        'span.pdp-sold-count',
        '[data-qa-locator="product-sold-count"]',
        '.pdp-sold-count',
        'span.sold-count',
        '.sold-count',
        '[data-sold-count]',
        '.item-sold',
        // Additional selectors
        '.sold',
        '[data-testid="sold-count"]',
        '.sales-count',
        '.item-sold-count'
      ];

      for (const selector of salesSelectors) {
        const salesText = $(selector).first().text().trim();
        if (salesText) {
          const salesMatch = salesText.replace(/[^\d]/g, '');
          if (salesMatch) {
            sales = parseInt(salesMatch);
            break;
          }
        }
      }

      // Extract rating
      let rating = null;
      const ratingSelectors = [
        'span.score-average',
        '[data-qa-locator="product-rating"]',
        '.score-average',
        'span.rating-score',
        '.rating-score',
        '[data-rating]',
        '.star-rating',
        // Additional selectors
        '.rating',
        '[data-testid="rating"]',
        '.product-rating',
        '.item-rating'
      ];

      for (const selector of ratingSelectors) {
        const ratingText = $(selector).first().text().trim();
        if (ratingText) {
          const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
          if (ratingMatch) {
            rating = parseFloat(ratingMatch[1]);
            break;
          }
        }
      }

      // Extract reviews count
      let reviews = null;
      const reviewsSelectors = [
        'span.count',
        '[data-qa-locator="product-reviews-count"]',
        '.review-count',
        'span.review-count',
        '.reviews-count',
        '[data-reviews-count]',
        '.review-total',
        // Additional selectors
        '.reviews',
        '[data-testid="reviews-count"]',
        '.product-reviews',
        '.item-reviews'
      ];

      for (const selector of reviewsSelectors) {
        const reviewsText = $(selector).first().text().trim();
        if (reviewsText) {
          const reviewsMatch = reviewsText.replace(/[^\d]/g, '');
          if (reviewsMatch) {
            reviews = parseInt(reviewsMatch);
            break;
          }
        }
      }

      return {
        price,
        sales,
        rating,
        reviews,
        stock: null,
        seller_name: undefined,
        brand: undefined,
        category: undefined
      };

    } catch (error) {
      console.error('Lazada scraping error:', error);
      return this.getEmptyData();
    }
  }

  async scrapeTiktok(url: string): Promise<ScrapedProductData> {
    try {
      const html = await this.makeRequest(url);
      if (!html) return this.getEmptyData();

      const $ = cheerio.load(html);

      // TikTok Shop scraping is more complex due to JavaScript rendering
      // This is a basic implementation that may need enhancement

      let price = null;
      const priceText = $('span.price').text() ||
                       $('[data-e2e="product-price"]').text();

      if (priceText) {
        const priceMatch = priceText.replace(/[^\d]/g, '');
        price = priceMatch ? parseInt(priceMatch) : null;
      }

      // TikTok Shop may not show sales/rating publicly
      return {
        price,
        sales: null,
        rating: null,
        reviews: null,
        stock: null,
        seller_name: undefined,
        brand: undefined,
        category: undefined
      };

    } catch (error) {
      console.error('TikTok scraping error:', error);
      return this.getEmptyData();
    }
  }

  async scrapeProduct(url: string, platform: 'shopee' | 'lazada' | 'tiktok'): Promise<ScrapedProductData> {
    switch (platform) {
      case 'shopee':
        return this.scrapeShopee(url);
      case 'lazada':
        return this.scrapeLazada(url);
      case 'tiktok':
        return this.scrapeTiktok(url);
      default:
        return this.getEmptyData();
    }
  }

  private getEmptyData(): ScrapedProductData {
    return {
      price: null,
      sales: null,
      rating: null,
      reviews: null,
      stock: null,
      seller_name: undefined,
      brand: undefined,
      category: undefined
    };
  }
}
