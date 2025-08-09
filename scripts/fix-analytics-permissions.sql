-- 确保服务角色有完整权限
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 确保认证用户有基本权限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 确保匿名用户有基本权限（用于追踪）
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT ON "PageView" TO anon;
GRANT SELECT, INSERT ON "UserEvent" TO anon;
GRANT SELECT, INSERT ON "PerformanceMetric" TO anon;
GRANT SELECT, INSERT ON "ErrorLog" TO anon;
GRANT SELECT, INSERT ON "UserSession" TO anon;

-- 启用RLS
ALTER TABLE "PageView" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PerformanceMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ErrorLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSession" ENABLE ROW LEVEL SECURITY;

-- 创建简化的RLS策略（允许所有操作）
CREATE POLICY "Allow all operations" ON "PageView" FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON "UserEvent" FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON "PerformanceMetric" FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON "ErrorLog" FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON "UserSession" FOR ALL USING (true); 