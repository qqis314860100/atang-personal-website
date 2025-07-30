# localStorage 优化说明

## 优化前的问题

项目中有两个 localStorage key：

- `user-cache`：手动管理，用于 React Query 和 SessionProvider
- `user-storage`：Zustand 自动管理，用于全局状态持久化

这导致了数据冗余和同步问题。

## 优化后的方案

### 只使用一个 key：`user-storage`

1. **Zustand 管理**：所有用户状态都通过 `useUserStore` 管理，自动持久化到 `user-storage`
2. **React Query 兜底**：`useCurrentUser` 的 `initialData` 从 `user-storage` 读取
3. **SessionProvider 同步**：登录/登出时只更新 React Query 缓存，Zustand 会自动同步

### 数据流程

```
用户登录 → SessionProvider → React Query 缓存 → useStableUser → Zustand 同步 → localStorage (user-storage)
页面切换 → useStableUser → 优先读取 Zustand → 兜底读取 React Query → 无网络请求
```

### 优势

- ✅ **单一数据源**：只有一个 localStorage key
- ✅ **自动同步**：Zustand 自动处理持久化
- ✅ **无重复请求**：页面切换时优先使用本地状态
- ✅ **兜底机制**：React Query 提供网络数据兜底

### 清理旧数据

如果发现旧的 `user-cache`，可以在浏览器控制台运行：

```javascript
// 删除旧的 user-cache
localStorage.removeItem('user-cache')
console.log('旧的 user-cache 已删除')
```

### 验证

1. 登录后检查 localStorage，应该只有 `user-storage`
2. 切换页面时，用户状态应该立即显示，无闪烁
3. 刷新页面后，用户状态应该立即恢复
