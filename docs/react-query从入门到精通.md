我来为你详细介绍 React Query 的常用 API 和属性，从入门到精通的学习路径。

## 1. React Query 核心概念

### 什么是 React Query？

React Query 是一个用于管理服务器状态的库，它解决了以下问题：

- 数据获取和缓存
- 后台数据同步
- 错误处理
- 乐观更新
- 分页和无限滚动

### 核心概念

- **Query**: 用于获取数据的操作
- **Mutation**: 用于修改数据的操作
- **Query Client**: 管理所有查询和缓存的实例
- **Query Key**: 唯一标识查询的键值
  作用:
  -- 统一管理：所有查询键都在一个地方定义
  -- 类型安全：使用 TypeScript 确保键的类型正确
  -- 避免重复：防止在不同组件中写重复的键
  -- 易于维护：修改键结构时只需要改一个地方
  好处:
  序列化存储：将查询键序列化为字符串作为 Map 的键
  前缀匹配：使用数组前缀匹配来判断层级关系
  共享结构：优化内存使用，共享相同的键前缀
  批量操作：通过层级匹配实现批量失效和更新
  性能优化：查询去重、后台更新、智能缓存

```js
// React Query 内部的缓存结构（简化版）
const queryCache = new Map()

// 实际结构类似这样：
{
  // 查询键: ['user']
  "['user']": {
    data: UserData,
    status: 'success',
    dataUpdatedAt: 1234567890,
    // ... 其他元数据
  },

  // 查询键: ['user', 'profile']
  "['user','profile']": {
    data: UserProfileData,
    status: 'success',
    dataUpdatedAt: 1234567890,
    // ... 其他元数据
  }
}
```

## 2. 基础 API 和属性

### useQuery - 数据查询

```tsx
import { useQuery } from '@tanstack/react-query'

// 基础用法
const { data, isLoading, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})

// 带参数的查询
const { data: todo } = useQuery({
  queryKey: ['todo', id],
  queryFn: () => fetchTodoById(id),
  enabled: !!id, // 只有当 id 存在时才执行查询
})
```

**常用属性：**

```tsx
const {
  data, // 查询返回的数据
  isLoading, // 是否正在加载（首次加载）
  isFetching, // 是否正在获取数据（包括后台刷新）
  isError, // 是否有错误
  error, // 错误对象
  isSuccess, // 是否成功
  isIdle, // 是否空闲（enabled: false 时）
  status, // 状态：'idle' | 'loading' | 'success' | 'error'
  fetchStatus, // 获取状态：'idle' | 'fetching' | 'paused'
  refetch, // 手动重新获取数据的函数
  remove, // 从缓存中移除查询
} = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,

  // 配置选项
  enabled: true, // 是否启用查询
  retry: 3, // 失败重试次数
  retryDelay: 1000, // 重试延迟（毫秒）
  staleTime: 5 * 60 * 1000, // 数据保持新鲜的时间
  gcTime: 10 * 60 * 1000, // 垃圾回收时间（原 cacheTime）
  refetchOnWindowFocus: true, // 窗口聚焦时是否重新获取
  refetchOnMount: true, // 组件挂载时是否重新获取
  refetchOnReconnect: true, // 网络重连时是否重新获取
  refetchInterval: 5000, // 轮询间隔（毫秒）
  refetchIntervalInBackground: false, // 后台是否继续轮询
  select: (data) => data.filter((todo) => !todo.completed), // 数据转换
  placeholderData: [], // 占位数据
  initialData: [], // 初始数据
  onSuccess: (data) => console.log('查询成功', data),
  onError: (error) => console.log('查询失败', error),
  onSettled: (data, error) => console.log('查询完成'),
})
```

### useMutation - 数据变更

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: (data, variables, context) => {
    // 成功后使相关查询失效
    queryClient.invalidateQueries({ queryKey: ['todos'] })
    console.log('创建成功', data)
  },
  onError: (error, variables, context) => {
    console.log('创建失败', error)
  },
  onMutate: async (newTodo) => {
    // 乐观更新
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData(['todos'])

    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    return { previousTodos }
  },
  onSettled: (data, error, variables, context) => {
    // 无论成功失败都执行
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})

