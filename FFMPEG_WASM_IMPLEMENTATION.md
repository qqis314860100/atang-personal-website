# FFmpeg.wasm 方案详细实现

## 错误说明

你遇到的错误是因为 FFmpeg.wasm 库的 API 在不同版本间发生了变化：

### 错误原因

```typescript
// 旧版本 API（已废弃）
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

// 新版本 API（当前使用）
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
```

## FFmpeg.wasm 工作原理

### 1. 核心技术栈

- **WebAssembly (WASM)**：将 FFmpeg 编译为 WebAssembly
- **虚拟文件系统**：在浏览器中模拟文件系统
- **异步处理**：支持大文件处理

### 2. 实现流程

```typescript
// 1. 初始化 FFmpeg 实例
const ffmpeg = new FFmpeg()

// 2. 加载 FFmpeg 核心文件
await ffmpeg.load({
  coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
  wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
})

// 3. 将视频文件写入虚拟文件系统
const arrayBuffer = await videoFile.arrayBuffer()
const uint8Array = new Uint8Array(arrayBuffer)
await ffmpeg.writeFile('input.mp4', uint8Array)

// 4. 执行 FFmpeg 命令
await ffmpeg.exec([
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
  'thumbnail.jpg',
])

// 5. 读取生成的图片
const data = await ffmpeg.readFile('thumbnail.jpg')
const blob = new Blob([data], { type: 'image/jpeg' })

// 6. 清理文件
await ffmpeg.deleteFile('input.mp4')
await ffmpeg.deleteFile('thumbnail.jpg')
```

## 详细代码实现

### 1. 基础设置

```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

interface ThumbnailOptions {
  time?: string // 截取时间点，如 "00:00:01"
  width?: number // 输出宽度
  height?: number // 输出高度
  quality?: number // 质量 1-31（越小质量越好）
}
```

### 2. 初始化 FFmpeg

```typescript
export class VideoThumbnailService {
  private ffmpeg: FFmpeg | null = null

  async init() {
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg()

      // 加载 FFmpeg 核心文件
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(
          `/ffmpeg/ffmpeg-core.wasm`,
          'application/wasm'
        ),
      })
    }
  }
}
```

### 3. 生成缩略图

```typescript
async generateThumbnail(
  videoFile: File | Blob,
  options: ThumbnailOptions = {}
): Promise<Blob> {
  await this.init()

  if (!this.ffmpeg) {
    throw new Error('FFmpeg not initialized')
  }

  const {
    time = "00:00:01",
    width = 320,
    height = 180,
    quality = 2
  } = options

  const inputName = 'input.mp4'
  const outputName = 'thumbnail.jpg'

  // 将文件转换为 ArrayBuffer
  const arrayBuffer = await videoFile.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // 写入视频文件到虚拟文件系统
  await this.ffmpeg.writeFile(inputName, uint8Array)

  // 执行截图命令
  await this.ffmpeg.exec([
    '-i', inputName,           // 输入文件
    '-ss', time,              // 开始时间
    '-vframes', '1',          // 只截取一帧
    '-vf', `scale=${width}:${height}`, // 缩放
    '-q:v', quality.toString(), // 质量设置
    outputName                 // 输出文件
  ])

  // 读取生成的图片
  const data = await this.ffmpeg.readFile(outputName)

  // 清理文件
  await this.ffmpeg.deleteFile(inputName)
  await this.ffmpeg.deleteFile(outputName)

  return new Blob([data], { type: 'image/jpeg' })
}
```

### 4. 生成多个缩略图

```typescript
async generateMultipleThumbnails(
  videoFile: File | Blob,
  times: string[] = ["00:00:01", "00:00:05", "00:00:10"],
  options: ThumbnailOptions = {}
): Promise<Blob[]> {
  await this.init()

  if (!this.ffmpeg) {
    throw new Error('FFmpeg not initialized')
  }

  const {
    width = 320,
    height = 180,
    quality = 2
  } = options

  const inputName = 'input.mp4'
  const thumbnails: Blob[] = []

  // 将文件转换为 ArrayBuffer
  const arrayBuffer = await videoFile.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // 写入视频文件到虚拟文件系统
  await this.ffmpeg.writeFile(inputName, uint8Array)

  // 为每个时间点生成缩略图
  for (let i = 0; i < times.length; i++) {
    const outputName = `thumbnail_${i}.jpg`

    await this.ffmpeg.exec([
      '-i', inputName,
      '-ss', times[i],
      '-vframes', '1',
      '-vf', `scale=${width}:${height}`,
      '-q:v', quality.toString(),
      outputName
    ])

    const data = await this.ffmpeg.readFile(outputName)
    thumbnails.push(new Blob([data], { type: 'image/jpeg' }))

    // 清理输出文件
    await this.ffmpeg.deleteFile(outputName)
  }

  // 清理输入文件
  await this.ffmpeg.deleteFile(inputName)

  return thumbnails
}
```

