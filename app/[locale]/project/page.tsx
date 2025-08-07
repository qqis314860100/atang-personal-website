import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProjectList from '@/app/[locale]/project/components/project-list'
import ChatRoomTrigger from '@/app/[locale]/project/components/chat-trigger'
import OnlineVisitorsFixed from '@/app/[locale]/project/components/visitors-tips'

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ locale: string }>
// }): Promise<Metadata> {
//   const { locale } = await params
//   const t = await getTranslations({ locale, namespace: 'Project' })

//   return {
//     title: t('title'),
//     description: t('description'),
//   }
// }

export default function ProjectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 页面头部 */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">项目展示</h1>
              <p className="text-sm text-gray-600">探索我的各种项目作品</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectList />
      </div>
      <OnlineVisitorsFixed />
      <ChatRoomTrigger />
    </div>
  )
}
