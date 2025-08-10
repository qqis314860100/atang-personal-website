'use client'

import { Card } from '@/components/ui/card'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const tabs = [
    { id: 'profile', label: '基本资料', href: `/user/profile` },
    { id: 'resume', label: '简历管理', href: `/user/resume` },
    { id: 'settings', label: '安全设置', href: `/user/settings` },
  ]

  const activeTab =
    tabs.find((tab) => pathname.includes(tab.id))?.id || 'profile'

  return (
    <div className="container py-4 px-4 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <Card className="p-2">
            <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>
          </Card>
        </div>
        <div className="md:w-3/4">
          <Suspense fallback={<div>加载中...</div>}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
