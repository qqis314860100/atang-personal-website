'use client'

import { useState } from 'react'
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
    githubUrl:
      'https://github.com/qqis314860100/atang-personal-website/blob/main/app/[locale]/home/page.tsx',
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
    githubUrl:
      'https://github.com/qqis314860100/atang-personal-website/blob/main/app/[locale]/project/chat-room/page.tsx',
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
    githubUrl:
      'https://github.com/qqis314860100/atang-personal-website/blob/main/app/[locale]/project/video-manage/page.tsx',
  },
]

// 技术栈数据
const techStack = [
  { name: 'React/Next.js', level: '掌握', color: 'bg-blue-500' },
  { name: 'TypeScript', level: '掌握', color: 'bg-blue-600' },
  { name: 'Node.js', level: '掌握', color: 'bg-green-500' },
  { name: 'Vue.js', level: '掌握', color: 'bg-green-600' },
  { name: 'PostgreSQL', level: '掌握', color: 'bg-purple-500' },
  { name: 'Supabase', level: '掌握', color: 'bg-purple-600' },
]

// 工作经历数据
const workExperience = [
  {
    company: '杭州极氪智能科技杭州分公司',
    position: '前端开发',
    period: '2021.8 - 2025.4',
    type: '全职',
    description: '负责智能汽车相关前端应用开发'
  },
  {
    company: '北京科蓝软件有限公司',
    position: '前端开发工程师',
    period: '2021.1 - 2021.8',
    type: '全职',
    description: '负责金融软件前端开发'
  },
  {
    company: '福州顶点信息管理有限公司',
    position: '前端开发工程师',
    period: '2018.10 - 2020.7',
    type: '全职',
    description: '负责企业管理系统前端开发'
  }
]

// 教育背景数据
const education = {
  school: '闽江学院',
  major: '软件工程专业',
  degree: '本科',
  period: '2014 - 2018'
}

export default function HomePage() {
  const t = useI18n()
  const router = useRouter()

  // 获取热门博客文章
  const { data: popularPosts } = usePopularPosts(3)

  // 微信二维码弹窗状态
  const [showWechatQR, setShowWechatQR] = useState(false)

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
                  <span>6年经验</span>
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

      {/* 技术栈展示 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              技术栈
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              我掌握的主要技术栈
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {techStack.map((tech) => (
              <ThemeCard key={tech.name} variant="glass">
                <ThemeCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tech.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {tech.level}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${tech.color} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: '85%' }}
                    />
                  </div>
                </ThemeCardContent>
              </ThemeCard>
            ))}
          </div>
        </div>
      </section>

      {/* 工作经历 */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              工作经历
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              我的职业发展历程
            </p>
          </div>

          <div className="space-y-8">
            {workExperience.map((work, index) => (
              <ThemeCard key={index} variant="glass">
                <ThemeCardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {work.company}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {work.position} · {work.type}
                      </p>
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 mt-2 md:mt-0">
                      {work.period}
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {work.description}
                  </p>
                </ThemeCardContent>
              </ThemeCard>
            ))}
          </div>
        </div>
      </section>

      {/* 教育背景 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              教育背景
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              我的学习经历
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ThemeCard variant="glass">
              <ThemeCardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  {education.school}
                </h3>
                <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {education.major} · {education.degree}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  {education.period}
                </p>
              </ThemeCardContent>
            </ThemeCard>
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

            <ThemeCard variant="glass" hover={true}>
              <ThemeCardContent className="text-center p-6">
                <a 
                  href="https://github.com/qqis314860100" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:scale-105 transition-transform"
                >
                  <Github className="h-8 w-8 text-gray-900 dark:text-white mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">GitHub</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    github.com/qqis314860100
                  </p>
                </a>
              </ThemeCardContent>
            </ThemeCard>

            <ThemeCard variant="glass" hover={true}>
              <ThemeCardContent className="text-center p-6">
                <button 
                  onClick={() => setShowWechatQR(true)}
                  className="w-full hover:scale-105 transition-transform"
                >
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">微信联系</h3>
                  <p className="text-gray-600 dark:text-gray-300">扫码添加好友</p>
                </button>
              </ThemeCardContent>
            </ThemeCard>
          </div>
        </div>
      </section>

      {/* 微信二维码弹窗 */}
      {showWechatQR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWechatQR(false)}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">微信二维码</h3>
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSJ3aGl0ZSIvPgo8IS0tIFFSIENvZGUgcGF0dGVybiAtLT4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIyMjQiIGhlaWdodD0iMjI0Ij4KICA8IS0tIFBvc2l0aW9uIGRldGVjdGlvbiBwYXR0ZXJucyAtLT4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iOCIgeT0iOCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSJibGFjayIvPgogIAogIDxyZWN0IHg9IjE2OCIgeT0iMCIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjE3NiIgeT0iOCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPgogIDxyZWN0IHg9IjE4NCIgeT0iMTYiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSIwIiB5PSIxNjgiIHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI4IiB5PSIxNzYiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgZmlsbD0id2hpdGUiLz4KICA8cmVjdCB4PSIxNiIgeT0iMTg0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9ImJsYWNrIi8+CiAgCiAgPCEtLSBUaW1pbmcgcGF0dGVybnMgLS0+CiAgPHJlY3QgeD0iNjQiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iODAiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iOTYiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iMTEyIiB5PSIwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjEyOCIgeT0iMCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSIxNDQiIHk9IjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgCiAgPCEtLSBEYXRhIHBhdHRlcm4gKHNpbXBsaWZpZWQpIC0tPgogIDxyZWN0IHg9IjY0IiB5PSI2NCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI4MCIgeT0iNjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iOTYiIHk9IjY0IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjExMiIgeT0iNjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iMTI4IiB5PSI2NCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSIxNDQiIHk9IjY0IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjE2MCIgeT0iNjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iMTc2IiB5PSI2NCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSIxOTIiIHk9IjY0IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjIwOCIgeT0iNjQiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgCiAgPCEtLSBNb3JlIGRhdGEgcGF0dGVybnMgLS0+CiAgPHJlY3QgeD0iNjQiIHk9IjgwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjY0IiB5PSI5NiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI2NCIgeT0iMTEyIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjY0IiB5PSIxMjgiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iNjQiIHk9IjE0NCIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI2NCIgeT0iMTYwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgogIDxyZWN0IHg9IjY0IiB5PSIxNzYiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9ImJsYWNrIi8+CiAgPHJlY3QgeD0iNjQiIHk9IjE5MiIgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0iYmxhY2siLz4KICA8cmVjdCB4PSI2NCIgeT0iMjA4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSJibGFjayIvPgo8L3N2Zz4KPC9zdmc+" 
                  alt="微信二维码" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">扫一扫上面的二维码图案，加我为朋友。</p>
              <Button 
                onClick={() => setShowWechatQR(false)}
                variant="outline"
                className="w-full"
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
