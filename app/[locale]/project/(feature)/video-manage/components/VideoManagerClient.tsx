'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Upload,
  Play,
  Clock,
  MessageSquare,
  RefreshCw,
  AlertCircle,
  FileVideo,
  Calendar,
} from 'lucide-react'
import { useVideos, useDeleteVideo } from '@/lib/hooks/use-videos'
import { VideoUploadModal } from './VideoUploadModal'
import { VideoEditModal } from './VideoEditModal'
import { Link, useRouter } from '@/i18n/navigation'
import toast from 'react-hot-toast'

export function VideoManagerClient() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const router = useRouter()

  // 获取视频列表
  const {
    data: videosData,
    isLoading,
    error,
    refetch,
  } = useVideos({
    search: searchTerm || undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
  })

  const deleteVideo = useDeleteVideo()

  const videos = videosData?.videos || []

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      toast.success('数据已刷新')
    } catch (error) {
      toast.error('刷新失败')
    } finally {
      setIsRefreshing(false)
    }
  }

  // 处理删除视频
  const handleDeleteVideo = async (videoId: string) => {
    if (confirm('确定要删除这个视频吗？此操作不可撤销。')) {
      try {
        toast.loading('删除中...', { id: 'delete-video' })
        await deleteVideo.mutateAsync(videoId)
        toast.success('视频删除成功', { id: 'delete-video' })
      } catch (error) {
        console.error('删除视频失败:', error)
        toast.error('删除视频失败', { id: 'delete-video' })
      }
    }
  }

  // 格式化时间
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0:00'
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

  // 格式化数字
  const formatNumber = (num: number) => {
    if (!num || num <= 0) return '0'
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - new Date(date).getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1天前'
    if (diffDays < 7) return `${diffDays}天前`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`
    return `${Math.ceil(diffDays / 365)}年前`
  }

  // 计算统计数据
  const stats = {
    totalVideos: videos.length,
    totalViews: videos.reduce((sum, video) => sum + (video.viewCount || 0), 0),
    totalDanmaku: videos.reduce(
      (sum, video) => sum + (video.danmakuCount || 0),
      0
    ),
    totalDuration: videos.reduce(
      (sum, video) => sum + (video.duration || 0),
      0
    ),
  }
  console.log('error', error)

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4 pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" />
          <span>上传视频</span>
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索视频标题或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部分类</option>
              <option value="娱乐">娱乐</option>
              <option value="教育">教育</option>
              <option value="科技">科技</option>
              <option value="游戏">游戏</option>
              <option value="音乐">音乐</option>
            </select>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">总视频数</p>
                <p className="text-3xl font-bold text-blue-900">
                  {stats.totalVideos}
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <FileVideo className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">总播放量</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatNumber(stats.totalViews)}
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Eye className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">总弹幕数</p>
                <p className="text-3xl font-bold text-purple-900">
                  {formatNumber(stats.totalDanmaku)}
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <MessageSquare className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">总时长</p>
                <p className="text-3xl font-bold text-orange-900">
                  {formatDuration(stats.totalDuration)}
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Clock className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 视频列表 */}
      {isLoading ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-lg">加载中...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-4">
              无法加载视频数据，请检查网络连接
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      ) : videos.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">暂无视频</h3>
            <p className="text-gray-600 mb-6">开始上传您的第一个视频吧！</p>
            <Button
              onClick={() => setShowUploadModal(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              上传视频
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {videos.map((video) => (
            <Card
              key={video.id}
              className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div
                className={`relative bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'aspect-video'
                    : 'w-64 h-40 flex-shrink-0'
                }`}
              >
                <Link href={`/project/video-player?id=${video.id}`}>
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-gray-400 cursor-pointer" />
                    </div>
                  )}
                </Link>

                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                  {formatDuration(video.duration)}
                </div>
                <div className="absolute top-3 left-3">
                  <Badge
                    variant={video.isPublic ? 'default' : 'secondary'}
                    className="backdrop-blur-sm"
                  >
                    {video.isPublic ? '公开' : '私密'}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                  <Link href={`/project/video-player?id=${video.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/90 text-gray-900 hover:bg-white/30 hover:text-blue-300 cursor-pointer transition-all duration-200 active:scale-90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      播放
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1 text-sm">
                    {video.title}
                  </h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingVideo(video)
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                      title="编辑"
                    >
                      <Edit className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteVideo(video.id)
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                      title="删除"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {video.description || '暂无描述'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{formatNumber(video.viewCount)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{formatNumber(video.danmakuCount)}</span>
                    </span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(video.createdAt)}</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 模态框 */}
      {showUploadModal && (
        <VideoUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {editingVideo && (
        <VideoEditModal
          video={editingVideo}
          isOpen={!!editingVideo}
          onClose={() => setEditingVideo(null)}
        />
      )}
    </div>
  )
}
