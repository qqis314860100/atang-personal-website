# 🚨 数据库安全警告

## 危险命令

### ❌ 永远不要使用这些命令：

```bash
# 这些命令会删除所有数据！
npx prisma db push --force-reset
npx prisma migrate reset
```

### ✅ 使用安全的命令：

```bash
# 安全的数据库推送
npm run db:push

# 如果需要重置（需要确认）
npm run db:push:force
```

## 安全措施

### 1. 使用安全脚本

- 使用 `npm run db:push` 而不是直接使用 `npx prisma db push`
- 使用 `npm run db:push:force` 来重置数据库（需要确认）

### 2. 备份策略

- 定期导出 schema：`npx prisma db pull`
- 手动备份重要数据
- 考虑升级到 Supabase Pro Plan 获得自动备份

### 3. 开发环境

- 在测试环境中先验证操作
- 使用本地数据库进行测试

## 恢复数据

如果不小心删除了数据：

1. **检查 Supabase Dashboard** 是否有备份
2. **升级到 Pro Plan** 获得备份功能
3. **联系 Supabase 支持**

## 紧急联系

如果遇到问题，请：

1. 不要执行任何其他命令
2. 立即联系团队
3. 记录错误信息
