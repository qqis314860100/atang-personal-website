import React, { useState, useRef, ReactNode } from 'react'
import { cn } from '@/utils/utils'
import { Button } from '@/components/ui/button'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { useI18n } from '@/app/hooks/use-i18n'

type UploadAreaProps = {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number
  className?: string
  idleContent?: ReactNode
  disabled?: boolean
  // 新增的通用化配置
  fileType?: 'pdf' | 'markdown' | 'image' | 'document' | 'custom'
  customValidation?: (file: File) => string | null // 返回错误信息或null
  uploadButtonText?: string
  uploadingText?: string
  fileIcon?: ReactNode
  fileIconColor?: string
}

export function UploadArea({
  onUpload,
  accept,
  maxSize = 1024 * 1024 * 8, // 8MB default
  className,
  idleContent,
  disabled,
  fileType = 'custom',
  customValidation,
  uploadButtonText,
  uploadingText,
  fileIcon,
  fileIconColor = 'bg-red-500',
}: UploadAreaProps) {
  const t = useI18n()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return
    setError(null)

    // 文件大小验证
    if (maxSize && selectedFile.size > maxSize) {
      setError(`${t.common('文件过大，最大允许')} ${formatSize(maxSize)}.`)
      return
    }

    // 自定义验证
    if (customValidation) {
      const validationError = customValidation(selectedFile)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    // 文件类型验证
    if (fileType === 'markdown' && !selectedFile.name.endsWith('.md')) {
      setError('请上传 .md 文件')
      return
    }

    if (fileType === 'pdf' && !selectedFile.type.includes('pdf')) {
      setError('请上传 PDF 文件')
      return
    }

    setFile(selectedFile)
  }

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e)
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e)
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleUploadClick = async () => {
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      await onUpload(file)
      setFile(null)
    } catch (uploadError: any) {
      setError(uploadError.message || 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 获取文件类型显示名称
  const getFileTypeDisplayName = () => {
    switch (fileType) {
      case 'pdf':
        return 'PDF'
      case 'markdown':
        return 'Markdown'
      case 'image':
        return '图片'
      case 'document':
        return '文档'
      default:
        return accept?.replace('.', '').toUpperCase() || '文件'
    }
  }

  // 获取默认文件图标
  const getDefaultFileIcon = () => {
    if (fileIcon) return fileIcon

    switch (fileType) {
      case 'pdf':
        return <FileIcon className="h-7 w-7 text-white" />
      case 'markdown':
        return <FileIcon className="h-7 w-7 text-white" />
      default:
        return <FileIcon className="h-7 w-7 text-white" />
    }
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full p-6 border-2 border-dashed rounded-lg text-center transition-all duration-300',
          'border-gray-300 bg-gray-50/50',
          {
            'border-blue-500 bg-blue-50/80 shadow-lg scale-[1.02]': isDragging,
            'hover:border-blue-400 hover:bg-blue-50/70 hover:shadow-md cursor-pointer':
              !disabled && !file,
            'cursor-not-allowed bg-gray-100/50 text-gray-400': disabled,
          }
        )}
        onClick={() => !file && inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragEvents}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="hidden"
          disabled={disabled || isUploading}
        />
        {!file ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <UploadCloud className="w-12 h-12 text-gray-400" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-gray-700">
                {t.common('上传文件')}
              </h3>
              <p className="text-sm text-gray-500">
                {t.common('点击或拖拽文件至此区域上传')}
              </p>
              <p className="text-xs text-gray-400">
                支持格式: {getFileTypeDisplayName()} • 最大文件:{' '}
                {formatSize(maxSize)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-4 text-left">
            <div className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 ${fileIconColor} rounded-lg flex items-center justify-center`}
                >
                  {getDefaultFileIcon()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold text-gray-800 text-sm">
                  {file.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {formatSize(file.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleUploadClick}
                disabled={isUploading || disabled}
                className="rounded-lg bg-blue-600 px-6 py-1.5 text-white hover:bg-blue-700 transition-colors text-sm"
                size="sm"
              >
                {isUploading
                  ? uploadingText || t.common('上传中...')
                  : uploadButtonText || t.common('上传文件')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFile(null)
                  setError(null)
                }}
                disabled={isUploading}
                className="rounded-lg text-gray-600 hover:bg-gray-50 text-sm px-6 py-1.5"
              >
                <X className="h-3 w-3 mr-1.5" />
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-center text-xs text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
