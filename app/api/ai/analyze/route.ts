import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// POST /api/ai/analyze - Analyze product with AI
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, productData, competitors = [] } = await request.json();

    if (!productData) {
      return NextResponse.json(
        { error: 'Missing productData' },
        { status: 400 }
      );
    }

    // Check AI usage limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_queries_used_today, ai_queries_limit')
      .eq('id', session.user.id)
      .single();

    if (profile && profile.ai_queries_used_today >= profile.ai_queries_limit) {
      return NextResponse.json(
        { error: 'AI query limit reached for today. Upgrade your plan.' },
        { status: 429 }
      );
    }

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(productData, competitors);

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      system: `Bạn là AI expert về e-commerce analytics tại Việt Nam. 
      Phân tích sản phẩm và đưa ra insights ACTIONABLE, cụ thể, dễ hiểu.
      Luôn trả lời bằng tiếng Việt và format JSON.`,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse AI response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response is not valid JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Generate insights from analysis
    const insights = generateInsightsFromAnalysis(analysis, productData);

    // Save insights to database
    if (productId) {
      for (const insight of insights) {
        await supabase.from('ai_insights').insert({
          user_id: session.user.id,
          tracked_product_id: productId,
          ...insight
        });
      }
    }

    // Increment AI usage counter
    await supabase.rpc('increment_ai_usage', {
      user_id: session.user.id
    });

    return NextResponse.json({
      success: true,
      analysis,
      insights,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens
      }
    });

  } catch (error: any) {
    console.error('AI Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'AI analysis failed' },
      { status: 500 }
    );
  }
}

// Build comprehensive analysis prompt
function buildAnalysisPrompt(productData: any, competitors: any[]) {
  const competitorInfo = competitors.length > 0
    ? `\n\nCOMPETITORS (Top ${competitors.length}):\n${competitors.map((c, i) => `
    ${i + 1}. ${c.name || 'Competitor ' + (i + 1)}
       - Giá: ${c.price?.toLocaleString() || 'N/A'} VNĐ
       - Sales: ${c.sales || 'N/A'}
       - Rating: ${c.rating || 'N/A'}/5
    `).join('\n')}`
    : '';

  return `
Phân tích sản phẩm e-commerce sau:

SẢN PHẨM:
- Tên: ${productData.name || productData.product_name}
- Platform: ${productData.platform}
- Giá: ${productData.price?.toLocaleString() || productData.current_price?.toLocaleString()} VNĐ
- Đã bán: ${productData.sales || productData.current_sales || 0}
- Rating: ${productData.rating || productData.current_rating || 0}/5
- Reviews: ${productData.reviews || productData.current_reviews || 0}
${productData.category ? `- Category: ${productData.category}` : ''}
${competitorInfo}

YÊU CẦU PHÂN TÍCH:

1. PRICING ANALYSIS
   - Giá này cao/thấp/hợp lý so với market?
   - Nên tăng hay giảm giá?
   - Mức giá optimal là bao nhiêu?

2. PERFORMANCE ANALYSIS
   - Sales performance: tốt/trung bình/kém?
   - Rating có ổn không? (>4.5 là tốt)
   - Review count có đủ social proof không?

3. COMPETITIVE POSITION
   ${competitors.length > 0 ? `
   - So sánh với ${competitors.length} competitors
   - Điểm mạnh/yếu so với competitors
   - Cơ hội để vượt competitors
   ` : '- Không có competitor data để so sánh'}

4. OPPORTUNITIES & RISKS
   - 2-3 cơ hội để tăng trưởng
   - 1-2 rủi ro cần chú ý
   - Quick wins (làm ngay được)

5. ACTION ITEMS (QUAN TRỌNG NHẤT)
   - 3-5 hành động CỤ THỂ với:
     * Priority (high/medium/low)
     * Expected impact (số liệu ước tính)
     * Effort required (low/medium/high)
     * Step-by-step guide

Trả lời theo format JSON sau (QUAN TRỌNG - phải đúng format):

{
  "overall_score": 0-100,
  "summary": "Tóm tắt 1-2 câu về product này",
  "pricing": {
    "status": "optimal|too_high|too_low",
    "current": ${productData.price || productData.current_price},
    "recommended": 0,
    "reasoning": "Giải thích tại sao"
  },
  "performance": {
    "status": "excellent|good|average|poor",
    "sales_score": 0-100,
    "rating_score": 0-100,
    "reasoning": "Phân tích performance"
  },
  "competitive_position": {
    "position": "leading|competitive|struggling",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "opportunities": ["...", "..."]
  },
  "insights": [
    {
      "type": "opportunity|warning|trend|action",
      "title": "Tiêu đề ngắn gọn",
      "description": "Mô tả chi tiết",
      "priority": "high|medium|low",
      "confidence": 0.0-1.0
    }
  ],
  "action_items": [
    {
      "title": "Hành động cụ thể",
      "description": "Mô tả chi tiết cách làm",
      "priority": "high|medium|low",
      "estimated_impact": "Ước tính kết quả (vd: +10% sales)",
      "effort": "low|medium|high",
      "steps": ["Bước 1", "Bước 2", "..."]
    }
  ]
}

LƯU Ý:
- Phải trả lời bằng tiếng Việt
- Số liệu phải realistic và có căn cứ
- Action items phải ACTIONABLE (làm được ngay)
- Không chung chung, phải cụ thể
`;
}

// Generate insights from AI analysis
function generateInsightsFromAnalysis(analysis: any, productData: any) {
  const insights = [];

  // Add insights from AI analysis
  if (analysis.insights && Array.isArray(analysis.insights)) {
    insights.push(...analysis.insights.map((insight: any) => ({
      insight_type: insight.type || 'recommendation',
      title: insight.title,
      description: insight.description,
      confidence_score: insight.confidence || 0.8,
      priority: insight.priority || 'medium',
      action_items: analysis.action_items || [],
      ai_model: 'claude-sonnet-4'
    })));
  }

  // Add pricing insight if needed
  if (analysis.pricing?.status !== 'optimal') {
    insights.push({
      insight_type: analysis.pricing.status === 'too_high' ? 'warning' : 'opportunity',
      title: analysis.pricing.status === 'too_high' 
        ? 'Giá có thể đang cao' 
        : 'Cơ hội tăng giá',
      description: analysis.pricing.reasoning,
      confidence_score: 0.85,
      priority: 'high',
      action_items: [{
        title: `Điều chỉnh giá về ${analysis.pricing.recommended?.toLocaleString()} VNĐ`,
        description: 'Test giá mới trong 7 ngày và monitor kết quả',
        priority: 'high'
      }],
      ai_model: 'claude-sonnet-4'
    });
  }

  // Add performance warning if poor
  if (analysis.performance?.status === 'poor') {
    insights.push({
      insight_type: 'warning',
      title: 'Performance cần cải thiện',
      description: analysis.performance.reasoning,
      confidence_score: 0.9,
      priority: 'high',
      action_items: analysis.action_items || [],
      ai_model: 'claude-sonnet-4'
    });
  }

  return insights;
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'AI Analysis API',
    usage: {
      method: 'POST',
      body: {
        productId: 'uuid (optional)',
        productData: {
          name: 'Product name',
          platform: 'tiktok|shopee|lazada|tiki',
          price: 199000,
          sales: 547,
          rating: 4.5,
          reviews: 234
        },
        competitors: [
          {
            name: 'Competitor name',
            price: 189000,
            sales: 623,
            rating: 4.3
          }
        ]
      }
    },
    note: 'Requires authentication'
  });
}