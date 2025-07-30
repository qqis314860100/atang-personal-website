# React Query 使用指南

本项目已集成 React Query (TanStack Query) 来管理服务器状态和数据请求。

## 配置

### 1. QueryProvider

在 `app/[locale]/layout.tsx` 中已经配置了 QueryProvider：

```tsx
import { QueryProvider } from '@/components/provider/QueryProvider'

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </QueryProvider>
    </SessionProvider>
  )
}
```

### 2. 查询键管理

在 `lib/react-query.ts` 中定义了统一的查询键：

```tsx
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
  posts: {
    all: ['posts'] as const,
    list: () => [...queryKeys.posts.all, 'list'] as const,
    detail: (slug: string) => [...queryKeys.posts.all, 'detail', slug] as const,
  },
}
```

## 自定义 Hooks

### 1. 注释相关 Hooks

#### 获取注释列表

```tsx
import { useAnnotations } from '@/hooks/use-annotations'

function MyComponent() {
  const { data: annotations, isLoading, error } = useAnnotations(pdfUrl)

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div>
      {annotations.map((annotation) => (
        <div key={annotation.id}>{annotation.text}</div>
      ))}
    </div>
  )
}
```

#### 创建注释

```tsx
import { useCreateAnnotation } from '@/hooks/use-annotations'

function CreateAnnotationForm() {
  const createAnnotation = useCreateAnnotation()

  const handleSubmit = async (data) => {
    try {
      await createAnnotation.mutateAsync({
        pdfUrl: 'example.pdf',
        x: 100,
        y: 200,
        text: '这是一个注释',
        page: 1,
      })
    } catch (error) {
      console.error('创建失败:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={createAnnotation.isPending}>
        {createAnnotation.isPending ? '创建中...' : '创建注释'}
      </button>
    </form>
  )
}
```

#### 更新注释

```tsx
import { useUpdateAnnotation } from '@/hooks/use-annotations'

function EditAnnotationForm({ annotation }) {
  const updateAnnotation = useUpdateAnnotation()

  const handleUpdate = async (updates) => {
    try {
      await updateAnnotation.mutateAsync({
        id: annotation.id,
        updates: { text: '更新的文本' },
      })
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  return (
    <button onClick={handleUpdate} disabled={updateAnnotation.isPending}>
      {updateAnnotation.isPending ? '更新中...' : '更新'}
    </button>
  )
}
```

#### 删除注释

```tsx
import { useDeleteAnnotation } from '@/hooks/use-annotations'

function DeleteAnnotationButton({ annotationId }) {
  const deleteAnnotation = useDeleteAnnotation()

  const handleDelete = async () => {
    try {
      await deleteAnnotation.mutateAsync(annotationId)
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleteAnnotation.isPending}>
      {deleteAnnotation.isPending ? '删除中...' : '删除'}
    </button>
  )
}
```

### 2. 用户相关 Hooks

#### 获取用户资料

```tsx
import { useUserProfile } from '@/hooks/use-user'

function UserProfile() {
  const { data: profile, isLoading } = useUserProfile()

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.email}</p>
    </div>
  )
}
```

#### 更新用户资料

```tsx
import { useUpdateUser } from '@/hooks/use-user'

function UpdateProfileForm() {
  const updateUser = useUpdateUser()

  const handleSubmit = async (data) => {
    try {
      await updateUser.mutateAsync(data)
    } catch (error) {
      console.error('更新失败:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? '更新中...' : '更新资料'}
      </button>
    </form>
  )
}
```

### 3. 博客文章相关 Hooks

#### 获取文章列表

```tsx
import { usePosts } from '@/hooks/use-posts'

function PostList() {
  const { data: posts, isLoading } = usePosts(0, 10) // skip=0, take=10

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      {posts?.map((post) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.body}</p>
        </div>
      ))}
    </div>
  )
}
```

## 高级功能

### 1. 乐观更新

使用 `useOptimisticUpdateAnnotation` 可以实现即时 UI 反馈：

```tsx
import { useOptimisticUpdateAnnotation } from '@/hooks/use-annotations'

function OptimisticUpdateExample() {
  const optimisticUpdate = useOptimisticUpdateAnnotation()

  const handleOptimisticUpdate = async (id, updates) => {
    // UI 会立即更新，然后在后台同步到服务器
    await optimisticUpdate.mutateAsync({ id, updates })
  }

  return (
    <button onClick={() => handleOptimisticUpdate('123', { text: '新文本' })}>
      乐观更新
    </button>
  )
}
```

### 2. 查询失效

手动使查询失效以触发重新获取：

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'

function RefreshButton() {
  const queryClient = useQueryClient()

  const handleRefresh = () => {
    // 使所有注释查询失效
    queryClient.invalidateQueries({
      queryKey: queryKeys.annotations.all,
    })
  }

  return <button onClick={handleRefresh}>刷新数据</button>
}
```

### 3. 预取数据

预取数据以提高用户体验：

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'

function PrefetchExample() {
  const queryClient = useQueryClient()

  const handlePrefetch = () => {
    // 预取用户资料
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(),
      queryFn: () => fetchUserProfile(),
    })
  }

  return <button onClick={handlePrefetch}>预取用户资料</button>
}
```

## 开发工具

在开发环境下，React Query Devtools 会自动显示在页面右下角，可以：

- 查看所有查询和变更的状态
- 手动使查询失效
- 查看查询缓存
- 调试查询参数和结果

## 最佳实践

1. **使用查询键工厂**：统一管理查询键，避免重复
2. **合理设置 staleTime**：根据数据更新频率设置合适的过期时间
3. **错误处理**：在 hooks 中统一处理错误，显示用户友好的错误信息
4. **加载状态**：使用 `isLoading` 和 `isPending` 提供良好的用户体验
5. **乐观更新**：对于用户操作，优先使用乐观更新提供即时反馈
6. **查询失效**：在数据变更后及时使相关查询失效

## 配置选项

在 `lib/react-query.ts` 中可以调整全局配置：

```tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟数据保持新鲜
      gcTime: 10 * 60 * 1000, // 10分钟垃圾回收时间
      retry: 1, // 失败重试1次
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    },
    mutations: {
      retry: 1, // 失败重试1次
    },
  },
})
```
