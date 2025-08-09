'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useVideo } from '@/app/hooks/use-videos'
import {
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Calendar,
  User,
} from 'lucide-react'

interface VideoInfoProps {
  videoId: string
}

export function VideoInfo({ videoId }: VideoInfoProps) {
  const { data: video, isLoading, error } = useVideo(videoId)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !video) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>无法加载视频信息</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">{video.title}</h2>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{formatNumber(video.viewCount)} 播放</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{formatNumber(video.danmakuCount)} 弹幕</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{formatNumber(video.likeCount)} 点赞</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4" />
              <span>{formatNumber(video.dislikeCount)} 点踩</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          </div>

          {video.category && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{video.category}</Badge>
              {video.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {video.description && (
            <p className="text-gray-700 leading-relaxed">{video.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{video.user?.username || '未知用户'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
