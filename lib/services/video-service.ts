export interface VideoData {
  id: string
  title: string
  description?: string
  url: string
  thumbnail?: string
  duration: number
  viewCount: number
  likeCount: number
  dislikeCount: number
  danmakuCount: number
  category?: string
  tags: string[]
  isPublic: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    username: string
    avatar?: string
  }
}

export interface CreateVideoData {
  title: string
  description?: string
  url: string
  thumbnail?: string
  duration: number
  category?: string
  tags?: string[]
  userId: string
}

export interface UpdateVideoData {
  title?: string
  description?: string
  thumbnail?: string
  category?: string
  tags?: string[]
  isPublic?: boolean
}

export class VideoService {
  // 获取视频列表
  static async getVideos(
    params: {
      page?: number
      limit?: number
      category?: string
      search?: string
      userId?: string
    } = {}
  ) {
    const searchParams = new URLSearchParams()

    if (params.page) searchParams.append('page', params.page.toString())
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.category) searchParams.append('category', params.category)
    if (params.search) searchParams.append('search', params.search)
    if (params.userId) searchParams.append('userId', params.userId)

    const response = await fetch(`/api/videos?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error('获取视频列表失败')
    }

    return response.json()
  }

  // 获取单个视频
  static async getVideo(id: string): Promise<VideoData | null> {
    const response = await fetch(`/api/videos/${id}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('获取视频失败')
    }

    return response.json()
  }

  // 创建视频
  static async createVideo(data: CreateVideoData): Promise<VideoData> {
    const response = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('创建视频失败')
    }

    return response.json()
  }

  // 更新视频
  static async updateVideo(
    id: string,
    data: UpdateVideoData
  ): Promise<VideoData> {
    const response = await fetch(`/api/videos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('更新视频失败')
    }

    return response.json()
  }

  // 删除视频
  static async deleteVideo(id: string): Promise<void> {
    const response = await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('删除视频失败')
    }
  }

  // 增加观看次数
  static async incrementViewCount(id: string): Promise<void> {
    const response = await fetch(`/api/videos/${id}/view`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error('增加观看次数失败')
    }
  }

  // 更新弹幕计数
  static async updateDanmakuCount(id: string): Promise<void> {
    const response = await fetch(`/api/videos/${id}/danmaku`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error('更新弹幕计数失败')
    }
  }

  // 获取用户视频
  static async getUserVideos(userId: string, page = 1, limit = 20) {
    return this.getVideos({
      userId,
      page,
      limit,
    })
  }
}
