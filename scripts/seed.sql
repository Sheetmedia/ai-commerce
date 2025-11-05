-- ============================================
-- SEED DATA FOR AI COMMERCE PLATFORM
-- ============================================

-- Create test user in auth.users first (this must be done manually in Supabase Dashboard)
-- Email: demo@aicommerce.vn
-- Password: demo123456

-- Then create profile for the test user
-- Note: Replace '00000000-0000-0000-0000-000000000001' with actual user ID from auth.users

-- Insert profile (after creating user in auth.users)
INSERT INTO profiles (id, email, full_name, plan, products_limit, ai_queries_limit)
VALUES (
    'cbed8e12-fd2f-4707-9cd0-ee766b8278ee',  -- Replace with actual auth user ID
    'demo@aicommerce.vn',
    'Demo User',
    'pro',
    50,
    500
);

-- Insert sample tracked products
INSERT INTO tracked_products (user_id, platform, product_id, product_url, product_name, category, current_price, current_sales, current_rating, is_active)
VALUES
    ('cbed8e12-fd2f-4707-9cd0-ee766b8278ee', 'shopee', '123456789', 'https://shopee.vn/product/123456789', 'Áo Thun Nam Cotton Cao Cấp', 'Fashion & Apparel', 199000, 1250, 4.8, true),
    ('cbed8e12-fd2f-4707-9cd0-ee766b8278ee', 'shopee', '987654321', 'https://shopee.vn/product/987654321', 'Tai Nghe Bluetooth Sony WH-1000XM4', 'Electronics', 5990000, 89, 4.9, true),
    ('cbed8e12-fd2f-4707-9cd0-ee766b8278ee', 'lazada', '456789123', 'https://lazada.vn/product/456789123', 'Kem Dưỡng Da La Roche-Posay', 'Beauty & Personal Care', 450000, 567, 4.7, true)
ON CONFLICT (user_id, platform, product_id) DO NOTHING;

-- Insert sample product snapshots (historical data)
INSERT INTO product_snapshots (tracked_product_id, price, sales_count, rating, reviews_count, snapshot_date)
SELECT
    tp.id,
    tp.current_price - (RANDOM() * 50000)::integer, -- Random price variation
    tp.current_sales - (RANDOM() * 100)::integer,   -- Random sales variation
    tp.current_rating - (RANDOM() * 0.5)::numeric(3,2), -- Random rating variation
    (tp.current_sales * 0.1)::integer, -- Estimated reviews
    CURRENT_DATE - (n || ' days')::interval
FROM tracked_products tp
CROSS JOIN generate_series(0, 29) n -- Last 30 days
WHERE tp.user_id = 'cbed8e12-fd2f-4707-9cd0-ee766b8278ee';

-- Insert sample AI insights
INSERT INTO ai_insights (user_id, tracked_product_id, insight_type, title, description, confidence_score, priority, status)
SELECT
    tp.user_id,
    tp.id,
    CASE (RANDOM() * 4)::integer
        WHEN 0 THEN 'opportunity'
        WHEN 1 THEN 'warning'
        WHEN 2 THEN 'trend'
        WHEN 3 THEN 'recommendation'
        ELSE 'action'
    END,
    CASE (RANDOM() * 4)::integer
        WHEN 0 THEN 'Giá sản phẩm đang giảm 15% so với tháng trước'
        WHEN 1 THEN 'Doanh số tăng đột biến, có thể hết hàng'
        WHEN 2 THEN 'Xu hướng giá đang giảm dần trong 2 tuần qua'
        WHEN 3 THEN 'Khuyến nghị giảm giá để tăng doanh số'
        ELSE 'Cần theo dõi đối thủ cạnh tranh'
    END,
    CASE (RANDOM() * 4)::integer
        WHEN 0 THEN 'Giá sản phẩm của bạn đang có xu hướng giảm 15% so với tháng trước. Đây có thể là cơ hội để tăng doanh số bằng cách giảm giá hoặc chạy chương trình khuyến mãi.'
        WHEN 1 THEN 'Doanh số sản phẩm tăng 200% trong tuần qua. Bạn nên kiểm tra tồn kho và chuẩn bị nhập thêm hàng để tránh hết hàng.'
        WHEN 2 THEN 'Trong 2 tuần qua, giá sản phẩm có xu hướng giảm dần. Bạn nên theo dõi thêm để có chiến lược giá phù hợp.'
        WHEN 3 THEN 'Dựa trên dữ liệu thị trường, khuyến nghị giảm giá 10-15% để tăng 30-50% doanh số trong tháng tới.'
        ELSE 'Một số đối thủ đang giảm giá sản phẩm tương tự. Bạn nên theo dõi và điều chỉnh chiến lược giá bán.'
    END,
    (RANDOM() * 0.5 + 0.5)::numeric(3,2), -- Confidence 0.5-1.0
    CASE (RANDOM() * 3)::integer
        WHEN 0 THEN 'high'
        WHEN 1 THEN 'medium'
        ELSE 'low'
    END,
    'active'
