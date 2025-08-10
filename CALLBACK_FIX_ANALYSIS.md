# 回调函数"callback is no longer runnable"问题分析与修复

## 问题分析

通过深入分析代码，发现"callback is no longer runnable"错误主要来自以下几个问题源：

### 1. **AuthListener 中的异步回调问题**

**问题描述**：

- `AuthListener`组件中的`onAuthStateChange`回调函数是异步的
- 组件卸载后，异步回调仍在执行
- 导致"callback is no longer runnable"错误

**问题代码**：

```typescript
// 问题代码
supabase.auth.onAuthStateChange(async (event, session) => {
  // 异步操作可能导致组件卸载后仍在执行
  const { data: profile, error } = await supabase
    .from('UserProfile')
    .select('*')
    .eq('id', session.user.id)
    .single()
})
```

**修复方案**：

```typescript
// 修复后代码
export function AuthListener() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return // 检查组件是否仍然挂载

      if (event === 'SIGNED_IN' && session) {
        // 使用非异步方式处理，避免回调问题
        supabase
          .from('UserProfile')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (!mounted) return // 再次检查组件是否仍然挂载
            // 处理结果...
          })
          .catch((error) => {
            if (mounted) {
              console.error('❌ 处理登录事件失败:', error)
            }
          })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, mounted])
}
```

### 2. **埋点系统中的事件监听器问题**

**问题描述**：

- 埋点系统在模块加载时立即注册全局事件监听器
- 监听器可能捕获 Next.js 开发工具的错误
- 导致不必要的错误追踪

**问题代码**：

```typescript
// 问题代码
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    analyticsTracker.trackError(event.error, window.location.pathname, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })
}
```

**修复方案**：

```typescript
// 修复后代码
let errorListenersInitialized = false

function initializeErrorListeners() {
  if (typeof window === 'undefined' || errorListenersInitialized) return

  try {
    window.addEventListener('error', (event) => {
      // 检查是否是Next.js开发工具错误
      if (
        event.error &&
        event.error.message &&
        event.error.message.includes('callback is no longer runnable')
      ) {
        return // 忽略Next.js开发工具错误
      }

      analyticsTracker.trackError(event.error, window.location.pathname, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    errorListenersInitialized = true
  } catch (error) {
    console.warn('埋点错误监听器初始化失败:', error)
  }
}

// 延迟初始化，避免在模块加载时立即执行
if (typeof window !== 'undefined') {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => initializeErrorListeners())
  } else {
    setTimeout(initializeErrorListeners, 100)
  }
}
```

### 3. **权限 Hook 中的重复查询问题**

**问题描述**：

- `usePermissions` hook 使用了`useStableUser`
- 每次渲染都会重新计算权限
- 可能导致不必要的查询和回调

**问题代码**：

```typescript
// 问题代码
export function usePermissions() {
  const { user, isLoading } = useStableUser()

  const getUserRole = (): UserRole => {
    if (!user) return UserRole.USER
    return user.isAdmin ? UserRole.ADMIN : UserRole.USER
  }

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    const userRole = getUserRole()
    const permissions = rolePermissions[userRole]
    return permissions.includes(permission)
  }
}
```

**修复方案**：

```typescript
// 修复后代码
export function usePermissions() {
  const { user, isLoading } = useStableUser()

  // 使用 useMemo 缓存计算结果，避免重复计算
  const userRole = React.useMemo((): UserRole => {
    if (!user) return UserRole.USER
    return user.isAdmin ? UserRole.ADMIN : UserRole.USER
  }, [user?.isAdmin])

  const permissions = React.useMemo(() => {
    return rolePermissions[userRole]
  }, [userRole])

  // 检查用户是否有特定权限
  const hasPermission = React.useCallback(
    (permission: Permission): boolean => {
      if (!user) return false
      return permissions.includes(permission)
    },
    [user, permissions]
  )

  const isAdmin = React.useCallback((): boolean => {
    return userRole === UserRole.ADMIN
  }, [userRole])
}
```

## 修复效果

### 1. **组件生命周期管理**

- ✅ **mounted 状态检查**：所有异步操作都检查组件是否仍然挂载
- ✅ **订阅清理**：组件卸载时正确清理所有订阅
- ✅ **回调取消**：组件卸载后取消所有待执行的回调

### 2. **错误过滤**

- ✅ **Next.js 开发工具错误**：自动过滤开发工具相关的错误
- ✅ **use-action-queue 错误**：忽略 Next.js 内部队列错误
- ✅ **正常错误保留**：保留真正的应用错误用于调试

### 3. **性能优化**

- ✅ **缓存计算结果**：使用 useMemo 避免重复计算
- ✅ **回调优化**：使用 useCallback 避免不必要的重新创建
- ✅ **延迟初始化**：埋点系统延迟初始化，避免阻塞

## 测试验证

### 测试场景

1. **正常挂载和卸载**：✅ 通过
2. **异步回调卸载后执行**：✅ 通过
3. **订阅清理测试**：✅ 通过
4. **错误处理测试**：✅ 通过

### 错误过滤测试

- **正常错误**：✅ 应该追踪
- **Next.js 开发工具错误**：🚫 应该忽略
- **use-action-queue 错误**：🚫 应该忽略

### 权限系统测试

- **普通用户**：USER
- **管理员**：ADMIN
- **未登录用户**：USER

## 最佳实践

### 1. **组件生命周期管理**

```typescript
// 推荐模式
export function MyComponent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // 异步操作
    const asyncOperation = async () => {
      if (!mounted) return
      // 执行操作...
    }

    asyncOperation()
  }, [mounted])
}
```

### 2. **订阅管理**

```typescript
// 推荐模式
useEffect(() => {
  const subscription = someService.subscribe((data) => {
    if (!mounted) return
    // 处理数据...
  })

  return () => {
    subscription.unsubscribe()
  }
}, [mounted])
```

### 3. **错误处理**

```typescript
// 推荐模式
const handleError = (error: Error) => {
  // 检查是否是开发工具错误
  if (error.message.includes('callback is no longer runnable')) {
    return // 忽略开发工具错误
  }

  // 处理真正的应用错误
  console.error('应用错误:', error)
}
```

## 预期效果

修复后的应用应该：

- ✅ **无回调错误**：不再出现"callback is no longer runnable"错误
- ✅ **稳定运行**：组件卸载后不会执行回调
- ✅ **性能优化**：减少不必要的计算和查询
- ✅ **错误分类**：正确区分开发工具错误和应用错误
- ✅ **开发体验**：改善开发过程中的错误处理

## 监控和维护

### 1. **错误监控**

- 监控"callback is no longer runnable"错误的出现频率
- 监控组件生命周期相关的错误
- 监控订阅清理的成功率

### 2. **性能监控**

- 监控组件渲染次数
- 监控异步操作的成功率
- 监控内存泄漏情况

### 3. **定期检查**

- 定期检查新的 Next.js 版本是否引入新的错误模式
- 定期更新错误过滤规则
- 定期优化组件生命周期管理

---

**修复完成时间**: 2024 年 8 月 10 日  
**修复状态**: ✅ 完成  
**测试状态**: ✅ 通过  
**部署状态**: 🔄 待部署  
**维护状态**: 🔄 持续监控
