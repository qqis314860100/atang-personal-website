import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Project {
  id: string
  title: string
  description: string
  category: string
  technologies: string[]
  image: string
  demoUrl?: string
  githubUrl?: string
  status: 'completed' | 'in-progress' | 'planned'
  featured: boolean
}

// 直接复制项目数据，保持与 project-list.tsx 一致
const projects: Project[] = [
  {
    id: '1',
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
    status: 'completed',
    featured: true,
  },
  {
    id: '2',
    title: '在线聊天室',
    description:
      '基于 WebSocket 的实时聊天应用，支持访客匿名聊天、在线人数统计、消息历史记录等功能。',
    category: '实时通信',
    technologies: ['WebSocket', 'React', 'Node.js', 'Socket.IO'],
    image: '/api/placeholder/400/300',
    status: 'completed',
    featured: true,
  },
  {
    id: '3',
    title: '在线视频播放器',
    description:
      '支持弹幕功能的在线视频播放器，具备视频控制、弹幕发送、用户互动等特性。',
    category: '多媒体',
    technologies: ['HTML5 Video', 'WebRTC', 'Canvas', 'WebSocket'],
    image: '/api/placeholder/400/300',
    status: 'in-progress',
    featured: false,
  },
  {
    id: '4',
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
    status: 'planned',
    featured: false,
  },
  {
    id: '5',
    title: '数据可视化仪表板',
    description:
      '基于埋点数据的实时仪表板，展示用户行为分析、性能监控、业务指标等可视化图表。',
    category: '数据分析',
    technologies: ['D3.js', 'Chart.js', 'React', 'TypeScript', 'Prisma'],
    image: '/api/placeholder/400/300',
    status: 'in-progress',
    featured: false,
  },
  {
    id: '6',
    title: '移动端 PWA 应用',
    description:
      '渐进式 Web 应用，支持离线使用、推送通知、原生应用体验等功能。',
    category: '移动开发',
    technologies: ['PWA', 'Service Worker', 'React', 'TypeScript', 'Workbox'],
    image: '/api/placeholder/400/300',
    status: 'planned',
    featured: false,
  },
]

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = projects.find((p) => p.id === id)
  if (!project) return notFound()
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline">{project.category}</Badge>
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-gray-700">{project.description}</div>
          <div className="flex gap-2 mt-4">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                预览
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                源码
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
