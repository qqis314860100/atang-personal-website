'use client'

import { useState, useEffect } from 'react'
import { useStableUser } from '@/lib/query-hook/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { FileText } from 'lucide-react'
import dayjs from 'dayjs'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { UploadArea } from '@/components/ui/upload-area'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { useI18n } from '@/lib/hooks/use-i18n'

export default function ResumePage() {
  const t = useI18n()
  const { user, isLoading: userLoading } = useStableUser()
  const [annotationData, setAnnotationData] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  console.log('user', user)
  useEffect(() => {
    // 尝试从localStorage恢复注释数据
    const savedAnnotations = localStorage.getItem(`annotations_${user?.id}`)
    if (savedAnnotations) {
      setAnnotationData(savedAnnotations)
    }
  }, [user])

  const handleResumeUpload = async (file: File) => {
    if (!user) {
      throw new Error('You must be logged in to upload a resume.')
    }

    // 检查文件类型
    if (!file.type || !file.type.includes('pdf')) {
      toast.error(t.resume('请上传PDF格式的文件'))
      return
    }

    // 检查文件大小（10MB限制）
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t.resume('文件大小不能超过10MB'))
      return
    }

    const supabase = createClient()
    const originalFileName = file.name
    const fileExt = originalFileName.split('.').pop() || ''
    const uniqueFileName = `resume-${Date.now()}.${fileExt}`
    const filePath = `resumes/${user.id}/${uniqueFileName}`

    try {
      if (user.resume_url) {
        try {
          const oldPath = new URL(user.resume_url).pathname.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('upload')
              .remove([`resumes/${user.id}/${oldPath}`])
          }
        } catch (deleteError) {
          console.error(
            'Failed to delete old resume, proceeding anyway:',
            deleteError
          )
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('upload')
        .upload(filePath, file)
      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage
        .from('upload')
        .getPublicUrl(filePath)
      const { error: dbError } = await supabase
        .from('UserProfile')
        .update({
          resume_url: urlData.publicUrl,
          resume_filename: originalFileName,
          resume_size: file.size,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (dbError) {
        await supabase.storage.from('upload').remove([filePath])
        throw new Error('Failed to update your profile. Please try again.')
      }

      // 数据已通过数据库更新，React Query 会在下次获取时自动更新缓存
      // 如果需要立即更新，可以调用 queryClient.invalidateQueries

      toast.success(t.resume('简历上传成功！'))
    } catch (error: any) {
      toast.error(error.message || t.resume('上传失败，请重试。'))
      // 如果上传失败，清理已上传的文件
      if (filePath) {
        await supabase.storage.from('upload').remove([filePath])
      }
    }
  }

  const handleDeleteFile = async () => {
    if (
      !user ||
      !user.resume_url ||
      !window.confirm(t.resume('确定要删除您的简历文件吗？'))
    )
      return

    setIsLoading(true)
    const supabase = createClient()
    try {
      const filePath = new URL(user.resume_url).pathname.substring(1)
      const { error: deleteError } = await supabase.storage
        .from('upload')
        .remove([filePath])
      if (deleteError) throw new Error(deleteError.message)

      const { error: dbError } = await supabase
        .from('UserProfile')
        .update({
          resume_url: null,
          resume_filename: null,
          resume_size: null,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', user.id)
      if (dbError) throw new Error(dbError.message)

      // 数据已通过数据库更新，React Query 会在下次获取时自动更新缓存

      toast.success(t.resume('简历文件已删除。'))
    } catch (error: any) {
      toast.error(error.message || t.resume('删除失败。'))
    } finally {
      setIsLoading(false)
    }
  }

  // 处理注释保存 - 现在主要用于本地备份
  const handleAnnotationSave = async (
    pdfBytes: Uint8Array,
    annotationText: string
  ) => {
    if (!user) return

    try {
      // 保存注释数据到localStorage作为备份
      localStorage.setItem(`annotations_${user.id}`, annotationText)
      setAnnotationData(annotationText)

      console.log('注释数据已备份到localStorage:', annotationText)
    } catch (error) {
      console.error('备份注释数据失败:', error)
    }
  }

  const formatSize = (bytes?: number | null) => {
    if (bytes == null) return ''
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const AttachmentMenu = () => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gray-500 hover:bg-gray-200 group-hover:bg-gray-200"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="text-gray-400 group-hover:text-gray-600"
            aria-hidden="true"
          >
            <circle cx="10" cy="4" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="10" cy="16" r="1.5" />
          </svg>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        side="bottom"
        align="end"
        className="bg-white rounded-lg shadow-xl min-w-[120px] p-1.5 z-50 border border-gray-100"
      >
        <DropdownMenu.Item asChild>
          <a
            href={user?.resume_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
          >
            {t.common('预览')}
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <a
            href={user?.resume_url || '#'}
            download={user?.resume_filename || undefined}
            className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
          >
            {t.common('下载')}
          </a>
        </DropdownMenu.Item>

        <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
        <DropdownMenu.Item
          onClick={handleDeleteFile}
          className="block px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-md cursor-pointer"
        >
          {t.common('删除')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden p-2">
        <div className="max-w-7xl mx-auto w-full flex flex-col h-full space-y-2">
          {/* 附件管理卡片 - 固定高度 */}
          <Card className="bg-white rounded-xl shadow-sm border-gray-200 flex-shrink-0 py-1 gap-1">
            <CardHeader className="flex flex-row items-center justify-between pb-0 py-0.5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                {t.resume('附件管理')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-2">
              <div className="space-y-3">
                {user?.resume_url ? (
                  <div className="group flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {user.resume_filename}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <span>{formatSize(user.resume_size)}</span>
                        {user.updatedAt && (
                          <>
                            <span className="mx-1.5">·</span>
                            <span>
                              更新于
                              {dayjs(user.updatedAt).format('YYYY.MM.DD HH:mm')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <AttachmentMenu />
                  </div>
                ) : (
                  <div className="py-2">
                    <UploadArea
                      onUpload={handleResumeUpload}
                      accept=".pdf"
                      maxSize={10 * 1024 * 1024}
                      fileType="pdf"
                      fileIconColor="bg-red-500"
                      uploadButtonText="上传简历"
                      uploadingText="上传中..."
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 简历内容卡片 - 占据剩余空间 */}
          <Card className="bg-white rounded-xl shadow-sm border-gray-200 flex-1 flex flex-col overflow-hidden py-2 gap-1">
            <CardHeader className="flex flex-row justify-between items-center pb-0 flex-shrink-0 py-0.5">
              <CardTitle className="text-sm font-semibold text-gray-800">
                {t.resume('简历内容')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {user?.resume_url ? (
                <div className="h-full">
                  <PDFViewer
                    pdfUrl={user.resume_url}
                    onSave={handleAnnotationSave}
                    initialText={annotationData}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-3 text-lg">
                    {t.resume('暂无PDF文件')}
                  </p>
                  <p className="text-sm text-gray-400 max-w-md">
                    {t.resume('请先在上方上传PDF文件，然后可以在此查看和编辑')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
