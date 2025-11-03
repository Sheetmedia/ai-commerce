-- ============================================
-- AI COMMERCE DATABASE SCHEMA
-- Version: 1.0
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Subscription info
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    plan_started_at TIMESTAMP DEFAULT NOW(),
    plan_expires_at TIMESTAMP,
    
    -- Usage limits
    products_limit INTEGER DEFAULT 5,
    ai_queries_limit INTEGER DEFAULT 10,
    ai_queries_used_today INTEGER DEFAULT 0,
    last_query_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    
    -- Settings
    preferences JSONB DEFAULT '{
        "notifications": {"email": true, "push": false},
        "autopilot": {"enabled": false},
        "language": "vi"
    }'::jsonb
);

-- ============================================
-- TRACKED PRODUCTS
-- ============================================
CREATE TABLE public.tracked_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Product identifiers
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('shopee', 'lazada', 'tiktok', 'tiki')),
    product_id VARCHAR(255) NOT NULL,
    product_url TEXT NOT NULL,
    
    -- Product details
    product_name TEXT NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    seller_name VARCHAR(255),
    seller_id VARCHAR(255),
    
    -- Current state (latest snapshot)
    current_price DECIMAL(15,2),
    current_sales INTEGER,
    current_rating DECIMAL(3,2),
    current_reviews INTEGER,
    current_stock INTEGER,
    
    -- Tracking settings
    is_active BOOLEAN DEFAULT TRUE,
    tracking_frequency VARCHAR(20) DEFAULT 'daily' CHECK (tracking_frequency IN ('hourly', 'daily', 'weekly')),
    alert_on_price_change BOOLEAN DEFAULT TRUE,
    alert_on_sales_spike BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_scraped_at TIMESTAMP,
    scrape_count INTEGER DEFAULT 0,
    
    -- Constraints
    UNIQUE(user_id, platform, product_id)
);

-- Index for fast lookups
CREATE INDEX idx_tracked_products_user ON tracked_products(user_id);
CREATE INDEX idx_tracked_products_platform ON tracked_products(platform);
CREATE INDEX idx_tracked_products_active ON tracked_products(is_active) WHERE is_active = TRUE;

-- ============================================
-- PRODUCT SNAPSHOTS (Historical data)
-- ============================================
CREATE TABLE public.product_snapshots (
    id BIGSERIAL PRIMARY KEY,
    tracked_product_id UUID REFERENCES public.tracked_products(id) ON DELETE CASCADE,
    
    -- Snapshot data
    price DECIMAL(15,2) NOT NULL,
    sales_count INTEGER,
    rating DECIMAL(3,2),
    reviews_count INTEGER,
    stock_level INTEGER,
    rank_in_category INTEGER,
    
    -- Calculated fields
    price_change_percent DECIMAL(5,2),
    sales_change_percent DECIMAL(5,2),
    
    -- Additional data
    metadata JSONB DEFAULT '{}'::jsonb, -- flexible for extra platform-specific data
    
    -- Timestamp
    snapshot_date DATE NOT NULL,
    snapshot_time TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicates
    UNIQUE(tracked_product_id, snapshot_date)
);

-- Indexes for time-series queries
CREATE INDEX idx_snapshots_product_date ON product_snapshots(tracked_product_id, snapshot_date DESC);
CREATE INDEX idx_snapshots_time ON product_snapshots(snapshot_time DESC);

-- ============================================
-- COMPETITORS
-- ============================================
CREATE TABLE public.competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracked_product_id UUID REFERENCES public.tracked_products(id) ON DELETE CASCADE,
    
    -- Competitor info
    competitor_url TEXT NOT NULL,
    competitor_name TEXT,
    competitor_platform VARCHAR(50),
    competitor_product_id VARCHAR(255),
    
    -- Latest data
    latest_price DECIMAL(15,2),
    latest_sales INTEGER,
    latest_rating DECIMAL(3,2),
    
    -- Tracking
    is_active BOOLEAN DEFAULT TRUE,
    added_at TIMESTAMP DEFAULT NOW(),
    last_checked_at TIMESTAMP,
    
    UNIQUE(tracked_product_id, competitor_url)
);

CREATE INDEX idx_competitors_product ON competitors(tracked_product_id);

-- ============================================
-- AI INSIGHTS
-- ============================================
CREATE TABLE public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracked_product_id UUID REFERENCES public.tracked_products(id) ON DELETE CASCADE,
    
    -- Insight details
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('opportunity', 'warning', 'trend', 'action', 'recommendation')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- AI metadata
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    ai_model VARCHAR(50) DEFAULT 'claude-sonnet-4',
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    
    -- Priority & Status
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'actioned', 'expired')),
    
    -- Action items (structured)
    action_items JSONB DEFAULT '[]'::jsonb,
    
    -- User interaction
    is_read BOOLEAN DEFAULT FALSE,
    is_starred BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    actioned_at TIMESTAMP,
    
    -- Lifecycle
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Supporting data
    source_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_insights_user_created ON ai_insights(user_id, created_at DESC);
