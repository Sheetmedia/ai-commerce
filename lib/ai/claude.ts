import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = 'claude-sonnet-4-20250514';

// System prompts for different use cases
const SYSTEM_PROMPTS = {
  productAnalysis: `Bạn là AI expert về e-commerce analytics tại Việt Nam.
Nhiệm vụ: Phân tích sản phẩm và đưa ra insights ACTIONABLE, cụ thể, dễ hiểu.
- Luôn trả lời bằng tiếng Việt
- Số liệu phải realistic và có căn cứ
- Action items phải làm được ngay (không chung chung)
- Format: JSON với structure rõ ràng`,

  competitorAnalysis: `Bạn là AI expert về competitive intelligence trong e-commerce.
Nhiệm vụ: So sánh và phân tích vị thế cạnh tranh.
- Đưa ra điểm mạnh/yếu cụ thể
- Strategies để vượt competitors
- Quick wins có thể áp dụng ngay`,

  trendPrediction: `Bạn là AI expert về market trends và forecasting.
Nhiệm vụ: Dự đoán xu hướng và cơ hội thị trường.
- Dựa trên data patterns
- Confidence score cho mỗi prediction
- Timeline cụ thể`,

  contentGeneration: `Bạn là copywriter chuyên về e-commerce.
Nhiệm vụ: Tạo content marketing hấp dẫn.
- Tiếng Việt tự nhiên
- SEO-friendly
- Tạo urgency và social proof`
};

// Main Claude AI Service
export class ClaudeAIService {
  
  /**
   * Analyze product with AI
   */
  static async analyzeProduct(productData: any, competitors: any[] = []) {
    const prompt = buildProductAnalysisPrompt(productData, competitors);
    
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      system: SYSTEM_PROMPTS.productAnalysis,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseJSONResponse(response);
  }

  /**
   * Compare with competitors
   */
  static async compareCompetitors(yourProduct: any, competitors: any[]) {
    const prompt = buildCompetitorPrompt(yourProduct, competitors);
    
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.3,
      system: SYSTEM_PROMPTS.competitorAnalysis,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseJSONResponse(response);
  }

  /**
   * Predict trends
   */
  static async predictTrends(historicalData: any[], category: string) {
    const prompt = buildTrendPrompt(historicalData, category);
    
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.4,
      system: SYSTEM_PROMPTS.trendPrediction,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseJSONResponse(response);
  }

  /**
   * Generate product description
   */
  static async generateDescription(
    productName: string,
    features: string[],
    targetAudience: string
  ) {
    const prompt = `
Viết product description cho:

SẢN PHẨM: ${productName}
FEATURES:
${features.map((f, i) => `${i + 1}. ${f}`).join('\n')}
TARGET AUDIENCE: ${targetAudience}

YÊU CẦU:
- Catchy hook (tạo curiosity)
- Highlight benefits (không chỉ features)
- Social proof nếu phù hợp
- Strong call-to-action
- SEO-friendly
- Độ dài: 150-200 từ

Return JSON:
{
  "description": "Full description text",
  "hook": "Catchy first line",
  "bullet_points": ["benefit 1", "benefit 2", ...],
  "cta": "Call to action"
}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      system: SYSTEM_PROMPTS.contentGeneration,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseJSONResponse(response);
  }

  /**
   * Price optimization suggestion
   */
  static async optimizePrice(productData: any, marketData: any) {
    const prompt = `
OPTIMIZE PRICING cho sản phẩm:

SẢN PHẨM:
- Tên: ${productData.name}
- Giá hiện tại: ${productData.price?.toLocaleString()} VNĐ
- Cost: ${productData.cost?.toLocaleString() || 'Unknown'} VNĐ
- Sales hiện tại: ${productData.sales}/tháng
- Rating: ${productData.rating}/5

MARKET DATA:
- Competitor avg: ${marketData.avgPrice?.toLocaleString()} VNĐ
- Competitor range: ${marketData.minPrice?.toLocaleString()} - ${marketData.maxPrice?.toLocaleString()} VNĐ
- Category average: ${marketData.categoryAvg?.toLocaleString()} VNĐ

YÊU CẦU:
1. Giá optimal là bao nhiêu?
2. Price elasticity estimate
3. Expected impact on sales/revenue
4. A/B testing suggestions (2-3 mức giá test)
5. Psychological pricing tips

Return JSON:
{
  "optimal_price": 0,
  "reasoning": "...",
  "elasticity": 0.0,
  "expected_impact": {
    "sales_change": "+X%",
    "revenue_change": "+Y%"
  },
  "test_prices": [price1, price2, price3],
  "psychological_tips": ["tip1", "tip2"]
}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      temperature: 0.3,
      system: SYSTEM_PROMPTS.productAnalysis,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseJSONResponse(response);
  }