// 使用 mutation
const handleCreate = async () => {
  try {
    await mutation.mutateAsync({ title: '新任务' })
  } catch (error) {
    console.error('创建失败', error)
  }
}
```

**Mutation 属性：**

```tsx
const {
  mutate, // 触发变更的函数
  mutateAsync, // 返回 Promise 的变更函数
  data, // 变更返回的数据
  error, // 错误对象
  isError, // 是否有错误
  isSuccess, // 是否成功
  isPending, // 是否正在执行（v5 中替代 isLoading）
  status, // 状态：'idle' | 'pending' | 'success' | 'error'
  reset, // 重置 mutation 状态
} = useMutation({
  mutationFn: createTodo,
  retry: 1, // 失败重试次数
  retryDelay: 1000, // 重试延迟
  onMutate: async (variables) => {
    // 乐观更新逻辑
  },
  onSuccess: (data, variables, context) => {
    // 成功回调
  },
  onError: (error, variables, context) => {
    // 错误回调
  },
  onSettled: (data, error, variables, context) => {
    // 完成回调
  },
})
```

## 3. 高级功能

### 查询键管理

```tsx
// 基础查询键
const queryKeys = {
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (filters: string) =>
      [...queryKeys.todos.lists(), { filters }] as const,
    details: () => [...queryKeys.todos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.todos.details(), id] as const,
  },
  users: {
    all: ['users'] as const,
    profile: (id: string) => [...queryKeys.users.all, 'profile', id] as const,
  },
}

// 使用查询键
const { data: todos } = useQuery({
  queryKey: queryKeys.todos.list('completed'),
  queryFn: () => fetchTodos('completed'),
})

const { data: user } = useQuery({
  queryKey: queryKeys.users.profile(userId),
  queryFn: () => fetchUserProfile(userId),
})
```

### 查询客户端操作

```tsx
import { useQueryClient } from '@tanstack/react-query'

function MyComponent() {
  const queryClient = useQueryClient()

  // 使查询失效
  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  // 设置查询数据
  const setQueryData = () => {
    queryClient.setQueryData(['todos'], (old) => [
      ...old,
      { id: 999, title: '新任务', completed: false },
    ])
  }

  // 获取查询数据
  const getQueryData = () => {
    const todos = queryClient.getQueryData(['todos'])
    console.log('当前 todos:', todos)
  }

  // 预取数据
  const prefetchQuery = () => {
    queryClient.prefetchQuery({
      queryKey: ['todos'],
      queryFn: fetchTodos,
    })
  }

  // 取消查询
  const cancelQueries = () => {
    queryClient.cancelQueries({ queryKey: ['todos'] })
  }

  // 移除查询
  const removeQueries = () => {
    queryClient.removeQueries({ queryKey: ['todos'] })
  }

  return (
    <div>
      <button onClick={invalidateQueries}>刷新数据</button>
      <button onClick={setQueryData}>设置数据</button>
      <button onClick={getQueryData}>获取数据</button>
      <button onClick={prefetchQuery}>预取数据</button>
    </div>
  )
}
```

### 乐观更新

```tsx
const updateTodoMutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 保存之前的数据
    const previousTodos = queryClient.getQueryData(['todos'])

    // 乐观更新
    queryClient.setQueryData(['todos'], (old) =>
      old.map((todo) => (todo.id === newTodo.id ? newTodo : todo))
    )

    // 返回上下文对象
    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    // 如果出错，回滚到之前的状态
    if (context?.previousTodos) {
      queryClient.setQueryData(['todos'], context.previousTodos)
    }
  },
  onSettled: () => {
    // 无论成功还是失败，都重新获取数据确保同步
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### 无限查询

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
} = useInfiniteQuery({
  queryKey: ['todos'],
  queryFn: ({ pageParam = 0 }) => fetchTodos(pageParam),
  getNextPageParam: (lastPage, pages) => {
    // 返回下一页的参数，如果没有更多数据返回 undefined
    return lastPage.hasMore ? pages.length : undefined
  },
  initialPageParam: 0,
})

// 渲染无限列表
return (
  <div>
    {data?.pages.map((page, i) => (
      <div key={i}>
        {page.todos.map((todo) => (
          <div key={todo.id}>{todo.title}</div>
        ))}
      </div>
    ))}

    {hasNextPage && (
      <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
        {isFetchingNextPage ? '加载中...' : '加载更多'}
      </button>
    )}
  </div>
)
```

## 4. 实际应用场景

### 场景 1：用户认证状态管理

```tsx
// hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, // 5分钟内数据保持新鲜
    retry: false, // 认证失败不重试
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (user) => {
      // 登录成功后设置用户数据
      queryClient.setQueryData(['user'], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // 登出后清除用户数据
      queryClient.setQueryData(['user'], null)
      queryClient.clear() // 清除所有缓存
    },
  })
}
```

### 场景 2：表单提交

```tsx
// components/UserForm.tsx
import { useMutation } from '@tanstack/react-query'