CREATE INDEX idx_insights_product ON ai_insights(tracked_product_id);
CREATE INDEX idx_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_insights_unread ON ai_insights(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_insights_priority ON ai_insights(priority) WHERE status = 'active';

-- ============================================
-- AUTOPILOT ACTIONS LOG
-- ============================================
CREATE TABLE public.autopilot_actions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracked_product_id UUID REFERENCES public.tracked_products(id) ON DELETE CASCADE,
    
    -- Action details
    action_type VARCHAR(50) NOT NULL,
    action_description TEXT,
    action_data JSONB DEFAULT '{}'::jsonb,
    
    -- Execution
    executed_at TIMESTAMP DEFAULT NOW(),
    executed_by VARCHAR(20) DEFAULT 'ai' CHECK (executed_by IN ('ai', 'user', 'scheduled')),
    
    -- Result
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'pending', 'cancelled')),
    result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    
    -- Impact tracking
    expected_impact TEXT,
    actual_impact JSONB
);

CREATE INDEX idx_autopilot_user ON autopilot_actions(user_id);
CREATE INDEX idx_autopilot_product ON autopilot_actions(tracked_product_id);
CREATE INDEX idx_autopilot_time ON autopilot_actions(executed_at DESC);

-- ============================================
-- ALERT RULES
-- ============================================
CREATE TABLE public.alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tracked_product_id UUID REFERENCES public.tracked_products(id) ON DELETE CASCADE,
    
    -- Rule configuration
    rule_type VARCHAR(50) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    conditions JSONB NOT NULL,
    
    -- Examples of conditions:
    -- {"price_drop_percent": 10}
    -- {"competitor_price_lower": true}
    -- {"sales_spike_percent": 50}
    
    -- Notification settings
    notification_channels JSONB DEFAULT '["email"]'::jsonb,
    notification_template TEXT,
    
    -- State
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alert_rules_user ON alert_rules(user_id);
CREATE INDEX idx_alert_rules_active ON alert_rules(is_active) WHERE is_active = TRUE;

-- ============================================
-- API USAGE (for billing & rate limiting)
-- ============================================
CREATE TABLE public.api_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Usage details
    endpoint VARCHAR(255),
    method VARCHAR(10),
    request_count INTEGER DEFAULT 1,
    
    -- Date tracking
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, endpoint, usage_date)
);

CREATE INDEX idx_api_usage_user_date ON api_usage(user_id, usage_date DESC);

-- ============================================
-- NOTIFICATION QUEUE
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Notification content
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Channels
    channel VARCHAR(20) DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email', 'push')),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_unsent ON notifications(is_sent) WHERE is_sent = FALSE;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracked_products_updated_at BEFORE UPDATE ON tracked_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Reset daily AI query limit
CREATE OR REPLACE FUNCTION reset_daily_ai_queries()
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET ai_queries_used_today = 0,
        last_query_reset_date = CURRENT_DATE
    WHERE last_query_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function: Check and enforce product limit
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    user_limit INTEGER;
BEGIN
    -- Get current product count and user limit
    SELECT COUNT(*), p.products_limit
    INTO current_count, user_limit
    FROM tracked_products tp
    JOIN profiles p ON p.id = NEW.user_id
    WHERE tp.user_id = NEW.user_id
      AND tp.is_active = TRUE
    GROUP BY p.products_limit;
    
    -- Check limit
    IF current_count >= user_limit THEN
        RAISE EXCEPTION 'Product limit reached. Upgrade your plan to track more products.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_product_limit
    BEFORE INSERT ON tracked_products
    FOR EACH ROW
    EXECUTE FUNCTION check_product_limit();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Tracked Products: Users can manage their own products
CREATE POLICY "Users can view own products" ON tracked_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON tracked_products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON tracked_products
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON tracked_products
    FOR DELETE USING (auth.uid() = user_id);

-- Product Snapshots: Read-only for users, write for service role
CREATE POLICY "Users can view snapshots of own products" ON product_snapshots
    FOR SELECT USING (
        tracked_product_id IN (
            SELECT id FROM tracked_products WHERE user_id = auth.uid()
        )
    );

-- AI Insights: Users can view/update their insights
CREATE POLICY "Users can view own insights" ON ai_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON ai_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Notifications: Users can view/update their notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for other tables...

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- Add some sample categories for reference
CREATE TABLE public.product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    platform VARCHAR(50),
    parent_id INTEGER REFERENCES product_categories(id),
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO product_categories (name, platform) VALUES
('Fashion & Apparel', 'all'),
('Electronics', 'all'),
('Beauty & Personal Care', 'all'),
('Home & Living', 'all'),
('Sports & Outdoors', 'all'),
('Food & Beverages', 'all');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View: Product performance summary
CREATE OR REPLACE VIEW product_performance_summary AS
SELECT 
    tp.id,
    tp.product_name,
    tp.platform,
    tp.current_price,
    tp.current_sales,
    tp.current_rating,
    
    -- 7-day performance
    (SELECT AVG(price) FROM product_snapshots ps 
     WHERE ps.tracked_product_id = tp.id 
     AND ps.snapshot_date >= CURRENT_DATE - 7) as avg_price_7d,
    
    (SELECT SUM(sales_count) FROM product_snapshots ps 
     WHERE ps.tracked_product_id = tp.id 
     AND ps.snapshot_date >= CURRENT_DATE - 7) as total_sales_7d,
    
    -- Latest insight
    (SELECT title FROM ai_insights ai 
     WHERE ai.tracked_product_id = tp.id 
     ORDER BY created_at DESC LIMIT 1) as latest_insight
    
FROM tracked_products tp
WHERE tp.is_active = TRUE;

-- ============================================
-- COMPLETE!
-- ============================================

COMMENT ON SCHEMA public IS 'AI Commerce Platform Database Schema v1.0';