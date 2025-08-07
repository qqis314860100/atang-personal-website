# FFmpeg.wasm 使用示例

## 错误说明

你遇到的错误是因为 FFmpeg.wasm 库的 API 变化：

```typescript
// ❌ 旧版本（已废弃）
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

// ✅ 新版本（当前使用）
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
```

## 核心概念

### 1. WebAssembly 技术

- FFmpeg 被编译为 WebAssembly
- 在浏览器中运行完整的 FFmpeg
- 支持所有 FFmpeg 功能

### 2. 虚拟文件系统

- 在浏览器中模拟文件系统
- 可以读写文件
- 支持大文件处理

## 基本使用流程

```typescript
// 1. 创建 FFmpeg 实例
const ffmpeg = new FFmpeg()

// 2. 加载核心文件
await ffmpeg.load({
  coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
  wasmURL: await toBlobURL(`/ffmpeg/ffmpeg-core.wasm`, 'application/wasm'),
})

// 3. 写入文件到虚拟文件系统
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

// 5. 读取结果
const data = await ffmpeg.readFile('thumbnail.jpg')
const blob = new Blob([data], { type: 'image/jpeg' })

// 6. 清理文件
await ffmpeg.deleteFile('input.mp4')
await ffmpeg.deleteFile('thumbnail.jpg')
```

## 主要优势

1. **专业级处理**：支持所有 FFmpeg 功能
2. **高质量输出**：专业级视频处理
3. **格式支持**：支持所有视频格式
4. **功能完整**：视频转码、压缩、特效等

## 主要缺点

1. **文件大小**：~20MB 的加载文件
2. **加载时间**：首次加载需要 5-10 秒
3. **内存占用**：较高的内存使用
4. **兼容性**：部分浏览器可能不支持

## 适用场景

- 需要高质量视频处理
- 支持复杂视频格式
- 需要专业级功能
- 可以接受较长的加载时间

## 与 Canvas API 对比

| 特性     | Canvas API | FFmpeg.wasm |
| -------- | ---------- | ----------- |
| 文件大小 | 0KB        | 20MB        |
| 加载时间 | 即时       | 5-10 秒     |
| 处理能力 | 基础       | 专业级      |
| 兼容性   | 优秀       | 良好        |

## 建议

对于你的项目，我建议：

1. **开发阶段**：使用 Canvas API 方案（已实现）
2. **生产环境**：考虑服务器端处理方案
3. **特殊需求**：需要高质量处理时使用 FFmpeg.wasm

Canvas API 方案已经能满足大部分需求，而且性能更好、兼容性更强。
