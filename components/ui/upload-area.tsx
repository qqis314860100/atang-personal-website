import React, { useState, useRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UploadCloud, File as FileIcon, X } from 'lucide-react'
import { useI18n } from '@/utils/i18n'

type UploadAreaProps = {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number
  className?: string
  idleContent?: ReactNode
  disabled?: boolean
}

export function UploadArea({
  onUpload,
  accept,
  maxSize = 1024 * 1024 * 8, // 8MB default
  className,
  idleContent,
  disabled,
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
    if (maxSize && selectedFile.size > maxSize) {
      setError(`${t.common('文件过大，最大允许')} ${formatSize(maxSize)}.`)
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

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full p-8 border-2 border-dashed rounded-xl text-center transition-all duration-300',
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
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative">
              <UploadCloud className="w-16 h-16 text-gray-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-700">
                {t.common('上传文件')}
              </h3>
              <p className="text-gray-500">
                {t.common('点击或拖拽文件至此区域上传')}
              </p>
              <p className="text-sm text-gray-400">
                支持格式: {accept?.replace('.', '').toUpperCase() || 'PDF'} •
                最大文件: {formatSize(maxSize)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center justify-center gap-6 text-left">
            <div className="flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <FileIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-semibold text-gray-800 text-base">
                  {file.name}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {formatSize(file.size)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={handleUploadClick}
                disabled={isUploading || disabled}
                className="rounded-lg bg-blue-600 px-8 py-2 text-white hover:bg-blue-700 transition-colors"
                size="default"
              >
                {isUploading ? t.common('上传中...') : t.common('上传文件')}
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setFile(null)
                  setError(null)
                }}
                disabled={isUploading}
                className="rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  )
}
