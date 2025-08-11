'use client'

import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === '/login' || pathname.endsWith('/login')

  return (
    <main
      className={cn(
        'flex-1 overflow-y-auto bg-transparent',
        isLogin ? 'h-screen' : 'h-[calc(100vh-64px)]'
      )}
    >
      {children}
    </main>
  )
}
