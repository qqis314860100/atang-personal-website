import { cn } from '@/utils/utils'

interface CategoryImageProps {
  categoryName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// 根据分类名称生成颜色
const getCategoryColor = (name: string) => {
  const colors = [
    'from-blue-400 to-blue-600',
    'from-green-400 to-green-600',
    'from-purple-400 to-purple-600',
    'from-pink-400 to-pink-600',
    'from-orange-400 to-orange-600',
    'from-indigo-400 to-indigo-600',
    'from-teal-400 to-teal-600',
    'from-red-400 to-red-600',
    'from-yellow-400 to-yellow-600',
    'from-cyan-400 to-cyan-600',
  ]

  // 根据字符串生成固定的颜色索引
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  return colors[Math.abs(hash) % colors.length]
}

// 根据分类名称生成图标
const getCategoryIcon = (name: string) => {
  const icons = {
    React: '⚛️',
    'Next.js': '▲',
    TypeScript: 'TS',
    JavaScript: 'JS',
    'Node.js': '🟢',
    Python: '🐍',
    Java: '☕',
    'C++': '⚙️',
    Go: '🐹',
    Rust: '🦀',
    Vue: '💚',
    Angular: '🅰️',
    Svelte: '💫',
    AI: '🤖',
    'Machine Learning': '🧠',
    'Deep Learning': '🔬',
    'Data Science': '📊',
    'Web Development': '🌐',
    Mobile: '📱',
    DevOps: '⚡',
    Database: '🗄️',
    Cloud: '☁️',
    Security: '🔒',
    Testing: '🧪',
    Design: '🎨',
    'UI/UX': '✨',
    Frontend: '🎯',
    Backend: '🔧',
    'Full Stack': '🚀',
    Architecture: '🏗️',
  }

  // 精确匹配
  if (icons[name as keyof typeof icons]) {
    return icons[name as keyof typeof icons]
  }

  // 模糊匹配
  for (const [key, icon] of Object.entries(icons)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }

  // 默认图标
  return '📝'
}

// 根据尺寸获取样式类
const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  switch (size) {
    case 'sm':
      return 'w-12 h-12 text-xs'
    case 'md':
      return 'w-16 h-16 text-sm'
    case 'lg':
      return 'w-32 h-32 text-3xl'
    default:
      return 'w-16 h-16 text-sm'
  }
}

export function CategoryImage({
  categoryName,
  className,
  size = 'md',
}: CategoryImageProps) {
  const colorClass = getCategoryColor(categoryName)
  const icon = getCategoryIcon(categoryName)
  const sizeClasses = getSizeClasses(size)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg bg-gradient-to-br text-white font-bold shadow-lg',
        sizeClasses,
        colorClass,
        className
      )}
    >
      {icon}
    </div>
  )
}
