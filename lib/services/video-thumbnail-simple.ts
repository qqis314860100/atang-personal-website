interface ThumbnailOptions {
  time?: number // 截取时间点（秒），默认 1
  width?: number // 输出宽度，默认 320
  height?: number // 输出高度，默认 180
  quality?: number // 质量 0-1，默认 0.8
}

export class SimpleVideoThumbnailService {
  /**
   * 从视频文件生成缩略图
   */
  async generateThumbnail(
    videoFile: File | Blob,
    options: ThumbnailOptions = {}
  ): Promise<Blob> {
    const { time = 1, width = 1280, height = 720, quality = 1 } = options

    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      // 设置 Canvas 尺寸
      canvas.width = width
      canvas.height = height

      // 视频加载完成后的处理
      video.onloadedmetadata = () => {
        // 设置视频时间
        video.currentTime = time
      }

      // 视频时间更新后的处理
      video.onseeked = () => {
        try {
          // 绘制视频帧到 Canvas
          ctx.drawImage(video, 0, 0, width, height)

          // 转换为 Blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('无法生成缩略图'))
              }
            },
            'image/jpeg',
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      // 错误处理
      video.onerror = () => {
        reject(new Error('视频加载失败'))
      }

      // 创建视频 URL 并加载
      const videoUrl = URL.createObjectURL(videoFile)
      video.src = videoUrl
      video.load()

      // 清理 URL
      video.onended = () => {
        URL.revokeObjectURL(videoUrl)
      }
    })
  }

  /**
   * 生成多个时间点的缩略图
   */
  async generateMultipleThumbnails(
    videoFile: File | Blob,
    times: number[] = [1, 5, 10],
    options: ThumbnailOptions = {}
  ): Promise<Blob[]> {
    const thumbnails: Blob[] = []

    for (const time of times) {
      try {
        const thumbnail = await this.generateThumbnail(videoFile, {
          ...options,
          time,
        })
        thumbnails.push(thumbnail)
      } catch (error) {
        console.error(`生成时间点 ${time}s 的缩略图失败:`, error)
      }
    }

    return thumbnails
  }

  /**
   * 获取视频信息
   */
  async getVideoInfo(videoFile: File | Blob) {
    return new Promise<{
      duration: number
      width: number
      height: number
    }>((resolve, reject) => {
      const video = document.createElement('video')

      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        })
      }

      video.onerror = () => {
        reject(new Error('无法获取视频信息'))
      }

      const videoUrl = URL.createObjectURL(videoFile)
      video.src = videoUrl
      video.load()

      video.onended = () => {
        URL.revokeObjectURL(videoUrl)
      }
    })
  }

  /**
   * 将 Blob 转换为 Base64
   */
  async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * 将 Base64 转换为 Blob
   */
  base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1])
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }

    return new Blob([ab], { type: mimeString })
  }
}

// 单例实例
export const simpleVideoThumbnailService = new SimpleVideoThumbnailService()
