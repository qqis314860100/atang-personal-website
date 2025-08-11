'use client'

import { cn } from '@/lib/utils'
import {
  BookOpen,
  Code,
  Database,
  Globe,
  Layers,
  Palette,
  Rocket,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  Zap,
} from 'lucide-react'

interface CategoryImageProps {
  categoryName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// 分类图标映射
const categoryIcons: Record<string, React.ComponentType<any>> = {
  React: Code,
  Next: Rocket,
  前端: Palette,
  后端: Database,
  AI编程: Zap,
  移动端: Smartphone,
  运维: Settings,
  安全: Shield,
  设计: Palette,
  工具: Terminal,
  教程: BookOpen,
  技术: Layers,
  默认: Globe,
}

// 分类颜色映射
const categoryColors: Record<string, string> = {
  React: 'from-blue-500 to-cyan-500',
  Next: 'from-purple-500 to-pink-500',
  前端: 'from-green-500 to-emerald-500',
  后端: 'from-orange-500 to-red-500',
  AI编程: 'from-indigo-500 to-purple-500',
  移动端: 'from-pink-500 to-rose-500',
  运维: 'from-gray-500 to-slate-500',
  安全: 'from-red-500 to-orange-500',
  设计: 'from-purple-500 to-violet-500',
  工具: 'from-blue-500 to-indigo-500',
  教程: 'from-green-500 to-teal-500',
  技术: 'from-cyan-500 to-blue-500',
  默认: 'from-gray-400 to-gray-600',
}

export function CategoryImage({
  categoryName,
  size = 'md',
  className,
}: CategoryImageProps) {
  // 获取对应的图标和颜色
  const IconComponent = categoryIcons[categoryName] || categoryIcons['默认']
  const colorClass = categoryColors[categoryName] || categoryColors['默认']

  // 根据 size 设置不同的尺寸
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-lg',
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      <IconComponent className="w-1/2 h-1/2" />
    </div>
  )
}
