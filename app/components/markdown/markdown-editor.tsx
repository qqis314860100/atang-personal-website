'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Edit3, Eye, Save, Download, X } from 'lucide-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'

interface MarkdownEditorProps {
  initialValue?: string
  onSave?: (data: {
    title: string
    content: string
    description: string
  }) => void
  onDownload?: (content: string) => void
  className?: string
}

export function MarkdownEditor({
  initialValue = '',
  onSave,
  onDownload,
  className = '',
}: MarkdownEditorProps) {
  const [blogData, setBlogData] = useState({
    title: '',
    content: initialValue,
    description: '',
  })
  const [activeTab, setActiveTab] = useState('edit')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.md')) {
      toast.error('请上传 .md 文件')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string

      // 解析MD文件内容
      const lines = content.split('\n')
      let title = '未命名文章'
      let description = ''
      let markdownContent = content

      // 查找标题（第一个 # 开头的行）
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
          title = lines[i].replace(/^#\s*/, '')
          // 如果下一行是 ## 开头，作为描述
          if (i + 1 < lines.length && lines[i + 1].startsWith('## ')) {
            description = lines[i + 1].replace(/^##\s*/, '')
            markdownContent = lines.slice(i + 2).join('\n')
          } else {
            markdownContent = lines.slice(i + 1).join('\n')
          }
          break
        }
      }

      setBlogData({
        title,
        content: markdownContent,
        description,
      })

      toast.success('MD文件解析成功')
    }
    reader.readAsText(file)
  }, [])

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const mdFile = files.find((file) => file.name.endsWith('.md'))

      if (mdFile) {
        handleFileUpload(mdFile)
      } else {
        toast.error('请拖拽 .md 文件')
      }
    },
    [handleFileUpload]
  )

  const handleSave = () => {
    if (!blogData.title.trim()) {
      toast.error('请输入文章标题')
      return
    }
    if (!blogData.content.trim()) {
      toast.error('请输入文章内容')
      return
    }

    if (onSave) {
      onSave(blogData)
    } else {
      toast.success('文章保存成功')
    }
  }

  const handleDownload = () => {
    const fullContent = `# ${blogData.title}\n\n${
      blogData.description ? `## ${blogData.description}\n\n` : ''
    }${blogData.content}`

    if (onDownload) {
      onDownload(fullContent)
    } else {
      const blob = new Blob([fullContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${blogData.title || 'blog'}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('MD文件下载成功')
    }
  }

  const clearContent = () => {
    setBlogData({
      title: '',
      content: '',
      description: '',
    })
    toast.success('内容已清空')
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 上传区域 */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            上传MD文件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              拖拽MD文件到此处或点击上传
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              选择文件
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 编辑区域 */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            文章内容
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 标题和描述 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                标题
              </label>
              <input
                value={blogData.title}
                onChange={(e) =>
                  setBlogData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="输入文章标题"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                描述
              </label>
              <input
                value={blogData.description}
                onChange={(e) =>
                  setBlogData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="输入文章描述"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 内容编辑和预览 */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
              <TabsTrigger
                value="edit"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                编辑
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                预览
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="mt-4">
              <textarea
                value={blogData.content}
                onChange={(e) =>
                  setBlogData((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="在这里编写Markdown内容..."
                className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 overflow-y-auto">
                {blogData.content ? (
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypePrismPlus]}
                    >
                      {blogData.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center mt-20">
                    暂无内容，请在编辑模式下编写内容
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              <Save className="w-4 h-4 mr-2" />
              保存文章
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              下载MD文件
            </Button>
            <Button
              onClick={clearContent}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" />
              清空内容
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
