'use client'

import { ThemeCard } from '@/components/ui/theme-card'
import { getThemeClasses } from '@/lib/theme/colors'
import { cn } from '@/lib/utils'
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useCallback } from 'react'

export interface FilterOption {
  value: string
  label: string
}

export interface SortOption {
  key: string
  label: string
}

export interface SearchFilterBarProps {
  // 搜索相关
  searchTerm: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string

  // 过滤相关
  filterOptions?: FilterOption[]
  selectedFilter?: string
  onFilterChange?: (value: string) => void
  filterLabel?: string

  // 排序相关
  sortOptions?: SortOption[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (field: any) => void

  // 样式和布局
  className?: string
  showSearch?: boolean
  showFilter?: boolean
  showSort?: boolean

  // 高级功能
  showAdvancedSearch?: boolean
  onAdvancedSearchToggle?: () => void
  searchField?: any
  onSearchFieldChange?: (field: any) => void
  useRegex?: boolean
  onUseRegexChange?: (use: boolean) => void
  caseSensitive?: boolean
  onCaseSensitiveChange?: (caseSensitive: boolean) => void

  // 状态指示
  isSearching?: boolean
}

export function SearchFilterBar({
  // 搜索相关
  searchTerm,
  onSearchChange,
  searchPlaceholder = '搜索...',

  // 过滤相关
  filterOptions = [],
  selectedFilter = 'all',
  onFilterChange,
  filterLabel = '过滤',

  // 排序相关
  sortOptions = [],
  sortBy = '',
  sortOrder = 'desc',
  onSortChange,

  // 样式和布局
  className = '',
  showSearch = true,
  showFilter = true,
  showSort = true,

  // 高级功能
  showAdvancedSearch = false,
  onAdvancedSearchToggle,
  searchField = 'all',
  onSearchFieldChange,
  useRegex = false,
  onUseRegexChange,
  caseSensitive = false,
  onCaseSensitiveChange,
  isSearching = false, // 新增参数
}: SearchFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const handleSortChange = useCallback(
    (field: string) => {
      if (onSortChange) {
        onSortChange(field)
      }
    },
    [onSortChange]
  )

  const handleFilterChange = useCallback(
    (value: string) => {
      if (onFilterChange) {
        onFilterChange(value)
      }
    },
    [onFilterChange]
  )

  const toggleAdvancedSearch = useCallback(() => {
    setIsExpanded(!isExpanded)
    if (onAdvancedSearchToggle) {
      onAdvancedSearchToggle()
    }
  }, [isExpanded, onAdvancedSearchToggle])

  return (
    <ThemeCard
      variant="glass"
      className={`rounded-lg p-3 space-y-3 ${className}`}
    >
      {/* 主要搜索和过滤行 */}
      <div className="flex items-center gap-3">
        {/* 搜索输入框 */}
        {showSearch && (
          <div className="flex-1 relative">
            <Search
              className={cn(
                'absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4',
                getThemeClasses('', currentTheme || 'light', {
                  text: 'secondary',
                })
              )}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all',
                getThemeClasses('', currentTheme || 'light', {
                  card: 'secondary',
                  border: 'primary',
                  text: 'secondary',
                }),
                'focus:ring-blue-500/50 focus:border-blue-500/50'
              )}
            />
            {/* 搜索状态指示器 */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div
                  className={cn(
                    'w-3 h-3 border rounded-full animate-spin',
                    getThemeClasses('', currentTheme || 'light', {
                      border: 'accent',
                    }),
                    'border-t-transparent'
                  )}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* 过滤选择器 */}
        {showFilter && filterOptions.length > 0 && onFilterChange && (
          <select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className={cn(
              'px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2',
              getThemeClasses('', currentTheme || 'light', {
                card: 'secondary',
                border: 'primary',
                text: 'secondary',
              }),
              'focus:ring-blue-500/50'
            )}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* 高级搜索切换按钮 */}
        {showAdvancedSearch && onAdvancedSearchToggle && (
          <button
            onClick={toggleAdvancedSearch}
            className={cn(
              'p-2 rounded-md transition-colors hover:scale-105',
              getThemeClasses('', currentTheme || 'light', {
                card: 'secondary',
                border: 'primary',
                text: 'secondary',
                hover: 'primary',
              })
            )}
            title="高级搜索"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 高级搜索选项 */}
      {isExpanded && showAdvancedSearch && (
        <div
          className={cn(
            'border-t pt-3 space-y-3',
            getThemeClasses('', currentTheme || 'light', {
              border: 'primary',
            })
          )}
        >
          <div className="grid grid-cols-2 gap-4">
            {/* 搜索字段选择 */}
            {onSearchFieldChange && (
              <div className="space-y-2">
                <label
                  className={cn(
                    'text-xs',
                    getThemeClasses('', currentTheme || 'light', {
                      text: 'muted',
                    })
                  )}
                >
                  搜索字段
                </label>
                <select
                  value={searchField}
                  onChange={(e) => onSearchFieldChange(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2',
                    getThemeClasses('', currentTheme || 'light', {
                      card: 'secondary',
                      border: 'primary',
                      text: 'secondary',
                    }),
                    'focus:ring-blue-500/50'
                  )}
                >
                  <option value="all">所有字段</option>
                  <option value="type">类型</option>
                  <option value="message">消息</option>
                  <option value="page">页面</option>
                  <option value="userAgent">用户代理</option>
                </select>
              </div>
            )}

            {/* 正则表达式选项 */}
            {onUseRegexChange && (
              <div className="space-y-2">
                <label
                  className={cn(
                    'text-xs',
                    getThemeClasses('', currentTheme || 'light', {
                      text: 'muted',
                    })
                  )}
                >
                  搜索选项
                </label>
                <div className="space-y-2">
                  <label
                    className={cn(
                      'flex items-center gap-2 text-xs',
                      getThemeClasses('', currentTheme || 'light', {
                        text: 'secondary',
                      })
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={useRegex}
                      onChange={(e) => onUseRegexChange(e.target.checked)}
                      className={cn(
                        'w-4 h-4 rounded focus:ring-2',
                        getThemeClasses('', currentTheme || 'light', {
                          card: 'secondary',
                          border: 'primary',
                        }),
                        'focus:ring-blue-500/50'
                      )}
                    />
                    使用正则表达式
                  </label>
                  <label
                    className={cn(
                      'flex items-center gap-2 text-xs',
                      getThemeClasses('', currentTheme || 'light', {
                        text: 'secondary',
                      })
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) =>
                        onCaseSensitiveChange?.(e.target.checked)
                      }
                      className={cn(
                        'w-4 h-4 rounded focus:ring-2',
                        getThemeClasses('', currentTheme || 'light', {
                          card: 'secondary',
                          border: 'primary',
                        }),
                        'focus:ring-blue-500/50'
                      )}
                    />
                    区分大小写
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 排序选项 */}
      {showSort && sortOptions.length > 0 && onSortChange && (
        <div
          className={cn(
            'flex items-center gap-4 text-xs',
            getThemeClasses('', currentTheme || 'light', {
              text: 'muted',
            })
          )}
        >
          <span>排序:</span>
          <div className="flex items-center gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className={cn(
                  'px-2 py-1 rounded transition-colors hover:scale-105',
                  sortBy === option.key
                    ? getThemeClasses('', currentTheme || 'light', {
                        card: 'primary',
                        text: 'accent',
                      })
                    : getThemeClasses('', currentTheme || 'light', {
                        text: 'secondary',
                        hover: 'primary',
                      })
                )}
              >
                {option.label}
                {sortBy === option.key && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? (
                      <SortAsc className="w-3 h-3 inline" />
                    ) : (
                      <SortDesc className="w-3 h-3 inline" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </ThemeCard>
  )
}
