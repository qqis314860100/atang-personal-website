'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X, Save, Eye, EyeOff, MessageSquare } from 'lucide-react'
import { useUpdateVideo } from '@/app/hooks/use-videos'

interface VideoEditModalProps {
  video: any
  isOpen: boolean
  onClose: () => void
}

export function VideoEditModal({
  video,
  isOpen,
  onClose,
}: VideoEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    isPublic: true,
  })
  const [tagInput, setTagInput] = useState('')

  const updateVideo = useUpdateVideo()

  // 初始化表单数据
  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        category: video.category || '',
        tags: video.tags || [],
        isPublic: video.isPublic !== false,
      })
    }
  }, [video])

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
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

  // 保存更改
  const handleSave = async () => {
    try {
      await updateVideo.mutateAsync({
        id: video.id,
        data: formData,
      })
      onClose()
    } catch (error) {
      console.error('更新视频失败:', error)
    }
  }

  if (!video) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Eye className="h-6 w-6 text-blue-600" />
            <span>编辑视频</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 视频预览 */}
          <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500">无缩略图</span>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">
                {video.title}
              </h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{video.viewCount || 0} 次播放</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>{video.danmakuCount || 0} 条弹幕</span>
                </span>
              </div>
            </div>
          </div>

          {/* 编辑表单 */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-sm font-medium">
                  视频标题 *
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="输入视频标题"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm font-medium">
                  分类
                </Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
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
              <Label htmlFor="edit-description" className="text-sm font-medium">
                视频描述
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
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
                {formData.tags.map((tag) => (
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
                {formData.tags.length === 0 && (
                  <span className="text-gray-400 text-sm">暂无标签</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isPublic: e.target.checked,
                  }))
                }
                className="rounded h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <Label
                htmlFor="edit-isPublic"
                className="flex items-center space-x-2 text-sm font-medium"
              >
                {formData.isPublic ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-600" />
                )}
                <span>{formData.isPublic ? '公开视频' : '私密视频'}</span>
              </Label>
              <Badge variant={formData.isPublic ? 'default' : 'secondary'}>
                {formData.isPublic ? '公开' : '私密'}
              </Badge>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="px-6">
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim() || updateVideo.isPending}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateVideo.isPending ? '保存中...' : '保存更改'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
