import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  // 根据主题选择骨架屏颜色
  const skeletonColor = currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'

  return (
    <div
      className={cn('animate-pulse rounded-md', skeletonColor, className)}
      {...props}
    />
  )
}

export { Skeleton }
