import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

interface ThumbnailOptions {
  time?: string // 截取时间点，默认 "00:00:01"
  width?: number // 输出宽度，默认 320
  height?: number // 输出高度，默认 180
  quality?: number // 质量 1-31，默认 2
}

export class VideoThumbnailService {
  private ffmpeg: FFmpeg | null = null

  async init() {
    if (!this.ffmpeg) {
      this.ffmpeg = new FFmpeg()

      // 加载 FFmpeg
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`/ffmpeg/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(
          `/ffmpeg/ffmpeg-core.wasm`,
          'application/wasm'
        ),
      })
    }
  }

  async generateThumbnail(
    videoFile: File | Blob,
    options: ThumbnailOptions = {}
  ): Promise<Blob> {
    await this.init()

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized')
    }

    const {
      time = '00:00:01',
      width = 320,
      height = 180,
      quality = 2,
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
      '-i',
      inputName,
      '-ss',
      time,
      '-vframes',
      '1',
      '-vf',
      `scale=${width}:${height}`,
      '-q:v',
      quality.toString(),
      outputName,
    ])

    // 读取生成的图片
    const data = await this.ffmpeg.readFile(outputName)

    // 清理文件
    await this.ffmpeg.deleteFile(inputName)
    await this.ffmpeg.deleteFile(outputName)

    return new Blob([data], { type: 'image/jpeg' })
  }

  async generateMultipleThumbnails(
    videoFile: File | Blob,
    times: string[] = ['00:00:01', '00:00:05', '00:00:10'],
    options: ThumbnailOptions = {}
  ): Promise<Blob[]> {
    await this.init()

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized')
    }

    const { width = 320, height = 180, quality = 2 } = options

    const inputName = 'input.mp4'
    const thumbnails: Blob[] = []

    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await videoFile.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // 写入视频文件到虚拟文件系统
    await this.ffmpeg.writeFile(inputName, uint8Array)

    for (let i = 0; i < times.length; i++) {
      const outputName = `thumbnail_${i}.jpg`

      // 执行截图命令
      await this.ffmpeg.exec([
        '-i',
        inputName,
        '-ss',
        times[i],
        '-vframes',
        '1',
        '-vf',
        `scale=${width}:${height}`,
        '-q:v',
        quality.toString(),
        outputName,
      ])

      // 读取生成的图片
      const data = await this.ffmpeg.readFile(outputName)
      thumbnails.push(new Blob([data], { type: 'image/jpeg' }))

      // 清理文件
      await this.ffmpeg.deleteFile(outputName)
    }

    // 清理输入文件
    await this.ffmpeg.deleteFile(inputName)

    return thumbnails
  }

  // 获取视频信息
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

    // 获取视频信息
    await this.ffmpeg.exec(['-i', inputName])

    // 清理文件
    await this.ffmpeg.deleteFile(inputName)

    // 获取日志信息
    const logs = await this.ffmpeg.readFile('ffmpeg.log')
    const logText = new TextDecoder().decode(logs as any)

    return this.parseVideoInfo(logText)
  }

  private parseVideoInfo(logText: string) {
    const durationMatch = logText.match(
      /Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/
    )
    const resolutionMatch = logText.match(/(\d{3,4})x(\d{3,4})/)
    const fpsMatch = logText.match(/(\d+(?:\.\d+)?) fps/)

    if (durationMatch) {
      const hours = parseInt(durationMatch[1])
      const minutes = parseInt(durationMatch[2])
      const seconds = parseInt(durationMatch[3])
      const centiseconds = parseInt(durationMatch[4])

      const duration =
        hours * 3600 + minutes * 60 + seconds + centiseconds / 100

      return {
        duration,
        resolution: resolutionMatch
          ? {
              width: parseInt(resolutionMatch[1]),
              height: parseInt(resolutionMatch[2]),
            }
          : null,
        fps: fpsMatch ? parseFloat(fpsMatch[1]) : null,
      }
    }

    return null
  }
}

// 单例实例
export const videoThumbnailService = new VideoThumbnailService()
