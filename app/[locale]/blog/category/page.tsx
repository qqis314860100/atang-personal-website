'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Edit3,
  Trash2,
  Tag,
  FileText,
  Shield,
  AlertTriangle,
  MessageCircle,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { type Category } from '@/app/actions/category'
import { Breadcrumb, getBlogBreadcrumbs } from '@/components/ui/breadcrumb'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/lib/query-hook/use-category'
import { useForm } from 'react-hook-form'
import {
  categorySchema,
  TCategorySchema,
  TUpdateCategorySchema,
  updateCategorySchema,
} from '@/schemas/blogCategorySchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@/components/ui/textarea'
import { SubtractNavContainer } from '@/components/ui/subtractNavContainer'

export default function CategoryManagePage() {
  const locale = useLocale()
  const pathname = usePathname()

  // 使用 react-query 获取分类数据
  const { data: categories = [], isLoading: loading, error } = useCategories()

  const createCategoryMutation = useCreateCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  )

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,

    formState: { errors: errorsCreate },
  } = useForm<TCategorySchema>({
    resolver: zodResolver(categorySchema),
  })

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    watch: watchUpdate,
    formState: { errors: errorsUpdate },
  } = useForm<TUpdateCategorySchema>({
    resolver: zodResolver(updateCategorySchema),
    mode: 'onChange', // 改为实时验证，错误提示更及时
    defaultValues: {
      id: '',
      name: '',
      description: '',
    },
  })
  // 创建分类
  const handleCreateCategory = async (data: TCategorySchema) => {
    createCategoryMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.success) {
          resetCreate()
          setIsCreateDialogOpen(false)
        }
      },
    })
  }

  // 更新分类
  const handleUpdateCategory = async (data: TUpdateCategorySchema) => {
    console.log('=== 开始更新分类 ===')
    console.log('接收到的数据:', data)
    console.log('数据验证:', updateCategorySchema.safeParse(data))
    updateCategoryMutation.mutate(data, {
      onSuccess: (result) => {
        if (result.success) {
          setIsEditDialogOpen(false)
          resetUpdate()
        }
      },
      onError(error, variables, context) {
        console.log(error)
      },
    })
  }

  // 删除分类
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return

    deleteCategoryMutation.mutate(deletingCategory.id, {
      onSuccess: (result) => {
        if (result.success) {
          setDeletingCategory(null)
          setIsDeleteDialogOpen(false)
        }
      },
    })
  }

  // 获取当前的提交状态
  const submitting =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending

  // 处理错误状态
  if (error) {
    toast.error('加载分类失败')
  }

  return (
    <SubtractNavContainer>
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 面包屑导航 */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6">
            <Breadcrumb items={getBlogBreadcrumbs(locale, pathname)} />
          </div>
        </div>

        {/* 操作区域 */}
        <Card className="mb-8 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-800/95 dark:via-gray-800/95 dark:to-gray-900/95 backdrop-blur-sm border-slate-200/60 dark:border-gray-700/60 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  分类列表
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 bg-slate-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {categories.length} 个分类
                </span>
              </div>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    新建分类
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-violet-600" />
                      创建新分类
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmitCreate(handleCreateCategory)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">分类名称</Label>
                      <Input
                        id="categoryName"
                        {...registerCreate('name')}
                        placeholder="输入分类名称..."
                        className="border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500"
                      />
                      {errorsCreate.name && (
                        <div className="text-red-500 text-sm mt-1">
                          {errorsCreate.name.message}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">分类描述</Label>
                      <Textarea
                        id="description"
                        {...registerCreate('description')}
                        placeholder="输入分类描述..."
                        className="border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-violet-500"
                      />
                      {errorsCreate.description && (
                        <div className="text-red-500 text-sm mt-1">
                          {errorsCreate.description.message}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateDialogOpen(false)
                        }}
                        disabled={submitting}
                      >
                        取消
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                      >
                        {submitting ? '创建中...' : '创建'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  加载中...
                </span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold mb-2">
                  暂无分类
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  点击上方按钮创建第一个分类
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-white/80 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105 h-full flex flex-col"
                  >
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex-shrink-0"></div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                            {category.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              resetUpdate({
                                id: category.id,
                                name: category.name,
                                description: category.description || '',
                              })
                              setIsEditDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit3 className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setDeletingCategory(category)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3 flex-1">
                        {/* 文章数量 */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">
                            {category.postCount || 0} 篇文章
                          </span>
                        </div>

                        {/* 分类描述 */}
                        {category.description && (
                          <div className="min-h-0">
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 break-words">
                              {category.description}
                            </p>
                          </div>
                        )}

                        {/* 更新时间 */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mt-auto">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {category.updatedAt
                              ? new Date(category.updatedAt).toLocaleDateString(
                                  'zh-CN',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )
                              : '未知时间'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 编辑分类对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                编辑分类
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmitUpdate(handleUpdateCategory)}
              className="space-y-4"
            >
              <input type="hidden" {...registerUpdate('id')} />

              {/* ID 字段错误显示 */}
              {errorsUpdate.id && (
                <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                  {errorsUpdate.id.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="editCategoryName">分类名称</Label>
                <Input
                  id="editCategoryName"
                  {...registerUpdate('name')}
                  placeholder="输入分类名称..."
                  className={`border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${
                    errorsUpdate.name ? 'border-red-500' : ''
                  }`}
                />
                {errorsUpdate.name && (
                  <div className="text-red-500 text-sm mt-1">
                    {errorsUpdate.name.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="editCategoryDescription">分类描述</Label>
                <Textarea
                  id="editCategoryDescription"
                  {...registerUpdate('description')}
                  placeholder="输入分类描述..."
                  className={`border-slate-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 ${
                    errorsUpdate.description ? 'border-red-500' : ''
                  }`}
                />
                {errorsUpdate.description && (
                  <div className="text-red-500 text-sm mt-1">
                    {errorsUpdate.description.message}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    resetUpdate()
                  }}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !watchUpdate('name')?.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {submitting ? '更新中...' : '更新'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* 删除分类对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                确认删除
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                确定要删除分类{' '}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{deletingCategory?.name}"
                </span>{' '}
                吗？
              </p>
              {deletingCategory?.postCount &&
                deletingCategory.postCount > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      此分类下还有 {deletingCategory.postCount}{' '}
                      篇文章，无法删除。
                    </p>
                  </div>
                )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    setDeletingCategory(null)
                  }}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  onClick={handleDeleteCategory}
                  disabled={
                    submitting || (deletingCategory?.postCount || 0) > 0
                  }
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  {submitting ? '删除中...' : '删除'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SubtractNavContainer>
  )
}
