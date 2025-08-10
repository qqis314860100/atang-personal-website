'use client'

import { useI18n } from '@/app/hooks/use-i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusDisplay } from '@/components/ui/status-display'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { Link, useRouter } from '@/i18n/navigation'
import { usePopularPosts } from '@/lib/query-hook/use-posts'
import { formatDate } from '@/lib/utils'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Code,
  Eye,
  Github,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

// 精选项目数据
const featuredProjects = [
  {
    id: 'blog',
    title: '个人博客系统',
    description:
      '基于 Next.js 14 和 Prisma 构建的现代化博客系统，支持 Markdown 编辑、分类管理、搜索功能等。',
    category: 'Web 开发',
    technologies: ['Next.js', 'React', 'TypeScript', 'Prisma', 'Supabase'],
    status: '已完成',
    featured: true,
    demoUrl: '/zh/blog',
    githubUrl: 'https://github.com',
  },
  {
    id: 'chat-room',
    title: '在线聊天室',
    description:
      '基于 WebSocket 的实时聊天应用，支持访客匿名聊天、在线人数统计、消息历史记录等功能。',
    category: '实时通信',
    technologies: ['WebSocket', 'React', 'Node.js', 'Socket.IO'],
    status: '已完成',
    featured: true,
    demoUrl: '/zh/project/chat-room',
    githubUrl: 'https://github.com',
  },
  {
    id: 'video-manage',
    title: '视频管理系统',
    description:
      '完整的视频管理平台，支持视频上传、编辑、分类管理、弹幕统计等功能。',
    category: '内容管理',
    technologies: ['Next.js', 'React Query', 'Prisma', 'TypeScript'],
    status: '已完成',
    featured: true,
    demoUrl: '/zh/project/video-manage',
    githubUrl: 'https://github.com',
  },
]

// 个人技能数据
const skills = [
  { name: '前端开发', level: 90, color: 'bg-blue-500' },
  { name: '后端开发', level: 85, color: 'bg-green-500' },
  { name: '数据库设计', level: 80, color: 'bg-purple-500' },
  { name: 'DevOps', level: 75, color: 'bg-orange-500' },
  { name: 'UI/UX设计', level: 70, color: 'bg-pink-500' },
]

export default function HomePage() {
  const t = useI18n()
  const router = useRouter()

  // 获取热门博客文章
  const { data: popularPosts } = usePopularPosts(3)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 英雄区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">Z</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                aTang小站
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
                全栈开发者，专注于现代Web技术栈，热爱开源和新技术
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>中国</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span>全栈开发</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>5年经验</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Link href="/blog">
                  <BookOpen className="mr-2 h-5 w-5" />
                  查看博客
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/project">
                  <Code className="mr-2 h-5 w-5" />
                  浏览项目
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  数据统计
                </Link>
              </Button>
            </div>

            {/* 状态显示 */}
            <div className="flex justify-center">
              <StatusDisplay variant="inline" showPath={false} />
            </div>
          </div>
        </div>
      </section>

      {/* 精选项目 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              精选项目
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              展示一些我最近完成的项目
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project) => (
              <ThemeCard key={project.id} variant="glass" hover={true}>
                <ThemeCardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {project.category}
                    </Badge>
                    {project.featured && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <ThemeCardTitle className="text-lg">
                    {project.title}
                  </ThemeCardTitle>
                </ThemeCardHeader>
                <ThemeCardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.technologies.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        project.status === '已完成' ? 'default' : 'outline'
                      }
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </ThemeCardContent>
              </ThemeCard>
            ))}
          </div>
        </div>
      </section>

      {/* 最新博客 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              最新博客
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              分享技术心得和开发经验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularPosts?.slice(0, 3).map((post) => (
              <ThemeCard key={post.id} variant="glass" hover={true}>
                <ThemeCardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {post.category?.name || '未分类'}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="h-3 w-3" />
                      {post.viewCount || 0}
                    </div>
                  </div>
                  <ThemeCardTitle className="text-lg line-clamp-2">
                    {post.title}
                  </ThemeCardTitle>
                </ThemeCardHeader>
                <ThemeCardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3">
                    {post.body?.slice(0, 100) || '暂无内容摘要'}...
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(new Date(post.createdAt))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {Math.ceil((post.body?.length || 0) / 200)}分钟
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-4"
                    asChild
                  >
                    <Link href={`/blog/${post.id}`}>
                      阅读全文
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </ThemeCardContent>
              </ThemeCard>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/blog">
                查看更多文章
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 技能展示 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              技能专长
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              我在以下领域有丰富的经验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {skills.map((skill) => (
              <ThemeCard key={skill.name} variant="glass">
                <ThemeCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {skill.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {skill.level}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${skill.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </ThemeCardContent>
              </ThemeCard>
            ))}
          </div>
        </div>
      </section>

      {/* 联系信息 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              联系我
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              欢迎交流技术和合作机会
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ThemeCard variant="glass">
              <ThemeCardContent className="text-center p-6">
                <Mail className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">邮箱</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  314860100@qq.com
                </p>
              </ThemeCardContent>
            </ThemeCard>

            <ThemeCard variant="glass">
              <ThemeCardContent className="text-center p-6">
                <Github className="h-8 w-8 text-gray-900 dark:text-white mx-auto mb-4" />
                <h3 className="font-semibold mb-2">GitHub</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  github.com/atang
                </p>
              </ThemeCardContent>
            </ThemeCard>

            <ThemeCard variant="glass">
              <ThemeCardContent className="text-center p-6">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">在线聊天</h3>
                <p className="text-gray-600 dark:text-gray-300">实时交流</p>
              </ThemeCardContent>
            </ThemeCard>
          </div>
        </div>
      </section>
    </div>
  )
}