### 5. 获取视频信息

```typescript
async getVideoInfo(videoFile: File | Blob) {
  await this.init()

  if (!this.ffmpeg) {
    throw new Error('FFmpeg not initialized')
  }

  const inputName = 'input.mp4'

  // 将文件转换为 ArrayBuffer
  const arrayBuffer = await videoFile.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  await this.ffmpeg.writeFile(inputName, uint8Array)

  // 获取视频信息（会输出到日志）
  await this.ffmpeg.exec(['-i', inputName])

  // 清理文件
  await this.ffmpeg.deleteFile(inputName)

  // 获取日志信息
  const logs = await this.ffmpeg.readFile('ffmpeg.log')
  const logText = new TextDecoder().decode(logs)

  return this.parseVideoInfo(logText)
}

private parseVideoInfo(logText: string) {
  // 解析视频时长
  const durationMatch = logText.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
  // 解析分辨率
  const resolutionMatch = logText.match(/(\d{3,4})x(\d{3,4})/)
  // 解析帧率
  const fpsMatch = logText.match(/(\d+(?:\.\d+)?) fps/)

  if (durationMatch) {
    const hours = parseInt(durationMatch[1])
    const minutes = parseInt(durationMatch[2])
    const seconds = parseInt(durationMatch[3])
    const centiseconds = parseInt(durationMatch[4])

    const duration = hours * 3600 + minutes * 60 + seconds + centiseconds / 100

    return {
      duration,
      resolution: resolutionMatch ? {
        width: parseInt(resolutionMatch[1]),
        height: parseInt(resolutionMatch[2])
      } : null,
      fps: fpsMatch ? parseFloat(fpsMatch[1]) : null
    }
  }

  return null
}
```

## FFmpeg 命令详解

### 1. 基础截图命令

```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 output.jpg
```

**参数说明：**

- `-i input.mp4`：输入文件
- `-ss 00:00:01`：从 1 秒开始
- `-vframes 1`：只截取一帧
- `output.jpg`：输出文件

### 2. 缩放和压缩

```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -vf scale=320:180 -q:v 2 output.jpg
```

**参数说明：**

- `-vf scale=320:180`：缩放到 320×180
- `-q:v 2`：JPEG 质量（1-31，越小质量越好）

### 3. 高级选项

```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -vf "scale=320:180:force_original_aspect_ratio=decrease" -q:v 2 output.jpg
```

**参数说明：**

- `force_original_aspect_ratio=decrease`：保持宽高比
- `-q:v 2`：高质量输出

## 性能优化

### 1. 文件大小优化

```typescript
// 根据使用场景调整尺寸
const thumbnailSizes = {
  small: { width: 160, height: 90 },
  medium: { width: 320, height: 180 },
  large: { width: 640, height: 360 },
}

// 根据质量需求调整
const qualityLevels = {
  low: 10, // 文件小，质量一般
  medium: 5, // 平衡质量和大小
  high: 2, // 高质量，文件较大
}
```

### 2. 内存管理

```typescript
// 及时清理文件
await this.ffmpeg.deleteFile(inputName)
await this.ffmpeg.deleteFile(outputName)

// 释放 FFmpeg 实例
async dispose() {
  if (this.ffmpeg) {
    await this.ffmpeg.terminate()
    this.ffmpeg = null
  }
}
```

### 3. 错误处理

```typescript
try {
  await this.ffmpeg.exec([...])
} catch (error) {
  console.error('FFmpeg 执行失败:', error)
  throw new Error('缩略图生成失败')
} finally {
  // 确保清理文件
  await this.ffmpeg.deleteFile(inputName)
}
```

## 与 Canvas API 方案对比

| 特性         | Canvas API | FFmpeg.wasm |
| ------------ | ---------- | ----------- |
| **文件大小** | ~0KB       | ~20MB       |
| **加载时间** | 即时       | 5-10 秒     |
| **处理能力** | 基础       | 专业级      |
| **兼容性**   | 优秀       | 良好        |
| **内存占用** | 低         | 高          |
| **支持格式** | 有限       | 全面        |

## 使用建议

### 开发环境

- 使用 **Canvas API 方案**
- 快速开发和测试
- 无需额外配置

### 生产环境

- 考虑 **FFmpeg.wasm 方案**
- 需要高质量处理
- 支持复杂视频格式

### 混合方案

```typescript
// 根据文件大小选择方案
async generateThumbnail(file: File) {
  if (file.size < 50 * 1024 * 1024) { // 50MB
    return await simpleVideoThumbnailService.generateThumbnail(file)
  } else {
    return await videoThumbnailService.generateThumbnail(file)
  }
}
```

## 总结

FFmpeg.wasm 方案提供了专业级的视频处理能力，但需要权衡文件大小和加载时间。对于大多数应用场景，Canvas API 方案已经足够使用。如果需要处理复杂视频格式或需要高质量输出，FFmpeg.wasm 是一个很好的选择。
