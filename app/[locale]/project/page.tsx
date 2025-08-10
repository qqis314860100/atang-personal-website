import ProjectList from '@/app/[locale]/project/components/project-list'
import { getThemeClasses } from '@/lib/theme/colors'

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
    <div
      className={getThemeClasses('min-h-screen', 'light', {
        card: 'secondary',
      })}
    >
      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProjectList />
      </div>
    </div>
  )
}
