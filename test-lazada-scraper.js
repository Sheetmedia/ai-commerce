const axios = require('axios');
const cheerio = require('cheerio');

class ProductScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async makeRequest(url) {
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

  async scrapeLazada(url) {
    try {
      const html = await this.makeRequest(url);
      if (!html) return this.getEmptyData();

      const $ = cheerio.load(html);

      // Extract price - Updated Lazada selectors based on current structure
      let price = null;
      const priceSelectors = [
        'span.pdp-price_color_orange',
        'span.pdp-price',
        '[data-qa-locator="product-price"]',
        '.pdp-price_color_orange',
        '.pdp-price',
        'span.price',
        '.price--notranslate', // Common Lazada price class
        '[data-price]', // Data attribute for price
        '.price-current' // Current price display
      ];

      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        if (priceText) {
          // Handle Vietnamese currency formatting (₫ symbol)
          const cleanPrice = priceText.replace(/[₫,\s]/g, '');
          const priceMatch = cleanPrice.match(/(\d+)/);
          if (priceMatch) {
            price = parseInt(priceMatch[1]);
            break;
          }
        }
      }

      // Extract sales - Updated Lazada sales selectors
      let sales = null;
      const salesSelectors = [
        'span.pdp-sold-count',
        '[data-qa-locator="product-sold-count"]',
        '.pdp-sold-count',
        'span.sold-count',
        '.sold-count', // Common sold count class
        '[data-sold-count]', // Data attribute
        '.item-sold' // Alternative sold indicator
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

      // Extract rating - Updated rating selectors
      let rating = null;
      const ratingSelectors = [
        'span.score-average',
        '[data-qa-locator="product-rating"]',
        '.score-average',
        'span.rating-score',
        '.rating-score', // Common rating class
        '[data-rating]', // Data attribute
        '.star-rating' // Star rating container
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

      // Extract reviews count - Updated reviews selectors
      let reviews = null;
      const reviewsSelectors = [
        'span.count',
        '[data-qa-locator="product-reviews-count"]',
        '.review-count',
        'span.review-count',
        '.reviews-count', // Common reviews class
        '[data-reviews-count]', // Data attribute
        '.review-total' // Total reviews indicator
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

  getEmptyData() {
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

async function testLazadaScraper() {
  const scraper = new ProductScraper();

  // Test with a sample Lazada URL - using a more generic search URL
  const testUrl = 'https://www.lazada.vn/catalog/?q=iphone';

  console.log('Testing Lazada scraper with URL:', testUrl);

  try {
    const data = await scraper.scrapeLazada(testUrl);
    console.log('Scraped data:', data);

    if (data.price !== null) {
      console.log('✅ Price extracted successfully:', data.price);
    } else {
      console.log('❌ Price not found');
    }

    if (data.sales !== null) {
      console.log('✅ Sales extracted successfully:', data.sales);
    } else {
      console.log('❌ Sales not found');
    }

    if (data.rating !== null) {
      console.log('✅ Rating extracted successfully:', data.rating);
    } else {
      console.log('❌ Rating not found');
    }

    if (data.reviews !== null) {
      console.log('✅ Reviews extracted successfully:', data.reviews);
    } else {
      console.log('❌ Reviews not found');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLazadaScraper();
