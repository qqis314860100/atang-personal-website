-- Dashboard 数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建页面浏览记录表
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(100),
  os VARCHAR(100),
  screen_resolution VARCHAR(50),
  language VARCHAR(10)
);

-- 创建用户事件表
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'click', 'scroll', 'form_submit', 'download', 'search')),
  event_name VARCHAR(255) NOT NULL,
  page VARCHAR(255) NOT NULL,
  user_id UUID,
  session_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  properties JSONB DEFAULT '{}',
  value NUMERIC
);

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  page_count INTEGER DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20) CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser VARCHAR(100),
  os VARCHAR(100),
  language VARCHAR(10)
);

-- 创建性能指标表
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  load_time NUMERIC,
  dom_content_loaded NUMERIC,
  first_contentful_paint NUMERIC,
  largest_contentful_paint NUMERIC,
  cumulative_layout_shift NUMERIC,
  first_input_delay NUMERIC,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID
);

-- 创建错误日志表
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  page VARCHAR(255),
  user_id UUID,
  session_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON page_views(page);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON user_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_page ON performance_metrics(page);

CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);

-- 创建每日趋势函数
CREATE OR REPLACE FUNCTION get_daily_trends(start_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
  date DATE,
  page_views BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(pv.timestamp) as date,
    COUNT(*) as page_views,
    COUNT(DISTINCT pv.session_id) as unique_visitors
  FROM page_views pv
  WHERE pv.timestamp >= start_date
  GROUP BY DATE(pv.timestamp)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- 插入一些示例数据
INSERT INTO page_views (page, session_id, user_agent, ip_address, device_type, browser, os, language) VALUES
('/dashboard', 'session-1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.1', 'desktop', 'Chrome', 'Windows', 'zh-CN'),
('/blog', 'session-1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.1', 'desktop', 'Chrome', 'Windows', 'zh-CN'),
('/project', 'session-2', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)', '192.168.1.2', 'mobile', 'Safari', 'iOS', 'zh-CN'),
('/about', 'session-3', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', '192.168.1.3', 'desktop', 'Safari', 'macOS', 'zh-CN');

INSERT INTO user_events (event_type, event_name, page, session_id, properties) VALUES
('click', '导航菜单点击', '/dashboard', 'session-1', '{"element": "nav-menu", "position": "top"}'),
('scroll', '页面滚动', '/blog', 'session-1', '{"depth": 75, "direction": "down"}'),
('form_submit', '搜索提交', '/project', 'session-2', '{"query": "react", "results": 15}'),
('download', '文件下载', '/about', 'session-3', '{"file": "resume.pdf", "size": "2.5MB"}');

INSERT INTO user_sessions (id, started_at, page_count, event_count, ip_address, user_agent, device_type, browser, os, language) VALUES
('session-1', NOW() - INTERVAL '1 hour', 2, 2, '192.168.1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'desktop', 'Chrome', 'Windows', 'zh-CN'),
('session-2', NOW() - INTERVAL '30 minutes', 1, 1, '192.168.1.2', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)', 'mobile', 'Safari', 'iOS', 'zh-CN'),
('session-3', NOW() - INTERVAL '15 minutes', 1, 1, '192.168.1.3', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'desktop', 'Safari', 'macOS', 'zh-CN');

INSERT INTO performance_metrics (page, load_time, dom_content_loaded, first_contentful_paint, session_id) VALUES
('/dashboard', 1.2, 0.8, 1.1, 'session-1'),
('/blog', 2.1, 1.5, 1.8, 'session-1'),
('/project', 1.8, 1.2, 1.6, 'session-2'),
('/about', 0.9, 0.6, 0.8, 'session-3');

-- 启用行级安全策略（RLS）
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- 创建策略允许服务角色访问所有数据
CREATE POLICY "Allow service role full access" ON page_views FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON user_events FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON user_sessions FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON performance_metrics FOR ALL USING (true);
CREATE POLICY "Allow service role full access" ON error_logs FOR ALL USING (true); 