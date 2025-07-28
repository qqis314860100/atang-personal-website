-- 检查重置后的表结构

-- 1. 检查所有表
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. 检查 PDFAnnotation 表结构
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. 检查 RLS 状态
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename; 