import { cn } from '@/lib/utils'

interface TSubtractNavContainer extends React.PropsWithChildren {
  className?: string
}

export const SubtractNavContainer = ({
  children,
  className,
}: TSubtractNavContainer) => {
  return (
    <div className={cn('min-h-[calc(100vh-64px)]', className)}>{children}</div>
  )
}

export const SubtractNavBreadcrumbContainer = ({
  children,
  className,
}: TSubtractNavContainer) => {
  return (
    <div className={cn('h-[calc(100vh-114px)]', className)}>{children}</div>
  )
}
