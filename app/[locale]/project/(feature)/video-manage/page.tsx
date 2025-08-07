import { VideoManagerClient } from './components/VideoManagerClient'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useLocale } from 'next-intl'

export default function VideoManagerPage() {
  const locale = useLocale()
  const breadcrumbItems = [
    { label: '主页', href: `/${locale}` },
    { label: '项目', href: `/${locale}/project` },
    { label: '视频管理', current: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Breadcrumb items={breadcrumbItems} className="top-[0px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <VideoManagerClient />
      </div>
    </div>
  )
}
