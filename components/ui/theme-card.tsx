'use client'

import { getThemeClasses } from '@/lib/theme/colors'
import { cn } from '@/lib/utils'
import { HTMLMotionProps, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import * as React from 'react'

// 主题卡片的基础接口
interface ThemeCardProps extends Omit<React.ComponentProps<'div'>, 'onDrag'> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered'
  hover?: boolean
  animated?: boolean
  delay?: number
  duration?: number
}

// 主题卡片组件
const ThemeCard = React.forwardRef<HTMLDivElement, ThemeCardProps>(
  (
    {
      className,
      variant = 'default',
      hover = true,
      animated = false,
      delay = 0,
      duration = 0.3,
      children,
      ...props
    },
    ref
  ) => {
    const { theme, resolvedTheme } = useTheme()
    const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

    // 使用 useMemo 优化性能，避免不必要的重新计算
    const themeConfig = React.useMemo(() => {
      switch (variant) {
        case 'glass':
          return {
            card: 'glass' as const,
            border: 'primary' as const,
            shadow: 'glass' as const,
          }
        case 'elevated':
          return {
            card: 'primary' as const,
            border: 'primary' as const,
            shadow: 'lg' as const,
          }
        case 'bordered':
          return {
            card: 'secondary' as const,
            border: 'primary' as const,
            shadow: 'sm' as const,
          }
        default:
          return {
            card: 'primary' as const,
            border: 'primary' as const,
            shadow: 'md' as const,
          }
      }
    }, [variant])

    // 使用 useMemo 优化样式计算
    const cardClasses = React.useMemo(() => {
      const baseClasses = 'rounded-xl border transition-all duration-300'

      const themeClasses = getThemeClasses(baseClasses, currentTheme, {
        ...themeConfig,
        ...(hover && { hover: 'primary' }),
      })

      // 调试：在开发环境下输出生成的样式类
      if (process.env.NODE_ENV === 'development') {
        console.log('ThemeCard generated classes:', {
          variant,
          hover,
          themeConfig,
          themeClasses,
          currentTheme,
          // 检查是否包含 hover 样式
          hasHoverClass: themeClasses.includes('hover:'),
        })
      }

      // 简化 hover 样式处理
      let finalClasses = themeClasses
      if (hover) {
        // 直接添加 hover 样式，确保优先级
        const hoverClass =
          currentTheme === 'dark' ? 'hover:bg-gray-700/95' : 'hover:bg-white/95'
        finalClasses = `${themeClasses} ${hoverClass}`
      }

      // 确保样式优先级正确，将主题样式放在最后
      return cn(
        className,
        finalClasses,
        // 添加强制 hover 样式，确保优先级
        hover && 'hover:bg-opacity-95'
      )
    }, [currentTheme, themeConfig, hover, className])

    // 如果启用动画，使用 motion.div
    if (animated) {
      const motionProps: HTMLMotionProps<'div'> = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1],
        },
        whileHover: hover
          ? {
              y: -2,
              transition: { duration: 0.2 },
            }
          : undefined,
        className: cardClasses,
      }

      return (
        <motion.div ref={ref} {...motionProps}>
          {children}
        </motion.div>
      )
    }

    // 否则使用普通的 div
    return (
      <div ref={ref} data-slot="theme-card" className={cardClasses} {...props}>
        {children}
      </div>
    )
  }
)

ThemeCard.displayName = 'ThemeCard'

// 主题卡片头部
const ThemeCardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const themeClasses = getThemeClasses(
    'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 py-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
    currentTheme,
    {
      border: 'primary',
    }
  )

  return (
    <div
      ref={ref}
      data-slot="theme-card-header"
      className={cn(themeClasses, className)}
      {...props}
    />
  )
})

ThemeCardHeader.displayName = 'ThemeCardHeader'

// 主题卡片标题
const ThemeCardTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const themeClasses = getThemeClasses(
    'leading-none font-semibold text-lg',
    currentTheme,
    {
      text: 'primary',
    }
  )

  return (
    <div
      ref={ref}
      data-slot="theme-card-title"
      className={cn(themeClasses, className)}
      {...props}
    />
  )
})

ThemeCardTitle.displayName = 'ThemeCardTitle'

// 主题卡片描述
const ThemeCardDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const themeClasses = getThemeClasses(
    'text-sm opacity-80 mt-1',
    currentTheme,
    {
      text: 'secondary',
    }
  )

  return (
    <div
      ref={ref}
      data-slot="theme-card-description"
      className={cn(themeClasses, className)}
      {...props}
    />
  )
})

ThemeCardDescription.displayName = 'ThemeCardDescription'

// 主题卡片内容
const ThemeCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="theme-card-content"
      className={cn('px-6 pb-6', className)}
      {...props}
    />
  )
})

ThemeCardContent.displayName = 'ThemeCardContent'

// 主题卡片底部
const ThemeCardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const themeClasses = getThemeClasses(
    'flex items-center px-6 py-6 [.border-t]:pt-6',
    currentTheme,
    {
      border: 'primary',
    }
  )

  return (
    <div
      ref={ref}
      data-slot="theme-card-footer"
      className={cn(themeClasses, className)}
      {...props}
    />
  )
})

ThemeCardFooter.displayName = 'ThemeCardFooter'

// 主题卡片操作区域
const ThemeCardAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="theme-card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className
      )}
      {...props}
    />
  )
})

ThemeCardAction.displayName = 'ThemeCardAction'

export {
  ThemeCard,
  ThemeCardAction,
  ThemeCardContent,
  ThemeCardDescription,
  ThemeCardFooter,
  ThemeCardHeader,
  ThemeCardTitle,
}
