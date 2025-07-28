-- 检查当前用户权限

-- 1. 检查当前用户
SELECT current_user, session_user;

-- 2. 检查当前用户的角色
SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
FROM pg_roles 
WHERE rolname = current_user;

-- 3. 检查对public schema的权限
SELECT 
    grantee,
    schema_name,
    privilege_type,
    is_grantable
FROM information_schema.schema_privileges 
WHERE schema_name = 'public';

-- 4. 检查对表的权限
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
ORDER BY table_name, grantee; 