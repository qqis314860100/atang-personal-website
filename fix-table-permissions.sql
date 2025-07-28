-- 修复 PDFAnnotation 表的权限问题

-- 1. 检查表的所有者
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'PDFAnnotation';

-- 2. 检查当前用户
SELECT current_user, session_user;

-- 3. 授予所有权限给 postgres 用户（表所有者）
-- 注意：这需要在SQL Editor中执行，使用服务角色权限
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO postgres;

-- 4. 授予所有权限给 authenticated 角色
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO authenticated;

-- 5. 授予所有权限给 anon 角色
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO anon;

-- 6. 授予所有权限给 service_role 角色
GRANT ALL PRIVILEGES ON TABLE "PDFAnnotation" TO service_role;

-- 7. 验证权限
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'PDFAnnotation'
ORDER BY grantee, privilege_type;

-- 8. 测试查询
SELECT COUNT(*) FROM "PDFAnnotation"; 