'use client'

import { useParams, usePathname } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { usePost } from '@/lib/query-hook/use-posts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Edit, Trash2 } from 'lucide-react'
import ViewCounter from '@/components/view-counter'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useDeletePost } from '@/lib/query-hook/use-posts'
import toast from 'react-hot-toast'
import { Breadcrumb, getBlogBreadcrumbs } from '@/components/ui/breadcrumb'
import { useLocale } from 'next-intl'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'
import { useMemo } from 'react'

// 目录项接口
interface TocItem {
  id: string
  text: string
  level: number
}

// 生成目录的函数
const generateToc = (content: string): TocItem[] => {
  const lines = content.split('\n')
  const toc: TocItem[] = []

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // 匹配 Markdown 标题
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]/g, '-')}`

      toc.push({
        id,
        text,
        level,
      })
    }
  })

  return toc
}

// 目录组件
const TableOfContents = ({ toc }: { toc: TocItem[] }) => {
  const scrollToHeading = (id: string) => {
    console.log('点击目录项，ID:', id)
    const element = document.getElementById(id)
    console.log('找到元素:', element)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      console.log('滚动到元素')
    } else {
      console.log('未找到元素，ID:', id)
    }
  }

  return (
    <div className="space-y-3 text-sm">
      {toc.length === 0 ? (
        <div className="text-gray-500 italic text-center py-4">暂无目录</div>
      ) : (
        toc.map((item, index) => (
          <div
            key={index}
            className={`cursor-pointer hover:text-blue-600 transition-all duration-200 rounded-lg px-2 py-1 hover:bg-blue-50 ${
              item.level === 1
                ? 'font-semibold text-gray-900'
                : item.level === 2
                ? 'ml-4 text-gray-800'
                : item.level === 3
                ? 'ml-8 text-gray-700'
                : 'ml-12 text-gray-600'
            }`}
            onClick={() => scrollToHeading(item.id)}
          >
            {item.text}
          </div>
        ))
      )}
    </div>
  )
}

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const postId = params.id as string

  const { data: post, isLoading, error } = usePost(postId)
  const deletePostMutation = useDeletePost()

  // 生成目录
  const toc = useMemo(() => {
    if (!post?.body) return []
    const generatedToc = generateToc(post.body)
    console.log('生成的目录:', generatedToc)
    return generatedToc
  }, [post?.body])

  const handleEdit = () => {
    router.push(`/blog/edit/${postId}`)
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？')) return

    try {
      await deletePostMutation.mutateAsync(postId)
      toast.success('文章删除成功')
      router.push(`/blog`)
    } catch (error) {
      toast.error('删除失败，请重试')
    }
  }

  const handleBack = () => {
    router.push(`/blog`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded mb-6 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded mb-8 w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                文章未找到
              </h1>
              <p className="text-gray-600 mb-6">
                抱歉，您要查看的文章不存在或已被删除。
              </p>
              <Button
                onClick={handleBack}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回博客列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb
            items={getBlogBreadcrumbs(locale, pathname, post?.title)}
          />
        </div>
      </div>

      {/* 主内容区域 - 左右布局 */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：目录和操作 */}
          <div className="lg:col-span-1">
            {/* 返回按钮 - 桌面端固定 */}
            <div className="hidden lg:block sticky top-[120px] z-30">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回博客列表
              </Button>
            </div>

            {/* 文章目录 - 桌面端固定 */}
            <div className="hidden lg:block sticky top-[200px] z-30">
              <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl max-h-[calc(100vh-300px)] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    文章目录
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <TableOfContents toc={toc} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 右侧：文章内容 */}
          <div className="lg:col-span-3 col-span-1">
            {/* 标题和操作按钮 */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {post.title}
                </h1>

                <div className="flex items-center gap-6 text-gray-600 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{post.author || '匿名用户'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                  <ViewCounter
                    postId={post.id}
                    initialViewCount={post.viewCount || 0}
                  />
                  {post.category && (
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {post.category.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deletePostMutation.isPending}
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletePostMutation.isPending ? '删除中...' : '删除'}
                </Button>
              </div>
            </div>

            {/* 文章内容 */}
            <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-blue-600 prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-li:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypePrismPlus]}
                    components={{
                      h1: ({ children, ...props }) => {
                        const text = children?.toString() || ''
                        const id = `heading-${text
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')}`
                        return (
                          <h1
                            id={id}
                            {...props}
                            className="text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0"
                          >
                            {children}
                          </h1>
                        )
                      },
                      h2: ({ children, ...props }) => {
                        const text = children?.toString() || ''
                        const id = `heading-${text
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')}`
                        return (
                          <h2
                            id={id}
                            {...props}
                            className="text-2xl font-bold text-gray-900 mb-3 mt-6"
                          >
                            {children}
                          </h2>
                        )
                      },
                      h3: ({ children, ...props }) => {
                        const text = children?.toString() || ''
                        const id = `heading-${text
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')}`
                        return (
                          <h3
                            id={id}
                            {...props}
                            className="text-xl font-bold text-gray-900 mb-3 mt-5"
                          >
                            {children}
                          </h3>
                        )
                      },
                      h4: ({ children, ...props }) => {
                        const text = children?.toString() || ''
                        const id = `heading-${text
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')}`
                        return (
                          <h4
                            id={id}
                            {...props}
                            className="text-lg font-bold text-gray-900 mb-2 mt-4"
                          >
                            {children}
                          </h4>
                        )
                      },
                      h5: ({ children, ...props }) => {
                        const text = children?.toString() || ''
                        const id = `heading-${text
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')}`
                        return (
                          <h5
                            id={id}
                            {...props}
                            className="text-base font-bold text-gray-900 mb-2 mt-4"
                          >
                            {children}
                          </h5>
                        )
                      },
                      h6: ({ children, ...props }) => {
                        const text = children?.toString() || ''
                        const id = `heading-${text
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')}`
                        return (
                          <h6
                            id={id}
                            {...props}
                            className="text-sm font-bold text-gray-900 mb-2 mt-4"
                          >
                            {children}
                          </h6>
                        )
                      },
                      p: ({ children, ...props }) => (
                        <p
                          {...props}
                          className="text-gray-700 leading-relaxed mb-4"
                        >
                          {children}
                        </p>
                      ),
                      ul: ({ children, ...props }) => (
                        <ul
                          {...props}
                          className="list-disc list-inside text-gray-700 mb-4 space-y-1"
                        >
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol
                          {...props}
                          className="list-decimal list-inside text-gray-700 mb-4 space-y-1"
                        >
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }) => (
                        <li {...props} className="text-gray-700">
                          {children}
                        </li>
                      ),
                      code: ({ children, ...props }) => (
                        <code
                          {...props}
                          className="bg-gray-100 text-blue-600 px-1 py-0.5 rounded text-sm font-mono"
                        >
                          {children}
                        </code>
                      ),
                      pre: ({ children, ...props }) => (
                        <pre
                          {...props}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto mb-4"
                        >
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {post.body}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 移动端浮动返回按钮 */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <Button
          onClick={handleBack}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
