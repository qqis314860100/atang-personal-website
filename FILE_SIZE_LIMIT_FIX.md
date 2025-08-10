# 文件大小限制问题修复

## 问题描述

用户在上传视频时遇到以下错误：

```
"The object exceeded the maximum allowed size"
"StorageApiError: The object exceeded the maximum allowed size"
```

这表明上传的文件超过了 Supabase 存储桶允许的最大文件大小限制。

## 问题分析

### Supabase 存储限制：

1. **免费计划限制**：

   - 单个文件最大：50MB
   - 总存储空间：1GB

2. **付费计划限制**：

   - 单个文件最大：5GB（取决于计划）
   - 总存储空间：根据计划而定

3. **常见问题**：
   - 用户上传的视频文件过大
   - 没有客户端验证
   - 缺少用户友好的错误提示

## 修复方案

### 1. 添加文件大小常量

```typescript
// 文件大小限制常量 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes
const MAX_FILE_SIZE_MB = 100 // 100MB
```

### 2. 文件大小验证函数

```typescript
// 验证文件大小
const validateFileSize = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE) {
    setFileError(
      `文件大小超出限制！最大允许 ${MAX_FILE_SIZE_MB}MB，当前文件 ${formatFileSize(
        file.size
      )}`
    )
    return false
  }
  setFileError(null)
  return true
}
```

### 3. 文件大小格式化

```typescript
// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
```

### 4. 在文件选择时验证

```typescript
// 处理文件选择
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file && file.type.startsWith('video/')) {
    // 验证文件大小
    if (!validateFileSize(file)) {
      return
    }
    // ... 其他处理逻辑
  }
}
```

### 5. 在拖拽时验证

```typescript
// 处理拖拽上传
const handleDrop = async (event: React.DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    // 验证文件大小
    if (!validateFileSize(file)) {
      return
    }
    // ... 其他处理逻辑
  }
}
```

### 6. UI 改进

#### 错误提示显示

```typescript
{
  /* 文件大小错误提示 */
}
{
  fileError && (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-red-700 font-medium">{fileError}</span>
      </div>
      <p className="text-red-600 text-sm mt-2">
        建议：压缩视频文件或使用较低分辨率
      </p>
    </div>
  )
}
```

#### 拖拽区域状态

```typescript
<div
  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer bg-gradient-to-br ${
    fileError
      ? 'border-red-300 from-red-50 to-red-100'
      : 'border-gray-300 from-gray-50 to-gray-100 hover:border-blue-500 hover:from-blue-50 hover:to-blue-100'
  }`}
>
  {/* 内容 */}
</div>
```

#### 文件信息显示

```typescript
<div
  className={`flex items-center space-x-4 p-6 rounded-xl border ${
    selectedFile.size > MAX_FILE_SIZE
      ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
      : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
  }`}
>
  {/* 文件信息 */}
  {selectedFile.size > MAX_FILE_SIZE && (
    <Badge variant="destructive" className="text-xs">
      超出限制
    </Badge>
  )}
</div>
```

#### 上传按钮状态

```typescript
<Button
  onClick={handleCreateVideo}
  disabled={!videoDetails.title.trim() || selectedFile.size > MAX_FILE_SIZE}
  className={`px-8 ${
    selectedFile.size > MAX_FILE_SIZE
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700'
  }`}
>
  <Upload className="h-4 w-4 mr-2" />
  {selectedFile.size > MAX_FILE_SIZE ? '文件过大' : '开始上传'}
</Button>
```

## 用户体验改进

### 1. 预防性提示

- 在拖拽区域显示文件大小限制
- 实时显示当前文件大小
- 提供压缩建议

### 2. 视觉反馈

- 文件过大时显示红色警告
- 禁用上传按钮
- 显示"超出限制"标签

### 3. 错误处理

- 清晰的错误信息
- 具体的文件大小对比
- 实用的解决建议

## 最佳实践

### 1. 文件大小设置

- **合理限制**：根据业务需求设置合适的大小限制
- **用户友好**：提供清晰的大小说明
- **渐进式**：考虑不同用户群体的需求

### 2. 验证时机

- **选择时验证**：文件选择后立即验证
- **拖拽时验证**：拖拽文件时验证
- **上传前验证**：最终上传前再次确认

### 3. 错误处理

- **详细信息**：显示具体的错误原因
- **解决建议**：提供实用的解决方案
- **用户指导**：引导用户正确操作

## 预期效果

修复后的文件上传功能应该：

- ✅ **预防错误**：在上传前检测文件大小
- ✅ **清晰提示**：显示详细的大小限制信息
- ✅ **视觉反馈**：通过颜色和状态提供反馈
- ✅ **用户友好**：提供压缩和解决建议
- ✅ **错误处理**：优雅处理超出限制的文件

## 故障排除

如果问题仍然存在：

1. **检查限制设置**：确认 MAX_FILE_SIZE 设置正确
2. **验证 Supabase 配置**：确认存储桶权限和限制
3. **测试不同文件**：验证不同大小的文件
4. **查看控制台**：检查是否有其他错误
5. **联系支持**：如果问题持续存在

---

**修复完成时间**: 2024 年 8 月 10 日  
**修复状态**: ✅ 完成  
**测试状态**: 🔄 进行中  
**部署状态**: 🔄 待部署
