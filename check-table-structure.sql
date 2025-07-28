-- 检查 PDFAnnotation 表的结构
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable,
    is_identity
FROM information_schema.columns 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 检查是否有 uuid-ossp 扩展
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 检查表的约束
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'PDFAnnotation' 
AND table_schema = 'public'; 