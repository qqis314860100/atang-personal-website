# 视频封面生成方案

## 方案概述

为视频管理系统提供自动生成封面的功能，支持多种技术方案。

## 方案一：Canvas API 方案（已实现）

### 技术特点

- **纯前端实现**：使用 HTML5 Canvas API
- **轻量级**：无需额外依赖
- **实时生成**：上传时立即生成
- **兼容性好**：支持所有现代浏览器

### 实现原理

1. 创建 `<video>` 元素加载视频文件
2. 设置视频时间点（默认 1 秒）
3. 使用 Canvas 绘制视频帧
4. 转换为 Blob 或 Base64 格式

### 代码实现

```typescript
// 生成缩略图
const thumbnailBlob = await simpleVideoThumbnailService.generateThumbnail(
  file,
  {
    time: 1, // 截取时间点（秒）
    width: 320, // 输出宽度
    height: 180, // 输出高度
    quality: 0.8, // 图片质量
  }
)

// 获取视频信息
const videoInfo = await simpleVideoThumbnailService.getVideoInfo(file)
```

### 优点

- ✅ 无需服务器处理
- ✅ 实时预览
- ✅ 文件大小小
- ✅ 易于集成

### 缺点

- ❌ 依赖浏览器性能
- ❌ 大文件处理较慢
- ❌ 无法处理复杂视频格式

## 方案二：FFmpeg.wasm 方案（备选）

### 技术特点

- **WebAssembly**：在浏览器中运行 FFmpeg
- **功能强大**：支持所有 FFmpeg 功能
- **高质量**：专业级视频处理
- **灵活配置**：支持多种输出格式

### 实现原理

1. 加载 FFmpeg.wasm
2. 将视频文件写入虚拟文件系统
3. 执行 FFmpeg 命令截取帧
4. 读取生成的图片文件

### 代码实现

```typescript
// 初始化 FFmpeg
await ffmpeg.load()

// 生成缩略图
await ffmpeg.run(
  '-i',
  'input.mp4',
  '-ss',
  '00:00:01',
  '-vframes',
  '1',
  '-vf',
  'scale=320:180',
  '-q:v',
  '2',
  'thumbnail.jpg'
)
```

### 优点

- ✅ 专业级处理能力
- ✅ 支持复杂视频格式
- ✅ 高质量输出
- ✅ 功能完整

### 缺点

- ❌ 文件较大（~20MB）
- ❌ 加载时间长
- ❌ 内存占用高
- ❌ 兼容性问题

## 方案三：服务器端处理（推荐生产环境）

### 技术特点

- **服务器处理**：上传到服务器后处理
- **高性能**：利用服务器资源
- **批量处理**：支持队列处理
- **存储优化**：可压缩和优化

### 实现流程

1. 用户上传视频文件
2. 服务器接收并存储视频
3. 后台任务生成缩略图
4. 存储缩略图并更新数据库

### 技术栈选择

- **Node.js + FFmpeg**：简单易用
- **Python + OpenCV**：图像处理强大
- **Java + FFmpeg**：企业级应用
- **Go + FFmpeg**：高性能

### 优点

- ✅ 处理能力强
- ✅ 支持大文件
- ✅ 可批量处理
- ✅ 存储优化

### 缺点

- ❌ 需要服务器资源
- ❌ 处理延迟
- ❌ 成本较高

## 当前实现功能

### 1. 自动生成缩略图

- 上传视频时自动截取第 1 秒的帧
- 生成 320×180 的缩略图
- 支持 JPEG 格式，质量 0.8

### 2. 视频信息获取

- 自动获取视频时长
- 获取视频分辨率
- 获取视频格式信息

### 3. 用户体验优化

- 上传时实时预览缩略图
- 显示视频基本信息
- 自动填充视频标题

### 4. 集成到上传流程

```typescript
// 文件选择时自动处理
const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (file && file.type.startsWith('video/')) {
    // 获取视频信息
    const info = await simpleVideoThumbnailService.getVideoInfo(file)

    // 生成缩略图
    const thumbnailBlob = await simpleVideoThumbnailService.generateThumbnail(
      file
    )
    const thumbnailBase64 = await simpleVideoThumbnailService.blobToBase64(
      thumbnailBlob
    )

    // 更新状态
    setVideoInfo(info)
    setThumbnail(thumbnailBase64)
  }
}
```

## 使用建议

### 开发环境

- 使用 **Canvas API 方案**
- 快速开发和测试
- 无需额外配置

### 生产环境

- 使用 **服务器端处理方案**
- 考虑使用 CDN 存储缩略图
- 实现缩略图缓存策略

### 性能优化

1. **缩略图尺寸**：根据使用场景调整
2. **质量设置**：平衡文件大小和质量
3. **缓存策略**：避免重复生成
4. **懒加载**：按需加载缩略图

## 后续改进

### 1. 多时间点缩略图

```typescript
// 生成多个时间点的缩略图
const thumbnails = await simpleVideoThumbnailService.generateMultipleThumbnails(
  file,
  [1, 5, 10, 15, 30], // 时间点（秒）
  { width: 320, height: 180 }
)
```

### 2. 缩略图选择器

- 让用户选择喜欢的缩略图
- 支持自定义时间点
- 提供缩略图预览

### 3. 智能缩略图

- 分析视频内容
- 选择最佳时间点
- 避免黑屏或模糊帧

### 4. 存储优化

- 压缩缩略图
- 多种尺寸支持
- CDN 分发

## 文件结构

```
lib/services/
├── video-thumbnail-simple.ts    # Canvas API 方案（已实现）
└── video-thumbnail.ts           # FFmpeg.wasm 方案（备选）

app/[locale]/project/(feature)/video-manage/
└── components/
    └── VideoUploadModal.tsx     # 集成缩略图生成
```

## 总结

当前实现了基于 Canvas API 的缩略图生成方案，具有以下特点：

- ✅ **简单易用**：纯前端实现，无需额外依赖
- ✅ **实时生成**：上传时立即生成缩略图
- ✅ **用户体验好**：提供实时预览和视频信息
- ✅ **易于集成**：已集成到视频上传流程

对于生产环境，建议考虑服务器端处理方案以获得更好的性能和可靠性。
