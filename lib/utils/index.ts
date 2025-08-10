import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: Date | string | number | null | undefined) => {
  // 处理空值
  if (!date) return '未知时间'

  // 处理空字符串
  if (date === '') return '无效日期'

  // 处理只有空格的字符串
  if (typeof date === 'string' && date.trim() === '') return '无效日期'

  // 确保date是Date对象
  let dateObj: Date
  try {
    if (date instanceof Date) {
      dateObj = date
    } else if (typeof date === 'number') {
      dateObj = new Date(date)
    } else if (typeof date === 'string') {
      // 处理时间戳字符串
      if (/^\d+$/.test(date)) {
        dateObj = new Date(parseInt(date))
      } else {
        dateObj = new Date(date)
      }
    } else {
      return '无效日期'
    }

    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '无效日期'
    }
  } catch (error) {
    console.warn('日期格式化失败:', date, error)
    return '无效日期'
  }

  const now = new Date()
  const diffTime = Math.abs(now.getTime() - dateObj.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return '1天前'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)}周前`
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)}个月前`
  return `${Math.ceil(diffDays / 365)}年前`
}

// 格式化时间
export const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 格式化数字
export const formatNumber = (num: number) => {
  if (!num || num <= 0) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}