export function UserForm() {
  const updateUser = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      toast.success('用户资料更新成功')
    },
    onError: (error) => {
      toast.error('更新失败：' + error.message)
    },
  })

  const handleSubmit = async (data) => {
    try {
      await updateUser.mutateAsync(data)
    } catch (error) {
      // 错误已在 onError 中处理
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <input name="email" />
      <button type="submit" disabled={updateUser.isPending}>
        {updateUser.isPending ? '更新中...' : '更新'}
      </button>
    </form>
  )
}
```

### 场景 3：实时数据同步

```tsx
// hooks/useRealtimeData.ts
export function useRealtimeTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    refetchInterval: 30000, // 每30秒刷新一次
    refetchIntervalInBackground: true, // 后台也继续刷新
  })
}

// 或者使用 WebSocket
export function useWebSocketTodos() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/todos')

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // 实时更新缓存
      queryClient.setQueryData(['todos'], data)
    }

    return () => ws.close()
  }, [queryClient])

  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

## 5. 性能优化技巧

### 1. 合理设置 staleTime 和 gcTime

```tsx
// 频繁变化的数据
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  staleTime: 0, // 立即过期
  gcTime: 5 * 60 * 1000, // 5分钟后从缓存移除
})

// 相对静态的数据
const { data: userProfile } = useQuery({
  queryKey: ['user', 'profile'],
  queryFn: fetchUserProfile,
  staleTime: 10 * 60 * 1000, // 10分钟内数据保持新鲜
  gcTime: 30 * 60 * 1000, // 30分钟后从缓存移除
})
```

### 2. 使用 select 进行数据转换

```tsx
const { data: completedTodos } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.filter((todo) => todo.completed),
})

// 避免在组件中进行数据转换
// ❌ 错误做法
const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
const completedTodos = todos?.filter((todo) => todo.completed)

// ✅ 正确做法
const { data: completedTodos } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => todos.filter((todo) => todo.completed),
})
```

### 3. 预取数据

```tsx
// 在用户悬停时预取数据
function TodoList() {
  const queryClient = useQueryClient()

  const prefetchTodo = (id) => {
    queryClient.prefetchQuery({
      queryKey: ['todo', id],
      queryFn: () => fetchTodoById(id),
    })
  }

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id} onMouseEnter={() => prefetchTodo(todo.id)}>
          {todo.title}
        </div>
      ))}
    </div>
  )
}
```

## 6. 错误处理和调试

### 全局错误处理

```tsx
// lib/react-query.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 自定义重试逻辑
        if (error.status === 404) return false // 404 不重试
        if (failureCount < 2) return true // 其他错误重试2次
        return false
      },
      onError: (error) => {
        // 全局错误处理
        console.error('查询错误:', error)
        toast.error('数据加载失败')
      },
    },
    mutations: {
      onError: (error) => {
        console.error('变更错误:', error)
        toast.error('操作失败')
      },
    },
  },
})
```

### 使用 React Query Devtools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}
```

## 7. 最佳实践总结

### 1. 查询键命名规范

```tsx
// ✅ 好的命名
;['todos', { status: 'completed', userId: 123 }][('user', 'profile', userId)][
  ('posts', { category: 'tech', page: 1 })
][
  // ❌ 避免的命名
  'data'
]['list']['items']
```

### 2. 错误处理策略

```tsx
// 在 hooks 中统一处理错误
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    onError: (error) => {
      toast.error('获取任务列表失败')
      console.error('Todos query error:', error)
    },
  })
}
```

### 3. 加载状态管理

```tsx
// 区分不同的加载状态
const { data, isLoading, isFetching } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})

// isLoading: 首次加载，显示骨架屏
// isFetching: 后台刷新，显示加载指示器
return (
  <div>
    {isLoading ? (
      <Skeleton />
    ) : (
      <>
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
        {isFetching && <LoadingIndicator />}
      </>
    )}
  </div>
)
```

### 4. 缓存策略

```tsx
// 根据数据特性设置缓存策略
const cacheConfig = {
  // 用户资料：长时间缓存
  userProfile: { staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 },

  // 实时数据：短时间缓存
  notifications: { staleTime: 0, gcTime: 5 * 60 * 1000 },

  // 静态数据：长时间缓存
  categories: { staleTime: 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 },
}
```

通过以上学习，你应该能够从入门到精通地使用 React Query。记住，React Query 的核心是让服务器状态管理变得简单和高效，重点是理解其缓存机制和状态管理策略。
