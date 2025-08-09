'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Edit3,
  Eye,
  Save,
  Download,
  X,
  FileText,
  FileText as FileTextIcon,
  Tag,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'
import { UploadArea } from '@/app/components/upload/upload-area'
import { fetchCategories, type Category } from '@/app/actions/category'
import { useCreatePost } from '@/lib/query-hook/use-posts'
import { Breadcrumb, getBlogBreadcrumbs } from '@/components/ui/breadcrumb'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  SubtractNavBreadcrumbContainer,
  SubtractNavContainer,
} from '@/components/ui/subtractNavContainer'

interface BlogData {
  title: string
  content: string
  description: string
  categoryId: string
}

export default function CreateBlogPage() {
  const locale = useLocale()
  const pathname = usePathname()
  const [blogData, setBlogData] = useState<BlogData>({
    title: '',
    content: '',
    description: '',
    categoryId: '',
  })
  const [activeTab, setActiveTab] = useState('edit')
  const [categories, setCategories] = useState<Category[]>([])
  const createPostMutation = useCreatePost()
  const isLoading = createPostMutation.isPending

  // 获取分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoryList = await fetchCategories()
        setCategories(categoryList)
      } catch (error) {
        console.error('Failed to load categories:', error)
        toast.error('获取分类列表失败')
      }
    }
    loadCategories()
  }, [])

  const handleFileUpload = async (file: File) => {
    // 验证文件类型
    if (!file.name.endsWith('.md')) {
      throw new Error('请上传 .md 文件')
    }

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
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
            description,
            content: markdownContent,
            categoryId: blogData.categoryId,
          })

          toast.success('文件解析成功')
          resolve()
        } catch (error) {
          reject(new Error('文件解析失败'))
        }
      }

      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }

  const handleSave = async () => {
    if (!blogData.title.trim()) {
      toast.error('请输入文章标题')
      return
    }

    if (!blogData.content.trim()) {
      toast.error('请输入文章内容')
      return
    }

    if (!blogData.categoryId) {
      toast.error('请选择文章分类')
      return
    }

    try {
      await createPostMutation.mutateAsync({
        title: blogData.title,
        body: blogData.content,
        description: blogData.description,
        categoryId: blogData.categoryId,
      })

      toast.success('文章创建成功')
      // 清空表单
      setBlogData({
        title: '',
        content: '',
        description: '',
        categoryId: '',
      })
    } catch (error) {
      toast.error('创建失败，请重试')
    }
  }

  const handleDownload = () => {
    const content = `# ${blogData.title}\n\n${
      blogData.description ? `## ${blogData.description}\n\n` : ''
    }${blogData.content}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${blogData.title || '未命名文章'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('文件下载成功')
  }

  const clearContent = () => {
    setBlogData({
      title: '',
      content: '',
      description: '',
      categoryId: '',
    })
    toast.success('内容已清空')
  }

  return (
    <SubtractNavContainer>
      {/* 面包屑导航 */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <Breadcrumb items={getBlogBreadcrumbs(locale, pathname)} />
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* 左右布局容器 */}
        <SubtractNavBreadcrumbContainer className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 左侧：文章信息 */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {/* 文件上传 */}
            <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  文件上传
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UploadArea
                  onUpload={handleFileUpload}
                  accept=".md"
                  maxSize={1024 * 1024 * 2} // 2MB
                  fileType="markdown"
                  fileIconColor="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                  fileIcon={<FileTextIcon className="h-6 w-6 text-white" />}
                  uploadButtonText="解析MD文件"
                  uploadingText="解析中..."
                  className="w-full"
                  idleContent={
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse shadow-xl">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-700 text-base font-semibold mb-2">
                        拖拽文件到此处
                      </p>
                      <p className="text-gray-500 text-sm">
                        或点击选择Markdown文件
                      </p>
                    </div>
                  }
                />
              </CardContent>
            </Card>

            {/* 文章信息 */}
            <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  文章信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 标题 */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700 font-medium">
                    文章标题
                  </Label>
                  <Input
                    id="title"
                    value={blogData.title}
                    onChange={(e) =>
                      setBlogData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="输入一个吸引人的标题..."
                    className="text-lg font-medium"
                  />
                </div>

                {/* 描述 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-gray-700 font-medium"
                  >
                    文章描述
                  </Label>
                  <Input
                    id="description"
                    value={blogData.description}
                    onChange={(e) =>
                      setBlogData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="简短描述文章内容..."
                  />
                </div>

                {/* 分类 */}
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-gray-700 font-medium"
                  >
                    文章分类
                  </Label>
                  <Select
                    value={blogData.categoryId}
                    onValueChange={(value) =>
                      setBlogData((prev) => ({
                        ...prev,
                        categoryId: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择文章分类..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={clearContent}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    <X className="h-4 w-4 mr-2" />
                    清空
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? '创建中...' : '创建文章'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：内容编辑 */}
          <Card className="lg:col-span-3 bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                内容编辑
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full flex-1 flex flex-col"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1">
                  <TabsTrigger
                    value="edit"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    编辑模式
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600"
                  >
                    预览模式
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="flex-1 mt-4">
                  <div className="flex flex-col h-full">
                    <Label
                      htmlFor="content"
                      className="text-gray-700 font-medium mb-2"
                    >
                      文章内容
                    </Label>
                    <Textarea
                      id="content"
                      value={blogData.content}
                      onChange={(e) =>
                        setBlogData((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                      placeholder="在这里编写Markdown内容..."
                      className="flex-1 resize-none text-gray-700 leading-relaxed border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl min-h-[400px]"
                    />
                    <div className="flex justify-between items-center text-sm text-gray-500 mt-2">
                      <span>支持Markdown语法</span>
                      <span>{blogData.content.length}字符</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="preview" className="flex-1 mt-4">
                  <div className="h-full overflow-y-auto">
                    <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-blue-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 rounded-xl p-4 bg-gray-50">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypePrismPlus]}
                      >
                        {blogData.content || '*暂无内容*'}
                      </ReactMarkdown>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </SubtractNavBreadcrumbContainer>
      </div>
    </SubtractNavContainer>
  )
}
