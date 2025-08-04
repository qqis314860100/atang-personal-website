'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/utils'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  hover?: boolean
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    { children, className, delay = 0, duration = 0.3, hover = true, ...props },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={
          hover
            ? {
                y: -4,
                transition: { duration: 0.2 },
              }
            : undefined
        }
        className={cn(
          'transition-all duration-200 ease-in-out',
          hover && 'hover:shadow-lg hover:shadow-black/5',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'

// 带动画效果的按钮组件
interface AnimatedButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  title?: string
}

export const AnimatedButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedButtonProps
>(
  (
    {
      children,
      className,
      onClick,
      disabled,
      variant = 'default',
      size = 'md',
      title,
      ...props
    },
    ref
  ) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-sm': size === 'md',
        'px-6 py-3 text-base': size === 'lg',
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500':
          variant === 'default',
        'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500':
          variant === 'outline',
        'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500':
          variant === 'ghost',
        'opacity-50 cursor-not-allowed': disabled,
      },
      className
    )

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        onClick={onClick}
        disabled={disabled}
        title={title}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'
