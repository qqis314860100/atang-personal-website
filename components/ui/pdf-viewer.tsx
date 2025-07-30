'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PDFAnnotation } from '@/types/pdf'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  useAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from '@/lib/reactQuery/use-annotations'

import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Edit3,
  Eye,
  EyeOff,
  List,
} from 'lucide-react'

// 自定义样式
const pdfViewerStyles = `
  .pdf-container::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .pdf-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  .pdf-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  .pdf-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  .pdf-canvas {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
  }
  
  .pdf-canvas:hover {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    transform: translateY(-2px);
  }
  
  .toolbar-button {
    transition: all 0.2s ease;
  }
  
  .toolbar-button:hover {
    transform: translateY(-1px);
  }
  
  .page-input {
    -moz-appearance: textfield;
  }
  
  .page-input::-webkit-outer-spin-button,
  .page-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`

// 为window对象添加pdf.js库的类型声明
declare global {
  interface Window {
    pdfjsLib: any
  }

  // 扩展Performance接口以支持memory属性
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}

interface PDFViewerProps {
  pdfUrl: string
  onSave?: (pdfBytes: Uint8Array, text: string) => void
  initialText?: string
}

// 使用PDFAnnotation类型替代本地Annotation接口

export function PDFViewer({
  pdfUrl,
  onSave,
  initialText = '',
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.2)
  const [text, setText] = useState(initialText)
  const [isEditing, setIsEditing] = useState(false)
  const [editPosition, setEditPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [showAnnotationList, setShowAnnotationList] = useState(false)
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    null
  )
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [showDetail, setShowDetail] = useState<string | null>(null)

  // 使用 React Query hooks
  const { data: annotations = [], isLoading: isLoadingAnnotations } =
    useAnnotations(pdfUrl)
  const createAnnotationMutation = useCreateAnnotation()
  const updateAnnotationMutation = useUpdateAnnotation()
  const deleteAnnotationMutation = useDeleteAnnotation()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRendering, setIsRendering] = useState(false)
  const isRenderingRef = useRef(false)
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pdfDocRef = useRef<any>(null) // 存储PDF文档引用

  // 优化scale计算，避免浮点数精度问题
  const roundScale = (value: number) => Math.round(value * 10) / 10

  // 销毁PDF文档和清理资源
  const destroyPDF = useCallback(() => {
    if (pdfDocRef.current) {
      try {
        pdfDocRef.current.destroy()
        pdfDocRef.current = null
      } catch (error) {
        console.warn('销毁PDF文档时出错:', error)
      }
    }
  }, [])

  // 监控Worker状态和性能
  const monitorWorkerStatus = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Worker 配置:', {
        workerSrc: window.pdfjsLib?.GlobalWorkerOptions?.workerSrc,
        useWorkerFetch: false,
        isEvalSupported: false,
      })

      // 监控内存使用（如果可用）
      if (performance.memory) {
        console.log('内存使用情况:', {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        })
      }
    }
  }, [])

  // 注入自定义样式
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = pdfViewerStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // 初始化 canvas 尺寸
  useEffect(() => {
    if (canvasRef.current && !pdfBytes) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // 设置默认尺寸 - 更合适的尺寸
        canvas.width = 500
        canvas.height = 300

        // 绘制占位符
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // 绘制边框
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        ctx.strokeRect(0, 0, canvas.width, canvas.height)

        // 绘制占位符文本
        ctx.fillStyle = '#94a3b8'
        ctx.font = '16px system-ui, -apple-system, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('PDF 加载中...', canvas.width / 2, canvas.height / 2)
      }
    }
  }, [pdfBytes])

  // 加载PDF文件
  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true)
      setError(null)

      // 清理之前的PDF文档
      destroyPDF()

      try {
        const response = await fetch(pdfUrl)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        // 创建ArrayBuffer的副本，避免detached问题
        const bufferCopy = arrayBuffer.slice(0)
        setPdfBytes(new Uint8Array(bufferCopy))
      } catch (error) {
        console.error('加载PDF文件失败:', error)
        setError(error instanceof Error ? error.message : '加载PDF文件失败')
      } finally {
        setIsLoading(false)
      }
    }
    loadPDF()

    // 组件卸载时清理资源
    return () => {
      destroyPDF()
    }
  }, [pdfUrl, destroyPDF])

  // 渲染PDF页面
  const renderPage = useCallback(async () => {
    if (!pdfBytes || !canvasRef.current) return

    // 如果正在渲染，取消之前的渲染
    if (isRenderingRef.current) {
      return
    }

    const startTime = performance.now()
    isRenderingRef.current = true
    setIsRendering(true)
    setError(null)

    try {
      // 检查 pdfjsLib 是否已加载
      if (typeof window.pdfjsLib === 'undefined') {
        const script = document.createElement('script')
        script.src =
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.min.js'
        document.body.appendChild(script)
        script.onload = () => renderPage()
        return
      }

      // 设置PDF.js worker路径
      if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/build/pdf.worker.min.js'
      }

      // 创建pdfBytes的副本，避免detached问题
      const pdfData = new Uint8Array(pdfBytes)
      const loadingTask = window.pdfjsLib.getDocument({
        data: pdfData,
        useWorkerFetch: false,
        isEvalSupported: false,
      })
      const pdf = await loadingTask.promise

      // 存储PDF文档引用
      pdfDocRef.current = pdf

      setTotalPages(pdf.numPages)

      if (currentPage < 1 || currentPage > pdf.numPages) {
        return
      }

      const page = await pdf.getPage(currentPage)
      const viewport = page.getViewport({ scale })

      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return

      // 清除之前的渲染内容
      context.clearRect(0, 0, canvas.width, canvas.height)

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport,
      }).promise

      const endTime = performance.now()
      if (process.env.NODE_ENV === 'development') {
        console.log(`PDF渲染完成，耗时: ${(endTime - startTime).toFixed(2)}ms`)
        monitorWorkerStatus()
      }
    } catch (error) {
      console.error('渲染PDF页面失败:', error)
      setError('PDF渲染失败，正在重新加载...')
      // 延迟重试渲染
      setTimeout(() => {
        setError(null)
        renderPage()
      }, 1000)
    } finally {
      isRenderingRef.current = false
      setIsRendering(false)
    }
  }, [pdfBytes, currentPage, scale])

  useEffect(() => {
    // 清除之前的定时器
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }

    // 使用防抖机制，延迟200ms执行渲染（减少延迟时间）
    renderTimeoutRef.current = setTimeout(() => {
      renderPage()
    }, 200)

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current)
      }
    }
  }, [renderPage])

  // 处理画布点击事件
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || createAnnotationMutation.isPending || isEditing)
      return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setEditPosition({ x, y })
    setIsEditing(true)
  }

  // 保存注释
  const handleSave = async () => {
    if (!editPosition || !text.trim() || createAnnotationMutation.isPending)
      return

    try {
      // 创建新注释到云端
      const newAnnotation = await createAnnotationMutation.mutateAsync({
        pdfUrl,
        x: editPosition.x,
        y: editPosition.y,
        text: text.trim(),
        page: currentPage,
      })

      if (newAnnotation) {
        // 如果有onSave回调，调用它
        if (onSave && pdfBytes) {
          const updatedAnnotations = [...annotations, newAnnotation]
          onSave(pdfBytes, JSON.stringify(updatedAnnotations))
        }

        // 清空编辑状态
        setIsEditing(false)
        setEditPosition(null)
        setText('')

        console.log('注释保存成功')
      } else {
        throw new Error('创建注释失败')
      }
    } catch (error) {
      console.error('保存注释失败:', error)
    }
  }

  // 取消编辑
  const handleCancel = () => {
    setIsEditing(false)
    setEditPosition(null)
    setText('')
  }

  // 删除注释
  const handleDeleteAnnotation = async (id: string) => {
    try {
      const success = await deleteAnnotationMutation.mutateAsync(id)
      if (success) {
        // 如果有onSave回调，调用它
        if (onSave && pdfBytes) {
          const updatedAnnotations = annotations.filter(
            (annotation) => annotation.id !== id
          )
          onSave(pdfBytes, JSON.stringify(updatedAnnotations))
        }
      }
    } catch (error) {
      console.error('删除注释失败:', error)
    }
  }

  // 编辑注释
  const handleEditAnnotation = async (annotation: PDFAnnotation) => {
    setText(annotation.text)
    setEditPosition({ x: annotation.x, y: annotation.y })
    setIsEditing(true)

    // 删除原注释
    await handleDeleteAnnotation(annotation.id)
  }

  // 跳转到注释位置
  const handleJumpToAnnotation = (annotation: PDFAnnotation) => {
    setCurrentPage(annotation.page)
    // 滚动到注释位置
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        const container = containerRef.current
        if (container) {
          const rect = canvas.getBoundingClientRect()
          const scrollTop = annotation.y - rect.height / 2
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          })
        }
      }
    }, 100)
  }

  // 重新渲染画布
  const handleRetryRender = () => {
    setError(null)
    // 立即渲染，不使用防抖
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current)
    }
    renderPage()
  }

  // 下载PDF
  const handleDownload = () => {
    if (!pdfBytes) return

    // 创建pdfBytes的副本，避免detached问题
    const pdfData = new Uint8Array(pdfBytes)
    const blob = new Blob([pdfData], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 自动滚动到高亮项
  useEffect(() => {
    if (activeAnnotationId && itemRefs.current[activeAnnotationId]) {
      itemRefs.current[activeAnnotationId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeAnnotationId, showAnnotationList])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="flex flex-col items-center justify-center flex-1 min-h-[600px]">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-gray-700 text-center mb-4 font-medium">
              {error}
            </p>
            <div className="flex justify-center">
              <Button
                onClick={handleRetryRender}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
              >
                重新加载
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* 工具栏 - 固定在顶部，不参与滚动 */}
      <div className="bg-gray-50 px-4 sm:px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center justify-center sm:justify-start space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || isRendering}
              className="toolbar-button flex items-center space-x-1 h-7"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="hidden sm:inline">第</span>
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page)
                  }
                }}
                className="page-input w-12 h-7 text-center text-sm"
                min={1}
                max={totalPages}
              />
              <span className="hidden sm:inline">页，共 {totalPages} 页</span>
              <span className="sm:hidden">/ {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage >= totalPages || isRendering}
              className="toolbar-button flex items-center space-x-1 h-7"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newScale = roundScale(Math.max(0.5, scale - 0.3))
                setScale(newScale)
              }}
              disabled={isRendering}
              className="toolbar-button flex items-center space-x-1 h-7"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>

            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newScale = roundScale(scale + 0.3)
                setScale(newScale)
              }}
              disabled={isRendering}
              className="toolbar-button flex items-center space-x-1 h-7"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="toolbar-button flex items-center space-x-1 h-7"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* 注释管理按钮 */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnnotations(!showAnnotations)}
                disabled={
                  createAnnotationMutation.isPending ||
                  updateAnnotationMutation.isPending ||
                  deleteAnnotationMutation.isPending
                }
                className="toolbar-button flex items-center space-x-1 h-7"
                title={showAnnotations ? '隐藏注释' : '显示注释'}
              >
                {showAnnotations ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </Button>

              {annotations.length > 0 && (
                <>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <List className="w-4 h-4" />
                    <span>{annotations.length}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnnotationList(!showAnnotationList)}
                    disabled={
                      createAnnotationMutation.isPending ||
                      updateAnnotationMutation.isPending ||
                      deleteAnnotationMutation.isPending
                    }
                    className="toolbar-button flex items-center space-x-1 h-7"
                    title={showAnnotationList ? '隐藏注释列表' : '显示注释列表'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF显示区域 - 占据剩余空间，可滚动 */}
      <div
        ref={containerRef}
        className="pdf-container relative overflow-auto bg-gray-100 p-2 flex-1"
        style={{ minHeight: '300px' }}
      >
        <div className="flex justify-center items-start py-2">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={`pdf-canvas rounded-lg transition-all ${
                createAnnotationMutation.isPending ||
                updateAnnotationMutation.isPending ||
                deleteAnnotationMutation.isPending
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-crosshair'
              }`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                minWidth: '500px',
                minHeight: '300px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            />

            {/* 编辑提示 */}
            <div className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2 shadow-lg">
              <Edit3 className="w-4 h-4" />
              <span>
                {createAnnotationMutation.isPending ||
                updateAnnotationMutation.isPending ||
                deleteAnnotationMutation.isPending
                  ? '保存中...'
                  : isLoadingAnnotations
                  ? '加载注释中...'
                  : '点击添加注释'}
              </span>
            </div>

            {/* 注释标记 */}
            {showAnnotations &&
              annotations
                .filter((annotation) => annotation.page === currentPage)
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
                .map((annotation, index) => (
                  <div
                    key={annotation.id}
                    className={`absolute w-6 h-6 bg-yellow-400 border-2 border-yellow-600 rounded-full transition-colors shadow-lg ${
                      createAnnotationMutation.isPending ||
                      updateAnnotationMutation.isPending ||
                      deleteAnnotationMutation.isPending
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-yellow-300'
                    }`}
                    style={{
                      left: annotation.x - 12,
                      top: annotation.y - 12,
                    }}
                    onClick={() => {
                      if (
                        !createAnnotationMutation.isPending &&
                        !updateAnnotationMutation.isPending &&
                        !deleteAnnotationMutation.isPending
                      ) {
                        setShowAnnotationList(true)
                        setActiveAnnotationId(annotation.id)
                        setShowDetail(annotation.id)
                      }
                    }}
                    title={annotation.text.slice(0, 20)}
                  >
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-yellow-800">
                      {index + 1}
                    </div>
                  </div>
                ))}

            {/* 渲染状态指示器 */}
            {isRendering && (
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm flex items-center space-x-2 shadow-lg">
                <LoadingSpinner size="sm" text="渲染中..." variant="wave" />
              </div>
            )}

            {/* 加载状态指示器 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
                <LoadingSpinner size="lg" text="正在加载PDF..." />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 编辑对话框 */}
      {isEditing && editPosition && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* 对话框 */}
          <div
            className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full mx-4"
            style={{
              left: (document.documentElement.clientWidth - 350) / 2,
              top: Math.min(editPosition.y, window.innerHeight - 300),
            }}
          >
            {/* 对话框头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">添加注释</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 对话框内容 */}
            <div className="p-6">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请输入注释内容..."
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                autoFocus
              />

              {/* 按钮组 */}
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="px-6 py-2.5 rounded-lg"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    !text.trim() ||
                    createAnnotationMutation.isPending ||
                    updateAnnotationMutation.isPending ||
                    deleteAnnotationMutation.isPending
                  }
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAnnotationMutation.isPending ||
                  updateAnnotationMutation.isPending ||
                  deleteAnnotationMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>保存中...</span>
                    </div>
                  ) : (
                    '保存'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 注释列表侧边栏 */}
      <div
        className={`fixed top-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 transition-transform duration-300 ${
          showAnnotationList ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ height: '100vh', overflowY: 'auto' }}
      >
        {annotations.length > 0 && (
          <>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    注释列表
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    共 {annotations.length} 条注释
                  </p>
                </div>
                <button
                  onClick={() => setShowAnnotationList(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div
              className="overflow-y-auto"
              style={{ maxHeight: 'calc(100vh - 120px)' }}
            >
              {annotations
                .sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
                .map((annotation, index) => (
                  <div
                    key={annotation.id}
                    ref={(el) => {
                      itemRefs.current[annotation.id] = el
                    }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      activeAnnotationId === annotation.id
                        ? 'bg-yellow-100'
                        : ''
                    }`}
                    onClick={() => {
                      setActiveAnnotationId(annotation.id)
                      setShowDetail(annotation.id)
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-yellow-400 border-2 border-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-500">
                            第 {annotation.page} 页
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(annotation.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-1 hover:text-blue-600 transition-colors">
                          {showDetail === annotation.id
                            ? annotation.text
                            : annotation.text.slice(0, 20) +
                              (annotation.text.length > 20 ? '...' : '')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAnnotation(annotation)
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteAnnotation(annotation.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="删除"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
