'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton } from '@/components/ui/animated-card'
import { ArrowLeft, Save, X, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePost, useUpdatePost } from '@/lib/query-hook/use-posts'
import { fetchCategories, type Category } from '@/app/actions/category'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Breadcrumb, getBlogBreadcrumbs } from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  SubtractNavBreadcrumbContainer,
  SubtractNavContainer,
} from '@/components/ui/subtractNavContainer'

const EditBlog = () => {
  const router = useRouter()
  const params = useParams()
  const locale = useLocale()
  const pathname = usePathname()
  const blogId = params.id as string
  const { canEditBlog, isLoading: userLoading } = usePermissions()

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    categoryId: '',
  })
  const [categories, setCategories] = useState<Category[]>([])

  // 使用 react-query hooks
  const { data: post, isLoading, error } = usePost(blogId)
  const updatePostMutation = useUpdatePost()
  const isSubmitting = updatePostMutation.isPending

  // 权限检查
  useEffect(() => {
    if (!userLoading && !canEditBlog()) {
      toast.error('您没有权限编辑博客文章')
      router.push(`/blog`)
    }
  }, [canEditBlog, userLoading, router, locale])

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResult = await fetchCategories()
        if (categoriesResult) {
          setCategories(categoriesResult)
        }
      } catch (error) {
        console.error('加载分类失败:', error)
        toast.error('加载分类失败')
      }
    }
    loadCategories()
  }, [])

  // 当文章数据加载完成时，更新表单数据
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        body: post.body,
        categoryId: post.category?.id || '',
      })
    }
  }, [post])

  // 处理错误情况
  useEffect(() => {
    if (error) {
      toast.error('文章加载失败')
      router.push(`/blog`)
    }
  }, [error, router, locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canEditBlog()) {
      toast.error('您没有权限编辑博客文章')
      return
    }

    if (!formData.title.trim()) {
      toast.error('请输入文章标题')
      return
    }
    if (!formData.body.trim()) {
      toast.error('请输入文章内容')
      return
    }
    if (!formData.categoryId) {
      toast.error('请选择文章分类')
      return
    }

    try {
      await updatePostMutation.mutateAsync({
        id: blogId,
        ...formData,
      })
      toast.success('文章更新成功!')
      router.push(`/blog`)
    } catch (error) {
      console.error('更新文章失败:', error)
      toast.error('更新文章失败')
    }
  }

  const handleBack = () => {
    router.push(`/blog`)
  }

  // 如果没有权限，显示权限不足页面
  if (!userLoading && !canEditBlog()) {
    return (
      <SubtractNavBreadcrumbContainer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Alert className="bg-red-500/20 border-red-500 text-white mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>权限不足</AlertDescription>
          </Alert>
          <h2 className="text-2xl font-bold text-white mb-4">访问被拒绝</h2>
          <p className="text-gray-300 mb-6">
            您没有权限编辑博客文章。只有管理员才能执行此操作。
          </p>
          <AnimatedButton
            onClick={handleBack}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            返回博客列表
          </AnimatedButton>
        </div>
      </SubtractNavBreadcrumbContainer>
    )
  }

  // 如果正在加载用户信息
  if (userLoading) {
    return (
      <SubtractNavContainer className=" bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">检查权限中...</p>
        </div>
      </SubtractNavContainer>
    )
  }

  if (isLoading) {
    return (
      <SubtractNavBreadcrumbContainer className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading blog post...</p>
        </div>
      </SubtractNavBreadcrumbContainer>
    )
  }

  return (
    <SubtractNavContainer className="bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-y-auto">
      {/* 面包屑导航 */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-6">
          <Breadcrumb
            items={getBlogBreadcrumbs(locale, pathname, post?.title)}
            className="text-gray-600"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* 左右布局容器 */}
        <SubtractNavBreadcrumbContainer className="grid grid-cols-1 lg:grid-cols-5 gap-8 ">
          {/* 左侧：文章信息 */}
          <div className="lg:col-span-2 space-y-6 overflow-y-auto">
            {/* Title */}
            <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  文章标题
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="输入文章标题..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="text-lg font-medium border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  required
                />
              </CardContent>
            </Card>

            {/* Category */}
            <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  文章分类
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card className="bg-white/98 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    <X className="h-4 w-4 mr-2" />
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? '保存中...' : '更新文章'}
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
                文章内容
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <Textarea
                  placeholder="在这里编写Markdown内容..."
                  value={formData.body}
                  onChange={(e) =>
                    setFormData({ ...formData, body: e.target.value })
                  }
                  className="flex-1 resize-none text-gray-700 leading-relaxed border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl min-h-[400px]"
                  required
                />
              </form>
            </CardContent>
          </Card>
        </SubtractNavBreadcrumbContainer>
      </div>
    </SubtractNavContainer>
  )
}

export default EditBlog
