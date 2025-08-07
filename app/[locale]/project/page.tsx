import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ProjectList from '@/app/[locale]/project/components/project-list'
import ChatRoomTrigger from '@/app/[locale]/project/components/ai-agent.trigger'
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
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectList />
      </div>
      <OnlineVisitorsFixed />
      <ChatRoomTrigger />
    </div>
  )
}
