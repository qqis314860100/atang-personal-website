# React Query 集成总结

## 概述

我们成功使用 React Query (TanStack Query) 替换了原有的 Zustand 用户状态管理，实现了更高效的数据获取、缓存和状态管理。

## 主要变更

### 1. 创建了新的 React Query Hooks

#### `lib/reactQuery/use-auth.ts`

- `useCurrentUser()` - 获取当前用户数据
- `useSignIn()` - 用户登录
- `useSignOut()` - 用户登出
- `useRegister()` - 用户注册
- `useResendVerificationEmail()` - 重发验证邮件
- `useForgotPassword()` - 忘记密码
- `useIsAuthenticated()` - 检查用户是否已登录

#### `lib/reactQuery/use-user.ts`

- `useUserSession()` - 获取用户会话
- `useUserProfile()` - 获取用户资料
- `useUpdateUser()` - 更新用户资料

#### `lib/reactQuery/use-annotations.ts`

- `useAnnotations()` - 获取注释列表
- `useCreateAnnotation()` - 创建注释
- `useUpdateAnnotation()` - 更新注释
- `useDeleteAnnotation()` - 删除注释
- `useOptimisticUpdateAnnotation()` - 乐观更新注释

### 2. 更新的组件

#### `components/Logon.tsx`

- 移除了 `useUserStore` 依赖
- 使用 `useCurrentUser()` 获取用户数据
- 使用 `useSignIn()`, `useSignOut()`, `useRegister()` 等 hooks 处理认证
- 简化了状态管理，移除了本地状态变量

#### `components/Header.tsx`

- 替换 `useUserStore` 为 `useCurrentUser()`
- 简化了用户数据获取逻辑

#### `components/provider/SessionProvider.tsx`

- 重写为使用 React Query 缓存管理
- 使用 `queryClient.setQueryData()` 和 `queryClient.removeQueries()` 管理用户状态
- 移除了 Zustand 依赖

#### `app/[locale]/user/profile/page.tsx`

- 使用 `useCurrentUser()` 获取用户数据
- 使用 `useUpdateUser()` 处理用户资料更新
- 移除了本地状态管理

### 3. 查询键结构

```typescript
export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    session: () => [...queryKeys.user.all, 'session'] as const,
  },
  annotations: {
    all: ['annotations'] as const,
    list: (pdfUrl?: string) =>
      [...queryKeys.annotations.all, 'list', pdfUrl] as const,
    detail: (id: string) =>
      [...queryKeys.annotations.all, 'detail', id] as const,
  },
  // ... 其他查询键
}
```

## 优势

### 1. 自动缓存和同步

- React Query 自动缓存数据，减少重复请求
- 多个组件共享相同数据时自动同步
- 智能的缓存失效和重新获取策略

### 2. 更好的错误处理

- 统一的错误处理机制
- 自动重试机制
- 更好的用户体验

### 3. 乐观更新

- 支持乐观更新，提供即时反馈
- 自动回滚失败的更新

### 4. 开发体验

- React Query DevTools 提供强大的调试工具
- 更好的 TypeScript 支持
- 更清晰的代码结构

### 5. 性能优化

- 智能的请求去重
- 后台数据更新
- 减少不必要的重新渲染

## 使用示例

### 获取用户数据

```typescript
const { data: user, isLoading, error } = useCurrentUser()
```

### 用户登录

```typescript
const signInMutation = useSignIn()
const result = await signInMutation.mutateAsync({ data, locale })
```

### 更新用户资料

```typescript
const updateUserMutation = useUpdateUser()
await updateUserMutation.mutateAsync(updateData)
```

### 获取注释列表

```typescript
const { data: annotations, isLoading } = useAnnotations(pdfUrl)
```

## 迁移注意事项

1. **状态管理**: 不再需要手动管理加载状态，React Query 自动处理
2. **错误处理**: 错误处理统一在 hooks 中完成
3. **缓存管理**: 不再需要手动清理状态，React Query 自动管理
4. **数据同步**: 多个组件自动共享相同的数据状态

## 下一步计划

1. 继续迁移其他使用 `useUserStore` 的组件
2. 优化查询键结构
3. 添加更多自定义 hooks
4. 实现更复杂的缓存策略
5. 添加离线支持

## 总结

通过这次集成，我们实现了：

- 更高效的数据管理
- 更好的用户体验
- 更清晰的代码结构
- 更强的类型安全
- 更好的开发体验

React Query 的引入大大简化了我们的状态管理逻辑，提供了更强大和灵活的数据获取解决方案。
