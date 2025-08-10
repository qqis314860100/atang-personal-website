'use client'

import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface ThemeTextProps {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  variant?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'muted'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error'
  className?: string
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
}

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const themeColors = {
  light: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    tertiary: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  },
  dark: {
    primary: 'text-white',
    secondary: 'text-gray-200',
    tertiary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-blue-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  },
}

export function ThemeText({
  children,
  size = 'base',
  weight = 'normal',
  variant = 'primary',
  className,
}: ThemeTextProps) {
  const { theme: currentTheme } = useTheme()
  const theme = (currentTheme as 'light' | 'dark') || 'light'

  const classes = cn(
    sizeClasses[size],
    weightClasses[weight],
    themeColors[theme][variant],
    className
  )

  return <span className={classes}>{children}</span>
}

// 便捷组件
export function ThemeTextXS({
  children,
  weight,
  variant,
  className,
}: Omit<ThemeTextProps, 'size'>) {
  return (
    <ThemeText
      size="xs"
      weight={weight}
      variant={variant}
      className={className}
    >
      {children}
    </ThemeText>
  )
}

export function ThemeTextSM({
  children,
  weight,
  variant,
  className,
}: Omit<ThemeTextProps, 'size'>) {
  return (
    <ThemeText
      size="sm"
      weight={weight}
      variant={variant}
      className={className}
    >
      {children}
    </ThemeText>
  )
}

export function ThemeTextLG({
  children,
  weight,
  variant,
  className,
}: Omit<ThemeTextProps, 'size'>) {
  return (
    <ThemeText
      size="lg"
      weight={weight}
      variant={variant}
      className={className}
    >
      {children}
    </ThemeText>
  )
}

export function ThemeTextXL({
  children,
  weight,
  variant,
  className,
}: Omit<ThemeTextProps, 'size'>) {
  return (
    <ThemeText
      size="xl"
      weight={weight}
      variant={variant}
      className={className}
    >
      {children}
    </ThemeText>
  )
}

export function ThemeText2XL({
  children,
  weight,
  variant,
  className,
}: Omit<ThemeTextProps, 'size'>) {
  return (
    <ThemeText
      size="2xl"
      weight={weight}
      variant={variant}
      className={className}
    >
      {children}
    </ThemeText>
  )
}

export function ThemeText3XL({
  children,
  weight,
  variant,
  className,
}: Omit<ThemeTextProps, 'size'>) {
  return (
    <ThemeText
      size="3xl"
      weight={weight}
      variant={variant}
      className={className}
    >
      {children}
    </ThemeText>
  )
}
