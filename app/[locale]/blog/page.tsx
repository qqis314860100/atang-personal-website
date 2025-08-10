'use client'

import { fetchCategories } from '@/app/actions/category'
import { useLoadingStore } from '@/app/hooks/use-loading'
import {
  Permission,
  PermissionGuard,
  usePermissions,
} from '@/app/hooks/use-permissions'
import { AnimatedCard } from '@/components/ui/animated-card'
import { Badge } from '@/components/ui/badge'
import { BlogListSkeleton } from '@/components/ui/blog-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryImage } from '@/components/ui/category-image'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ThemeCard } from '@/components/ui/theme-card'
import { Link, useRouter } from '@/i18n/navigation'
import {
  useDeletePost,
  usePopularPosts,
  usePosts,
} from '@/lib/query-hook/use-posts'
import { formatDate } from '@/lib/utils'
import {
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Magnet,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// 分类接口
interface Category {
  id: string
  name: string
  postCount?: number
}

// 计算阅读时间
const calculateReadTime = (excerpt: string) => {
  const wordsPerMinute = 200
  const words = excerpt.length / 2 // 中文字符估算
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} 分钟阅读`
}

const Blog = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()
  const { canEditBlog, canDeleteBlog } = usePermissions()

  // 使用 react-query hooks
  const {
    data: postsData,
    isLoading,
    refetch: refetchPosts,
  } = usePosts({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
  })

  const { showLoading, hideLoading } = useLoadingStore()

  // 搜索完成后显示结果
  useEffect(() => {
    if (!isLoading && searchTerm.trim() && postsData?.posts) {
      toast.success(`找到 ${postsData.posts.length} 篇文章`, {
        id: 'search-posts',
      })
    }
  }, [isLoading, searchTerm, postsData])
  const { data: popularPosts = [] } = usePopularPosts(4)
  const deletePostMutation = useDeletePost()

  const posts = postsData?.posts || []
  const totalPages = postsData?.totalPages || 1

  // 加载分类数据
  const loadCategories = async () => {
    try {
      const categoriesResult = await fetchCategories()
      if (categoriesResult) {
        setCategories(categoriesResult)
      } else {
        toast.error('获取分类失败')
      }
    } catch (error) {
      console.error('加载分类失败:', error)
      toast.error('加载分类失败')
    }
  }

  // 刷新数据
  const refreshData = async () => {
    showLoading('搜索中...')
    await refetchPosts()
    hideLoading()
  }

  // 初始加载分类
  useEffect(() => {
    loadCategories()
  }, [])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // 搜索时重置到第一页
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // 删除文章
  const handleDelete = async (id: string) => {
    if (!canDeleteBlog()) {
      toast.error('您没有权限删除博客文章')
      return
    }

    if (confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
      try {
        toast.loading('删除中...', { id: 'delete-post' })
        await deletePostMutation.mutateAsync(id)
        toast.success('文章删除成功', { id: 'delete-post' })
      } catch (error) {
        console.error('删除文章失败:', error)
        toast.error('删除文章失败', { id: 'delete-post' })
      }
    }
  }

  // 编辑文章
  const handleEdit = (id: string) => {
    if (!canEditBlog()) {
      toast.error('您没有权限编辑博客文章')
      return
    }
    console.log('Navigating to edit page:', `/blog/edit/${id}`)
    toast.loading('跳转中...', { id: 'edit-post' })
    router.push(`/blog/edit/${id}`)
  }

  // 查看文章
  const handleView = (id: string) => {
    console.log('Navigating to view page:', `/blog/${id}`)
    toast.loading('加载中...', { id: 'view-post' })
    router.push(`/blog/${id}`)
  }

  // 处理分类过滤
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  // 处理搜索
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (value.trim()) {
      toast.loading('搜索中...', { id: 'search-posts' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左侧博客文章列表 */}
        <div className="lg:col-span-3">
          {/* 搜索、筛选和操作按钮 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex-1 flex items-center gap-4">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="搜索文章..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 分类筛选 */}
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 刷新按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                title="刷新"
              >
                搜索
              </Button>
            </div>

            {/* 创建按钮 */}
            <PermissionGuard permission={Permission.CREATE_BLOG}>
              <Link href={`/blog/create`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-4 w-4 mr-2" />
                  创建文章
                </Button>
              </Link>
            </PermissionGuard>

            <PermissionGuard permission={Permission.MANAGE_SYSTEM}>
              <Link href={`/blog/category`}>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Magnet className="h-4 w-4 mr-2" />
                  管理分类
                </Button>
              </Link>
            </PermissionGuard>
          </div>

          {/* 加载状态 */}
          {isLoading ? (
            <BlogListSkeleton />
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无文章
              </h3>
              <p className="text-gray-500 mb-4">还没有发布任何文章</p>
              <PermissionGuard permission={Permission.CREATE_BLOG}>
                <Link href={`/blog/create`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建第一篇文章
                  </Button>
                </Link>
              </PermissionGuard>
            </div>
          ) : (
            <>
              {/* 博客文章卡片 */}
              <div className="space-y-3">
                {posts.map((post, index) => (
                  <AnimatedCard key={post.id} delay={index * 0.1}>
                    <ThemeCard
                      variant="elevated"
                      className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 py-0 h-60"
                    >
                      <div className="flex flex-col md:flex-row h-full">
                        {/* 文章图片 - 使用分类图片 */}
                        <div className="md:w-1/3 aspect-video md:aspect-square rounded-t-lg md:rounded-l-lg md:rounded-t-none flex items-center justify-center overflow-hidden">
                          <CategoryImage
                            categoryName={post.category?.name || ''}
                            size="lg"
                            className="w-full h-full"
                          />
                        </div>

                        {/* 文章内容 - 调整padding和字体大小 */}
                        <div className="md:w-2/3 p-4 flex flex-col">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default">
                              {post.category?.name || '未分类'}
                            </Badge>
                          </div>

                          <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                            {post.title}
                          </h3>

                          {/* 文章摘要 */}
                          <p className="text-sm text-gray-600 mb-3  flex-1">
                            {post.excerpt || '暂无内容摘要'}
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{post.author || '未知作者'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                <span>
                                  {calculateReadTime(post.excerpt || '')}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{post.viewCount || 0}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {/* 管理员操作按钮 */}

                              <PermissionGuard
                                permission={Permission.EDIT_BLOG}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(post.id)}
                                  className="text-gray-600 hover:text-blue-600 h-7 w-7 p-0"
                                  title="编辑文章"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </PermissionGuard>

                              <PermissionGuard
                                permission={Permission.DELETE_BLOG}
                              >
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(post.id)}
                                  className="text-gray-600 hover:text-red-600 h-7 w-7 p-0"
                                  title="删除文章"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </PermissionGuard>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleView(post.id)}
                                className="text-blue-500 hover:text-blue-600 font-medium text-xs"
                              >
                                查看详情 →
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ThemeCard>
                  </AnimatedCard>
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum =
                        currentPage <= 3
                          ? i + 1
                          : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i

                      if (pageNum < 1 || pageNum > totalPages) return null

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* 右侧边栏 */}
        <div className="lg:col-span-1 space-y-8">
          {/* 分类 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                分类
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  全部分类
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                    <span className="text-xs text-gray-400 ml-2">
                      ({category.postCount || 0})
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 热门文章 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                热门文章
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularPosts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    暂无热门文章
                  </p>
                ) : (
                  popularPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleView(post.id)}
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                        {post.category ? (
                          <CategoryImage
                            categoryName={post.category.name}
                            size="sm"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Blog
