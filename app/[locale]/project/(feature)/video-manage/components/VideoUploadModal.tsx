'use client'

import { useCreateVideo } from '@/app/hooks/use-videos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useStableUser } from '@/lib/query-hook/use-auth'
import { simpleVideoThumbnailService } from '@/lib/services/video-thumbnail-simple'
import { createClient } from '@/lib/supabase/client'
import {
  AlertCircle,
  Clock,
  FileVideo,
  Settings,
  Upload,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

// 文件大小限制常量 (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB in bytes
const MAX_FILE_SIZE_MB = 100 // 100MB

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function VideoUploadModal({ isOpen, onClose }: VideoUploadModalProps) {
  const [mounted, setMounted] = useState(false)
  const [uploadStep, setUploadStep] = useState<
    'upload' | 'details' | 'processing'
  >('upload')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [videoDetails, setVideoDetails] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    isPublic: true,
  })
  const [tagInput, setTagInput] = useState('')
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [videoInfo, setVideoInfo] = useState<{
    duration: number
    width: number
    height: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const createVideo = useCreateVideo()
  const { user } = useStableUser()

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

  // 安全的setState函数
  const safeSetState = (setter: any, value: any) => {
    if (mounted) {
      setter(value)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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

  // 处理文件选择
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      // 验证文件大小
      if (!validateFileSize(file)) {
        return
      }

      if (!mounted) return

      safeSetState(setSelectedFile, file)

      try {
        // 获取视频信息
        const info = await simpleVideoThumbnailService.getVideoInfo(file)
        if (mounted) {
          safeSetState(setVideoInfo, info)
        }

        // 生成缩略图
        const thumbnailBlob =
          await simpleVideoThumbnailService.generateThumbnail(file, {
            time: 1,
            width: 1280,
            height: 720,
            quality: 1,
          })

        const thumbnailBase64 = await simpleVideoThumbnailService.blobToBase64(
          thumbnailBlob
        )

        if (mounted) {
          safeSetState(setThumbnail, thumbnailBase64)
        }

        // 自动设置标题
        const fileName = file.name.replace(/\.[^/.]+$/, '')
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

  // 处理拖拽上传
  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      // 验证文件大小
      if (!validateFileSize(file)) {
        return
      }

      if (!mounted) return

      safeSetState(setSelectedFile, file)

      try {
        // 获取视频信息
        const info = await simpleVideoThumbnailService.getVideoInfo(file)
        if (mounted) {
          safeSetState(setVideoInfo, info)
        }

        // 生成缩略图
        const thumbnailBlob =
          await simpleVideoThumbnailService.generateThumbnail(file, {
            time: 1,
            width: 1280,
            height: 720,
            quality: 1,
          })

        const thumbnailBase64 = await simpleVideoThumbnailService.blobToBase64(
          thumbnailBlob
        )

        if (mounted) {
          safeSetState(setThumbnail, thumbnailBase64)
        }

        // 自动设置标题
        const fileName = file.name.replace(/\.[^/.]+$/, '')
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

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !videoDetails.tags.includes(tagInput.trim())) {
      setVideoDetails((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setVideoDetails((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // 处理键盘事件
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addTag()
    }
  }

  // 创建视频
  const handleCreateVideo = async () => {
    if (!selectedFile || !user || !mounted) return

    safeSetState(setUploadStep, 'processing')
    safeSetState(setUploadProgress, 0)

    // 模拟进度更新
    progressIntervalRef.current = setInterval(() => {
      if (mounted) {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }
    }, 500)

    try {
      // 1. 获取 supabase client
      const supabase = createClient()
      if (!supabase) throw new Error('Supabase client 初始化失败')

      // 2. 构造存储路径 - 使用安全的文件名
      const originalName = selectedFile.name
      const extension = originalName.split('.').pop() || 'mp4'
      const safeFileName = `${uuidv4()}.${extension}`

      const filePath = `video/${safeFileName}`

      console.log('开始上传文件:', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        filePath: filePath,
      })

      // 3. 简化上传逻辑，移除可能导致问题的配置
      const { data, error } = await supabase.storage
        .from('upload')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        console.error('上传错误:', error)
        throw error
      }

      console.log('文件上传成功:', data)

      // 4. 获取公开访问链接
      const { data: publicUrlData } = supabase.storage
        .from('upload')
        .getPublicUrl(filePath)
      const videoUrl = publicUrlData?.publicUrl

      console.log('获取到视频URL:', videoUrl)

      // 5. 创建视频记录
      const videoResult = await createVideo.mutateAsync({
        title: videoDetails.title,
        description: videoDetails.description,
        url: videoUrl,
        thumbnail: thumbnail || '',
        duration: videoInfo?.duration || 0,
        category: videoDetails.category,
        tags: videoDetails.tags,
        userId: user.id,
        // isPublic 字段如需支持可在后端/接口层扩展
      })

      console.log('视频记录创建成功:', videoResult)

      // 6. 完成进度
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      if (mounted) {
        safeSetState(setUploadProgress, 100)

        // 等待一秒显示完成状态
        setTimeout(() => {
          if (mounted) {
            // 7. 重置状态
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

            // 8. 显示成功消息
            toast.success('视频上传成功！')
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error('创建视频失败:', error)

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }

      if (mounted) {
        safeSetState(setUploadStep, 'details')
        safeSetState(setUploadProgress, 0)

        // 显示详细的错误信息
        let errorMessage = '上传失败'
        if (error.message) {
          errorMessage += ': ' + error.message
        } else if (error.error_description) {
          errorMessage += ': ' + error.error_description
        } else if (typeof error === 'string') {
          errorMessage += ': ' + error
        }
        console.log('上传失败:', error)
        toast.error(errorMessage)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>上传视频</span>
          </DialogTitle>
        </DialogHeader>

        {uploadStep === 'upload' && (
          <div className="space-y-6">
            {!user ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  请先登录
                </h3>
                <p className="text-gray-600">登录后才能上传视频</p>
              </div>
            ) : (
              <>
                {/* 文件大小错误提示 */}
                {fileError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700 font-medium">
                        {fileError}
                      </span>
                    </div>
                    <p className="text-red-600 text-sm mt-2">
                      建议：压缩视频文件或使用较低分辨率
                    </p>
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer bg-gradient-to-br ${
                    fileError
                      ? 'border-red-300 from-red-50 to-red-100'
                      : 'border-gray-300 from-gray-50 to-gray-100 hover:border-blue-500 hover:from-blue-50 hover:to-blue-100'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    拖拽视频文件到此处或点击选择
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    支持 MP4, AVI, MOV, WMV 等格式，最大 {MAX_FILE_SIZE_MB}MB
                  </p>
                  <Button variant="outline" size="lg" className="bg-white">
                    <FileVideo className="h-5 w-5 mr-2" />
                    选择文件
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </>
            )}
          </div>
        )}

        {uploadStep === 'details' && selectedFile && (
          <div className="space-y-4">
            <div
              className={`flex items-center space-x-4 p-6 rounded-xl border ${
                selectedFile.size > MAX_FILE_SIZE
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
              }`}
            >
              <div
                className={`p-3 rounded-full ${
                  selectedFile.size > MAX_FILE_SIZE
                    ? 'bg-red-100'
                    : 'bg-blue-100'
                }`}
              >
                <FileVideo
                  className={`h-8 w-8 ${
                    selectedFile.size > MAX_FILE_SIZE
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg">
                  {selectedFile.name}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span
                      className={
                        selectedFile.size > MAX_FILE_SIZE
                          ? 'text-red-600 font-medium'
                          : ''
                      }
                    >
                      {formatFileSize(selectedFile.size)}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Settings className="h-4 w-4" />
                    <span>{selectedFile.type}</span>
                  </span>
                  {selectedFile.size > MAX_FILE_SIZE && (
                    <Badge variant="destructive" className="text-xs">
                      超出限制
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  setUploadStep('upload')
                }}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* 缩略图预览 */}
              {thumbnail && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">视频缩略图</Label>
                  <div className="relative w-full max-w-xs">
                    <img
                      src={thumbnail}
                      alt="视频缩略图"
                      className="w-full h-auto rounded-lg border border-gray-200"
                    />
                    {videoInfo && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(videoInfo.duration / 60)}:
                        {(videoInfo.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  {videoInfo && (
                    <p className="text-xs text-gray-500">
                      分辨率: {videoInfo.width} × {videoInfo.height} | 时长:{' '}
                      {Math.floor(videoInfo.duration / 60)}:
                      {(videoInfo.duration % 60).toString().padStart(2, '0')}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    视频标题 *
                  </Label>
                  <Input
                    id="title"
                    value={videoDetails.title}
                    onChange={(e) =>
                      setVideoDetails((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="输入视频标题"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    分类
                  </Label>
                  <select
                    id="category"
                    value={videoDetails.category}
                    onChange={(e) =>
                      setVideoDetails((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">选择分类</option>
                    <option value="娱乐">娱乐</option>
                    <option value="教育">教育</option>
                    <option value="科技">科技</option>
                    <option value="游戏">游戏</option>
                    <option value="音乐">音乐</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  视频描述
                </Label>
                <Textarea
                  id="description"
                  value={videoDetails.description}
                  onChange={(e) =>
                    setVideoDetails((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="输入视频描述"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">标签</Label>
                <div className="flex items-center space-x-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入标签后按回车添加"
                    className="flex-1"
                  />
                  <Button
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="px-6"
                  >
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg">
                  {videoDetails.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center space-x-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      <span>{tag}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                  {videoDetails.tags.length === 0 && (
                    <span className="text-gray-400 text-sm">暂无标签</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={videoDetails.isPublic}
                  onChange={(e) =>
                    setVideoDetails((prev) => ({
                      ...prev,
                      isPublic: e.target.checked,
                    }))
                  }
                  className="rounded h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="isPublic" className="text-sm font-medium">
                  公开视频
                </Label>
                <Badge
                  variant={videoDetails.isPublic ? 'default' : 'secondary'}
                >
                  {videoDetails.isPublic ? '公开' : '私密'}
                </Badge>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="px-6">
                取消
              </Button>
              <Button
                onClick={handleCreateVideo}
                disabled={
                  !videoDetails.title.trim() ||
                  selectedFile.size > MAX_FILE_SIZE
                }
                className={`px-8 ${
                  selectedFile.size > MAX_FILE_SIZE
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile.size > MAX_FILE_SIZE ? '文件过大' : '开始上传'}
              </Button>
            </div>
          </div>
        )}

        {uploadStep === 'processing' && (
          <div className="space-y-6 text-center py-8">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                正在上传...
              </h3>
              <p className="text-gray-600">请稍候，不要关闭此窗口</p>
            </div>
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full h-3" />
              <p className="text-sm text-gray-500 font-medium">
                {uploadProgress}%
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
