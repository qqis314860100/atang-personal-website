# 回调函数"no longer runnable"问题修复

## 问题描述

用户在上传视频时遇到以下错误：

```
"The provided callback is no longer runnable."
"StorageUnknownError: The provided callback is no longer runnable."
```

这是一个典型的 React 组件卸载后回调函数仍然在执行的问题。

## 问题分析

### 错误原因：

1. **组件卸载后异步操作仍在执行**：

   - 文件上传过程中组件被卸载
   - 状态更新时组件已经不存在
   - 定时器在组件卸载后仍在运行

2. **常见的触发场景**：

   - 用户在上传过程中关闭模态框
   - 页面导航导致组件卸载
   - 组件重新渲染时异步操作冲突

3. **影响的功能**：
   - 文件上传进度更新
   - 视频信息获取
   - 缩略图生成
   - 状态重置

## 修复方案

### 1. 添加 mounted 状态管理

```typescript
const [mounted, setMounted] = useState(false)

// 组件挂载和卸载管理
useEffect(() => {
  setMounted(true)

  return () => {
    setMounted(false)
    // 清理进度定时器
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }
}, [])
```

### 2. 安全的 setState 函数

```typescript
// 安全的setState函数
const safeSetState = (setter: any, value: any) => {
  if (mounted) {
    setter(value)
  }
}
```

### 3. 进度定时器管理

```typescript
const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

// 设置定时器
progressIntervalRef.current = setInterval(() => {
  if (mounted) {
    setUploadProgress((prev) => {
      if (prev >= 90) return prev
      return prev + Math.random() * 10
    })
  }
}, 500)

// 清理定时器
if (progressIntervalRef.current) {
  clearInterval(progressIntervalRef.current)
  progressIntervalRef.current = null
}
```

### 4. 文件选择时的 mounted 检查

```typescript
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file && file.type.startsWith('video/')) {
    if (!mounted) return

    safeSetState(setSelectedFile, file)

    try {
      const info = await simpleVideoThumbnailService.getVideoInfo(file)
      if (mounted) {
        safeSetState(setVideoInfo, info)
      }

      const thumbnailBlob = await simpleVideoThumbnailService.generateThumbnail(
        file,
        {
          time: 1,
          width: 1280,
          height: 720,
          quality: 1,
        }
      )

      const thumbnailBase64 = await simpleVideoThumbnailService.blobToBase64(
        thumbnailBlob
      )

      if (mounted) {
        safeSetState(setThumbnail, thumbnailBase64)
      }

      if (mounted) {
        setVideoDetails((prev) => ({
          ...prev,
          title: fileName,
        }))
        safeSetState(setUploadStep, 'details')
      }
    } catch (error) {
      console.error('处理视频文件失败:', error)
      if (mounted) {
        safeSetState(setUploadStep, 'details')
      }
    }
  }
}
```

### 5. 上传过程中的 mounted 检查

```typescript
const handleCreateVideo = async () => {
  if (!selectedFile || !user || !mounted) return

  safeSetState(setUploadStep, 'processing')
  safeSetState(setUploadProgress, 0)

  try {
    // 上传逻辑...

    if (mounted) {
      safeSetState(setUploadProgress, 100)

      setTimeout(() => {
        if (mounted) {
          // 重置状态
          safeSetState(setSelectedFile, null)
          safeSetState(setVideoDetails, {
            title: '',
            description: '',
            category: '',
            tags: [],
            isPublic: true,
          })
          safeSetState(setThumbnail, null)
          safeSetState(setVideoInfo, null)
          safeSetState(setUploadStep, 'upload')
          safeSetState(setUploadProgress, 0)
          onClose()
        }
      }, 1000)
    }
  } catch (error: any) {
    if (mounted) {
      safeSetState(setUploadStep, 'details')
      safeSetState(setUploadProgress, 0)
      // 错误处理...
    }
  }
}
```

## 关键改进

### 1. 生命周期管理

- **挂载检查**：所有异步操作前检查组件是否仍然挂载
- **清理函数**：组件卸载时清理所有定时器和异步操作
- **状态保护**：防止在组件卸载后更新状态

### 2. 定时器管理

- **引用存储**：使用 useRef 存储定时器引用
- **及时清理**：在组件卸载和操作完成时清理定时器
- **状态检查**：定时器回调中检查 mounted 状态

### 3. 异步操作保护

- **文件处理**：文件选择和拖拽时的异步操作保护
- **上传过程**：上传过程中的状态更新保护
- **错误处理**：错误处理中的状态更新保护

## 最佳实践

### 1. 组件设计

- **状态管理**：使用 mounted 状态跟踪组件生命周期
- **清理函数**：在 useEffect 中提供清理函数
- **引用管理**：使用 useRef 管理需要清理的资源

### 2. 异步操作

- **挂载检查**：所有异步操作前检查 mounted 状态
- **安全更新**：使用安全的 setState 函数
- **错误处理**：在错误处理中也检查 mounted 状态

### 3. 资源管理

- **定时器清理**：及时清理所有定时器
- **事件监听器**：清理事件监听器
- **网络请求**：取消未完成的网络请求

## 预期效果

修复后的视频上传功能应该：

- ✅ **无回调错误**：不再出现"callback is no longer runnable"错误
- ✅ **稳定运行**：组件卸载时优雅处理所有异步操作
- ✅ **资源清理**：及时清理定时器和其他资源
- ✅ **状态安全**：防止在组件卸载后更新状态
- ✅ **用户体验**：上传过程中关闭模态框不会导致错误

## 故障排除

如果问题仍然存在：

1. **检查 mounted 状态**：确认 mounted 状态正确设置
2. **验证清理函数**：确认 useEffect 清理函数正确执行
3. **检查定时器**：确认所有定时器都被正确清理
4. **查看控制台**：检查是否有其他异步操作未保护
5. **测试场景**：在上传过程中关闭模态框测试

---

**修复完成时间**: 2024 年 8 月 10 日  
**修复状态**: ✅ 完成  
**测试状态**: 🔄 进行中  
**部署状态**: 🔄 待部署
