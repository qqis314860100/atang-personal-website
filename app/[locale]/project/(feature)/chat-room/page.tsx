import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ChatRoomEnhanced } from './components/ChatRoomEnhanced'
import { useLocale } from 'next-intl'

export default function ChatRoomPage() {
  const locale = useLocale()

  const breadcrumbItems = [
    {
      label: '项目',
      href: `/${locale}/project`,
    },
    {
      label: '在线聊天室',
      current: true,
    },
  ]

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} className="top-[0px]" />
      <ChatRoomEnhanced />
    </div>
  )
}
