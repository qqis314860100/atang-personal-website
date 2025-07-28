-- 验证重置后的 PDFAnnotation 表结构
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查索引
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'PDFAnnotation';

-- 检查RLS状态
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE tablename = 'PDFAnnotation';

-- 检查策略
SELECT 
    schemaname,
    tablename,
    policyname
FROM pg_policies 
WHERE tablename = 'PDFAnnotation';

-- 测试插入（应该自动生成ID）
INSERT INTO "PDFAnnotation" (
    "userId", 
    "pdfUrl", 
    "x", 
    "y", 
    "text", 
    "page"
) VALUES (
    'test-user-id',
    'test.pdf',
    100.0,
    200.0,
    'Test annotation',
    1
) RETURNING "id";

-- 清理测试数据
DELETE FROM "PDFAnnotation" WHERE "userId" = 'test-user-id'; 