FROM tracked_products tp
WHERE tp.user_id = 'cbed8e12-fd2f-4707-9cd0-ee766b8278ee'
LIMIT 5;

-- Insert sample competitors
INSERT INTO competitors (tracked_product_id, competitor_url, competitor_name, competitor_platform, latest_price, latest_sales, is_active)
SELECT
    tp.id,
    CASE tp.platform
        WHEN 'shopee' THEN 'https://shopee.vn/competitor-' || (RANDOM() * 1000)::integer
        WHEN 'lazada' THEN 'https://lazada.vn/competitor-' || (RANDOM() * 1000)::integer
        ELSE 'https://tiki.vn/competitor-' || (RANDOM() * 1000)::integer
    END,
    'Đối thủ ' || (RANDOM() * 100)::integer,
    tp.platform,
    tp.current_price + (RANDOM() * 100000 - 50000)::integer, -- Price variation
    (tp.current_sales * (RANDOM() * 0.5 + 0.5))::integer, -- Sales variation
    true
FROM tracked_products tp
WHERE tp.user_id = 'cbed8e12-fd2f-4707-9cd0-ee766b8278ee';

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, channel, is_read)
SELECT
    tp.user_id,
    'price_alert',
    'Giá sản phẩm thay đổi',
    'Giá của sản phẩm "' || tp.product_name || '" đã thay đổi -' || (RANDOM() * 10 + 5)::integer || '%',
    'in_app',
    CASE WHEN RANDOM() > 0.5 THEN true ELSE false END
FROM tracked_products tp
WHERE tp.user_id = 'cbed8e12-fd2f-4707-9cd0-ee766b8278ee'
LIMIT 3;

-- Insert sample alert rules
INSERT INTO alert_rules (user_id, tracked_product_id, rule_type, rule_name, conditions, notification_channels, is_active)
SELECT
    tp.user_id,
    tp.id,
    'price_drop',
    'Cảnh báo giảm giá',
    jsonb_build_object('price_drop_percent', (RANDOM() * 20 + 5)::integer),
    '["email", "in_app"]'::jsonb,
    true
FROM tracked_products tp
WHERE tp.user_id = 'cbed8e12-fd2f-4707-9cd0-ee766b8278ee';

-- Insert sample API usage
INSERT INTO api_usage (user_id, endpoint, method, request_count, usage_date)
SELECT
    'cbed8e12-fd2f-4707-9cd0-ee766b8278ee',
    '/api/products',
    'GET',
    (RANDOM() * 50 + 10)::integer,
    CURRENT_DATE - (n || ' days')::interval
FROM generate_series(0, 6) n; -- Last 7 days

-- ============================================
-- COMPLETE SEED DATA
-- ============================================

-- Reset daily AI queries for demo
UPDATE profiles
SET ai_queries_used_today = 0,
    last_query_reset_date = CURRENT_DATE
WHERE id = 'cbed8e12-fd2f-4707-9cd0-ee766b8278ee';

COMMENT ON TABLE product_categories IS 'Product categories for reference and analytics';
