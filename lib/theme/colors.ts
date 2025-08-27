// 主题颜色配置
export const themeColors = {
  // 卡片背景色 - 支持明暗模式
  card: {
    light: {
      primary: 'bg-white/90',
      secondary: 'bg-white/80',
      tertiary: 'bg-white/70',
      glass: 'bg-white/60 backdrop-blur-sm',
      glassHover: 'bg-white/80 backdrop-blur-sm',
    },
    dark: {
      primary: 'bg-gray-800/90',
      secondary: 'bg-gray-700/80',
      tertiary: 'bg-gray-600/70',
      glass: 'bg-gray-800/60 backdrop-blur-sm',
      glassHover: 'bg-gray-700/80 backdrop-blur-sm',
    },
  },

  // 边框颜色 - 支持明暗模式
  border: {
    light: {
      primary: 'border-gray-200/60',
      secondary: 'border-gray-300/50',
      accent: 'border-blue-200/60',
      success: 'border-green-200/60',
      warning: 'border-yellow-200/60',
      error: 'border-red-200/60',
    },
    dark: {
      primary: 'border-gray-600/60',
      secondary: 'border-gray-500/50',
      accent: 'border-blue-600/60',
      success: 'border-green-600/60',
      warning: 'border-yellow-600/60',
      error: 'border-red-600/60',
    },
  },

  // 文字颜色 - 支持明暗模式
  text: {
    light: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      tertiary: 'text-gray-500',
      muted: 'text-gray-400',
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
  },

  // 渐变背景 - 支持明暗模式
  gradient: {
    light: {
      primary: 'from-white/80 via-white/90 to-white/80',
      secondary: 'from-gray-50/80 via-white/90 to-gray-50/80',
      accent: 'from-blue-50/60 via-blue-50/80 to-blue-50/60',
      success: 'from-green-50/60 via-green-50/80 to-green-50/60',
      warning: 'from-yellow-50/60 via-yellow-50/80 to-yellow-50/60',
      error: 'from-red-50/60 via-red-50/80 to-red-50/60',
    },
    dark: {
      primary: 'from-gray-800/80 via-gray-800/90 to-gray-800/80',
      secondary: 'from-gray-700/80 via-gray-800/90 to-gray-700/80',
      accent: 'from-gray-700/60 via-gray-800/80 to-gray-700/60',
      success: 'from-gray-700/60 via-gray-800/80 to-gray-700/60',
      warning: 'from-gray-700/60 via-gray-800/80 to-gray-700/60',
      error: 'from-gray-700/60 via-gray-800/80 to-gray-700/60',
    },
  },

  // 阴影 - 支持明暗模式
  shadow: {
    light: {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      glass: 'shadow-lg',
    },
    dark: {
      sm: 'shadow-gray-900/20',
      md: 'shadow-gray-900/30',
      lg: 'shadow-gray-900/40',
      xl: 'shadow-gray-900/50',
      glass: 'shadow-gray-900/40',
    },
  },

  // 悬停状态 - 支持明暗模式
  hover: {
    light: {
      primary: 'hover:bg-white/95',
      secondary: 'hover:bg-gray-50/90',
      accent: 'hover:bg-blue-50/80',
      success: 'hover:bg-green-50/80',
      warning: 'hover:bg-yellow-50/80',
      error: 'hover:bg-red-50/80',
    },
    dark: {
      primary: 'hover:bg-gray-700/95',
      secondary: 'hover:bg-gray-600/90',
      accent: 'hover:bg-gray-700/80',
      success: 'hover:bg-gray-700/80',
      warning: 'hover:bg-gray-700/80',
      error: 'hover:bg-gray-700/80',
    },
  },
}

// 获取主题颜色的工具函数
export function getThemeColor(
  colorType: keyof typeof themeColors,
  colorKey: string,
  theme: 'light' | 'dark' = 'light'
) {
  const colorGroup = themeColors[colorType] as any
  if (!colorGroup || !colorGroup[theme]) {
    console.warn(`Theme color not found: ${colorType}.${theme}.${colorKey}`)
    return ''
  }
  const color = colorGroup[theme][colorKey]
  if (!color) {
    console.warn(`Color key not found: ${colorType}.${theme}.${colorKey}`)
    return ''
  }
  return color
}

// 获取完整的主题颜色类名
export function getThemeClasses(
  baseClasses: string,
  theme: 'light' | 'dark' = 'light',
  colorOverrides?: Partial<{
    card: keyof typeof themeColors.card.light
    border: keyof typeof themeColors.border.light
    text: keyof typeof themeColors.text.light
    gradient: keyof typeof themeColors.gradient.light
    shadow: keyof typeof themeColors.shadow.light
    hover: keyof typeof themeColors.hover.light
  }>
) {
  const classes = [baseClasses]

  if (colorOverrides?.card) {
    classes.push(getThemeColor('card', colorOverrides.card, theme))
  }
  if (colorOverrides?.border) {
    classes.push(getThemeColor('border', colorOverrides.border, theme))
  }
  if (colorOverrides?.text) {
    classes.push(getThemeColor('text', colorOverrides.text, theme))
  }
  if (colorOverrides?.gradient) {
    classes.push(
      `bg-gradient-to-br ${getThemeColor(
        'gradient',
        colorOverrides.gradient,
        theme
      )}`
    )
  }
  if (colorOverrides?.shadow) {
    classes.push(getThemeColor('shadow', colorOverrides.shadow, theme))
  }
  if (colorOverrides?.hover) {
    classes.push(getThemeColor('hover', colorOverrides.hover, theme))
  }

  return classes.join(' ')
}