  /**
   * Generate marketing campaign ideas
   */
  static async generateCampaignIdeas(productData: any, budget: number) {
    const prompt = `
Tạo campaign ideas cho:

SẢN PHẨM: ${productData.name}
CATEGORY: ${productData.category}
TARGET: ${productData.targetAudience || 'Mass market'}
BUDGET: ${budget.toLocaleString()} VNĐ

Đưa ra 3-5 campaign ideas với:
- Campaign name catchy
- Concept & messaging
- Channels (TikTok, FB, IG, etc)
- Timeline & milestones
- Expected ROI
- Budget allocation

Return JSON format.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500,
      temperature: 0.6,
      system: SYSTEM_PROMPTS.contentGeneration,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return parseJSONResponse(response);
  }

  /**
   * Chat with AI (general purpose)
   */
  static async chat(message: string, context?: any) {
    const prompt = context 
      ? `Context: ${JSON.stringify(context)}\n\nUser question: ${message}`
      : message;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.5,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const text = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    return {
      response: text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens
      }
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildProductAnalysisPrompt(productData: any, competitors: any[]) {
  return `
Phân tích sản phẩm e-commerce:

SẢN PHẨM:
- Tên: ${productData.name || productData.product_name}
- Platform: ${productData.platform}
- Giá: ${productData.price?.toLocaleString()} VNĐ
- Sales: ${productData.sales || 0}
- Rating: ${productData.rating || 0}/5
- Reviews: ${productData.reviews || 0}

${competitors.length > 0 ? `
COMPETITORS:
${competitors.map((c, i) => `${i + 1}. ${c.name} - ${c.price?.toLocaleString()}đ - ${c.sales} sales - ${c.rating}/5`).join('\n')}
` : ''}

Return JSON:
{
  "overall_score": 0-100,
  "summary": "1-2 câu tóm tắt",
  "pricing": {
    "status": "optimal|too_high|too_low",
    "recommended": 0,
    "reasoning": "..."
  },
  "performance": {
    "status": "excellent|good|average|poor",
    "reasoning": "..."
  },
  "insights": [
    {
      "type": "opportunity|warning|trend|action",
      "title": "...",
      "description": "...",
      "priority": "high|medium|low",
      "confidence": 0.0-1.0
    }
  ],
  "action_items": [
    {
      "title": "...",
      "description": "...",
      "priority": "high|medium|low",
      "estimated_impact": "...",
      "effort": "low|medium|high"
    }
  ]
}`;
}

function buildCompetitorPrompt(yourProduct: any, competitors: any[]) {
  return `
So sánh competitive position:

YOUR PRODUCT:
${JSON.stringify(yourProduct, null, 2)}

COMPETITORS:
${JSON.stringify(competitors, null, 2)}

Return JSON:
{
  "position": "leading|competitive|struggling",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "opportunities": ["...", "..."],
  "recommendations": [
    {
      "action": "...",
      "reasoning": "...",
      "priority": "high|medium|low"
    }
  ]
}`;
}

function buildTrendPrompt(historicalData: any[], category: string) {
  return `
Phân tích trends cho category: ${category}

HISTORICAL DATA (${historicalData.length} days):
${JSON.stringify(historicalData.slice(-30), null, 2)}

Dự đoán:
1. Trend direction (7/30/90 days)
2. Seasonal patterns
3. Growth opportunities
4. Risk factors

Return JSON với predictions và confidence scores.`;
}

function parseJSONResponse(response: any) {
  const text = response.content[0].type === 'text' 
    ? response.content[0].text 
    : '';

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI response is not valid JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    data: parsed,
    usage: {
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens
    },
    model: response.model
  };
}

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Example 1: Analyze product
const analysis = await ClaudeAIService.analyzeProduct({
  name: 'Áo thun cotton',
  platform: 'tiktok',
  price: 199000,
  sales: 547,
  rating: 4.5,
  reviews: 234
}, [
  { name: 'Competitor 1', price: 189000, sales: 623, rating: 4.3 }
]);

// Example 2: Generate description
const description = await ClaudeAIService.generateDescription(
  'Áo thun cotton basic',
  ['100% cotton', 'Form rộng', 'Màu đa dạng'],
  'Gen Z, 18-25 tuổi'
);

// Example 3: Optimize price
const priceOptimization = await ClaudeAIService.optimizePrice(
  { name: 'Product', price: 199000, cost: 80000, sales: 500 },
  { avgPrice: 215000, minPrice: 180000, maxPrice: 250000 }
);

// Example 4: Chat
const chat = await ClaudeAIService.chat(
  'Sản phẩm của tôi bán chậm, phải làm gì?',
  { product: {...} }
);
*/

export default ClaudeAIService;