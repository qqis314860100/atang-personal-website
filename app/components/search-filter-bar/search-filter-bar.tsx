'use client'

import { Search, Filter, SortAsc, SortDesc } from 'lucide-react'
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
    <div className={`bg-gray-800/50 rounded-lg p-3 space-y-3 ${className}`}>
      {/* 主要搜索和过滤行 */}
      <div className="flex items-center gap-3">
        {/* 搜索输入框 */}
        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            {/* 搜索状态指示器 */}
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}

        {/* 过滤选择器 */}
        {showFilter && filterOptions.length > 0 && onFilterChange && (
          <select
            value={selectedFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
            className="p-2 bg-gray-700/50 border border-gray-600 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-600/50 transition-colors"
            title="高级搜索"
          >
            <Filter className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 高级搜索选项 */}
      {isExpanded && showAdvancedSearch && (
        <div className="border-t border-gray-700/50 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            {/* 搜索字段选择 */}
            {onSearchFieldChange && (
              <div className="space-y-2">
                <label className="text-xs text-gray-400">搜索字段</label>
                <select
                  value={searchField}
                  onChange={(e) => onSearchFieldChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                <label className="text-xs text-gray-400">搜索选项</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={useRegex}
                      onChange={(e) => onUseRegexChange(e.target.checked)}
                      className="w-4 h-4 bg-gray-700/50 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500/50"
                    />
                    使用正则表达式
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) =>
                        onCaseSensitiveChange?.(e.target.checked)
                      }
                      className="w-4 h-4 bg-gray-700/50 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500/50"
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
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>排序:</span>
          <div className="flex items-center gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSortChange(option.key)}
                className={`px-2 py-1 rounded transition-colors ${
                  sortBy === option.key
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
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
    </div>
  )
}
