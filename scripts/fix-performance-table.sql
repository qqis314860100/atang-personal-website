-- 修复 PerformanceMetric 表结构
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 检查当前表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'PerformanceMetric'
ORDER BY ordinal_position;

-- 2. 添加缺失的列（如果不存在）
DO $$ 
BEGIN
    -- 添加 interaction_to_next_paint 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PerformanceMetric' 
        AND column_name = 'interaction_to_next_paint'
    ) THEN
        ALTER TABLE "PerformanceMetric" 
        ADD COLUMN interaction_to_next_paint NUMERIC;
        RAISE NOTICE 'Added interaction_to_next_paint column';
    END IF;

    -- 添加 time_to_first_byte 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PerformanceMetric' 
        AND column_name = 'time_to_first_byte'
    ) THEN
        ALTER TABLE "PerformanceMetric" 
        ADD COLUMN time_to_first_byte NUMERIC;
        RAISE NOTICE 'Added time_to_first_byte column';
    END IF;

    -- 添加 first_paint 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PerformanceMetric' 
        AND column_name = 'first_paint'
    ) THEN
        ALTER TABLE "PerformanceMetric" 
        ADD COLUMN first_paint NUMERIC;
        RAISE NOTICE 'Added first_paint column';
    END IF;

    -- 添加 total_blocking_time 列
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PerformanceMetric' 
        AND column_name = 'total_blocking_time'
    ) THEN
        ALTER TABLE "PerformanceMetric" 
        ADD COLUMN total_blocking_time NUMERIC;
        RAISE NOTICE 'Added total_blocking_time column';
    END IF;

END $$;

-- 3. 验证表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'PerformanceMetric'
ORDER BY ordinal_position;

-- 4. 插入测试数据（如果表为空）
INSERT INTO "PerformanceMetric" (
  id, page, session_id, user_id, timestamp,
  load_time, dom_content_loaded,
  first_contentful_paint, largest_contentful_paint,
  cumulative_layout_shift, first_input_delay,
  time_to_first_byte, interaction_to_next_paint
) VALUES 
(
  gen_random_uuid(), '/dashboard', 'test-session-1', NULL, NOW() - INTERVAL '1 hour',
  1200, 800, 1100, 1800, 0.05, 150, 600, 200
),
(
  gen_random_uuid(), '/blog', 'test-session-1', NULL, NOW() - INTERVAL '30 minutes',
  2100, 1500, 1800, 2500, 0.12, 200, 800, 300
),
(
  gen_random_uuid(), '/dashboard', 'test-session-2', NULL, NOW() - INTERVAL '15 minutes',
  900, 600, 800, 1200, 0.03, 100, 400, 150
),
(
  gen_random_uuid(), '/about', 'test-session-3', NULL, NOW() - INTERVAL '5 minutes',
  1500, 1000, 1400, 2000, 0.08, 180, 700, 250
)
ON CONFLICT DO NOTHING;

-- 5. 验证数据
SELECT 
  page,
  first_contentful_paint as fcp,
  largest_contentful_paint as lcp,
  cumulative_layout_shift as cls,
  first_input_delay as fid,
  time_to_first_byte as ttfb,
  interaction_to_next_paint as inp,
  timestamp
FROM "PerformanceMetric"
ORDER BY timestamp DESC
LIMIT 10; 