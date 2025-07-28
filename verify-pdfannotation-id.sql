-- 验证 PDFAnnotation 表的 ID 默认值

-- 检查 ID 字段的默认值
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
AND column_name = 'id';

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