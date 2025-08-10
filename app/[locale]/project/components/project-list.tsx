'use client'

import { Badge } from '@/components/ui/badge'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardDescription,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { getThemeClasses } from '@/lib/theme/colors'
import { useLocale } from 'next-intl'

interface Project {
  id: string
  title: string
  description: string
  category: string
  technologies: string[]
  image: string
  demoUrl?: string
  githubUrl?: string
  status: '已完成' | '计划中'
  featured: boolean
}

const projects: Project[] = [
  {
    id: 'blog',
    title: '个人博客系统',
    description:
      '基于 Next.js 14 和 Prisma 构建的现代化博客系统，支持 Markdown 编辑、分类管理、搜索功能等。',
    category: 'Web 开发',
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Prisma',
      'Supabase',
      'Tailwind CSS',
    ],
    image: '/api/placeholder/400/300',
    status: '已完成',
    featured: true,
  },
  {
    id: 'chat-room',
    title: '在线聊天室',
    description:
      '基于 WebSocket 的实时聊天应用，支持访客匿名聊天、在线人数统计、消息历史记录等功能。',
    category: '实时通信',
    technologies: ['WebSocket', 'React', 'Node.js', 'Socket.IO', 'TypeScript'],
    image: '/api/placeholder/400/300',
    status: '已完成',
    featured: true,
  },
  {
    id: 'video-manage',
    title: '视频管理系统',
    description:
      '完整的视频管理平台，支持视频上传、编辑、分类管理、弹幕统计等功能。',
    category: '内容管理',
    technologies: [
      'Next.js',
      'React Query',
      'Prisma',
      'TypeScript',
      'Tailwind CSS',
    ],
    image: '/api/placeholder/400/300',
    status: '已完成',
    featured: true,
  },
  {
    id: 'collaborative-editor',
    title: '多人协作编辑器',
    description:
      '基于 Operational Transformation 的实时协作编辑器，支持多人同时编辑、冲突解决、版本控制。',
    category: '协作工具',
    technologies: [
      'Operational Transformation',
      'WebSocket',
      'React',
      'TypeScript',
    ],
    image: '/api/placeholder/400/300',
    status: '计划中',
    featured: false,
  },
  {
    id: 'dashboard',
    title: '数据可视化仪表板',
    description:
      '基于埋点数据的实时仪表板，展示用户行为分析、性能监控、业务指标等可视化图表。',
    category: '数据分析',
    technologies: ['D3.js', 'Chart.js', 'React', 'TypeScript', 'Prisma'],
    image: '/api/placeholder/400/300',
    status: '计划中',
    featured: false,
  },
  {
    id: 'pwa',
    title: '移动端 PWA 应用',
    description:
      '渐进式 Web 应用，支持离线使用、推送通知、原生应用体验等功能。',
    category: '移动开发',
    technologies: ['PWA', 'Service Worker', 'React', 'TypeScript', 'Workbox'],
    image: '/api/placeholder/400/300',
    status: '计划中',
    featured: false,
  },
]

export default function ProjectList() {
  const locale = useLocale()
  const handleProjectClick = (project: Project) => {
    window.open(`/${locale}/project/${project.id}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* 项目卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <ThemeCard
            key={project.id}
            variant="elevated"
            hover={true}
            animated={true}
            delay={index * 0.1}
            className="cursor-pointer overflow-hidden"
            onClick={() => handleProjectClick(project)}
          >
            {/* 图片预留框 */}
            <div className="relative aspect-video overflow-hidden">
              <div
                className={getThemeClasses(
                  'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50',
                  'light',
                  { card: 'secondary' }
                )}
              >
                <div className="text-4xl opacity-60">📸</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-500">项目截图</span>
                </div>
              </div>

              {/* 精选标签 */}
              {project.featured && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                  精选
                </Badge>
              )}

              {/* 状态标签 */}
              <Badge
                className={`absolute top-2 left-2 ${
                  project.status === '已完成'
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white'
                }`}
              >
                {project.status}
              </Badge>
            </div>

            <ThemeCardHeader>
              <ThemeCardTitle className="flex items-center gap-2">
                {project.title}
                {project.title === '个人博客系统' && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    博客
                  </Badge>
                )}
                {project.title === '在线聊天室' && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    聊天
                  </Badge>
                )}
              </ThemeCardTitle>
              <ThemeCardDescription className="line-clamp-2">
                {project.description}
              </ThemeCardDescription>
            </ThemeCardHeader>

            <ThemeCardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {project.category}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.technologies.length - 4}
                  </Badge>
                )}
              </div>
            </ThemeCardContent>
          </ThemeCard>
        ))}
      </div>
    </div>
  )
}
