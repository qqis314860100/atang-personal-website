# 方案二：预加载 + 骨架屏实现文档

## 概述

方案二通过**预加载用户状态 + 骨架屏**的方式解决页面刷新时的状态闪烁问题。在应用启动时预加载用户状态，同时显示美观的骨架屏，确保数据加载完成后再渲染实际内容。

## 实现组件

### 1. UserStatePreloader 组件

**位置**: `components/provider/UserStatePreloader.tsx`

**功能**:

- 在应用启动时预加载用户状态
- 显示骨架屏直到用户状态加载完成
- 确保 Zustand 和 React Query 状态同步
- 避免阻塞应用，即使加载失败也会继续

**核心逻辑**:

```typescript
const [isPreloaded, setIsPreloaded] = useState(false)
const { user, isLoading, error } = useStableUser()
const { syncWithReactQuery } = useUserStore()

useEffect(() => {
  const preloadUserState = async () => {
    if (!isLoading) {
      syncWithReactQuery(user)
      setIsPreloaded(true)
    }
  }
  preloadUserState()
}, [user, isLoading, syncWithReactQuery])
```

### 2. SkeletonScreen 组件

**位置**: `components/ui/skeleton-screen.tsx`

**功能**:

- 提供完整的页面骨架屏
- 包含导航栏、主内容区、底部的骨架屏
- 可复用的 Skeleton 组件
- 美观的加载动画和遮罩层

**特性**:

- 响应式设计，适配不同屏幕尺寸
- 暗色模式支持
- 可自定义内容
- 可控制遮罩层显示

### 3. Skeleton 组件

**功能**:

- 基础的骨架屏元素
- 支持自定义样式
- 统一的动画效果

## 集成方式

### 根布局集成

在 `app/[locale]/layout.tsx` 中集成 UserStatePreloader：

```typescript
<QueryProvider>
  <SessionProvider>
    <ThemeProvider>
      <NextIntlClientProvider>
        <UserStatePreloader>
          {/* 所有页面内容 */}
          <div className="flex w-full flex-col">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </UserStatePreloader>
      </NextIntlClientProvider>
    </ThemeProvider>
  </SessionProvider>
</QueryProvider>
```

### 移除 Dynamic 导入

由于有了预加载机制，可以移除之前的 dynamic 导入：

- `components/Logon.tsx`: 移除 `ssr: false` 配置
- `components/debug/UserStateDebugger.tsx`: 移除 `ssr: false` 配置

## 用户体验优化

### 1. 视觉反馈

- **骨架屏**: 提供页面结构的视觉预览
- **加载动画**: 平滑的脉冲动画效果
- **遮罩层**: 半透明背景 + 加载指示器

### 2. 状态管理

- **预加载**: 在显示内容前完成状态加载
- **同步**: Zustand 和 React Query 状态同步
- **兜底**: 加载失败时仍能正常使用应用

### 3. 性能优化

- **非阻塞**: 不会阻塞应用的其他功能
- **缓存**: 利用 React Query 的缓存机制
- **本地存储**: 利用 Zustand 的持久化

## 优势

1. **用户体验好**: 有明确的加载反馈，不会出现空白页面
2. **视觉一致性**: 骨架屏与最终页面结构一致
3. **状态稳定**: 预加载确保状态在渲染前就准备好
4. **可复用**: 骨架屏组件可以在其他页面复用
5. **渐进增强**: 即使加载失败也能正常使用

## 缺点

1. **额外组件**: 需要额外的骨架屏组件
2. **初始延迟**: 需要等待用户状态加载完成
3. **复杂性**: 增加了状态管理的复杂性

## 调试信息

从控制台日志可以看到：

```
useStableUser - 用户已登录: {
  userId: "d5aa51bd-402c-49eb-9810-243723e3e76f",
  username: "tomtong",
  source: "Zustand (user-storage)"
}
```

这表明：

- 用户状态成功加载
- 数据来源是 Zustand 的本地存储
- 没有出现状态闪烁或重置

## 使用建议

1. **开发环境**: 保留 UserStateDebugger 组件进行调试
2. **生产环境**: 可以移除调试组件
3. **自定义**: 可以根据具体页面定制骨架屏
4. **性能**: 监控用户状态加载时间，必要时优化

## 后续优化

1. **预取策略**: 可以在用户访问前预取相关数据
2. **缓存优化**: 优化 React Query 的缓存策略
3. **错误处理**: 增强加载失败时的用户体验
4. **动画优化**: 优化骨架屏的动画效果
