'use client'

import { FullscreenCard } from '@/app/components/full-screen'
import { Pagination } from '@/app/components/pagination/pagination'
import { SearchFilterBar } from '@/app/components/search-filter-bar/search-filter-bar'
import { ThemeText, ThemeTextSM } from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import { useErrorLogs as useErrorLogsAPI } from '@/lib/query-hook/use-analytics'
import { getThemeClasses } from '@/lib/theme/colors'
import { AlertTriangle } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useEffect } from 'react'
import { ErrorLog } from './ErrorLogs.utils'
import { ErrorLogsList } from './ErrorLogsList'
import { useErrorLogs as useErrorLogsHook } from './useErrorLogs'

interface ErrorLogsProps {
  data: ErrorLog[] // 保留作为fallback数据
  onErrorClick: (errorId: string) => void
}

export function ErrorLogs({
  data: fallbackData,
  onErrorClick,
}: ErrorLogsProps) {
  const t = useI18n()
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  // 使用 useMemo 优化主题样式计算
  const themeStyles = React.useMemo(() => {
    const theme = currentTheme || 'light'
    return {
      cardSecondary: getThemeClasses('', theme, { card: 'secondary' }),
      textError: getThemeClasses('', theme, { text: 'error' }),
      borderPrimary: getThemeClasses('', theme, { border: 'primary' }),
      hoverSecondary: getThemeClasses('', theme, { hover: 'secondary' }),
    }
  }, [currentTheme])

  const {
    expandedError,
    currentPage,
    itemsPerPage,
    filters,
    advancedSearch,
    debouncedSearchTerm, // 使用防抖后的搜索词
    handleSearchChange,
    handleSeverityChange,
    handleSortChange,
    handleErrorExpand,
    handlePageChange,
    handleItemsPerPageChange,
    handleSearchFieldChange,
    handleAdvancedSearchToggle,
    handleUseRegexChange,
    handleCaseSensitiveChange,
    setCurrentPage,
  } = useErrorLogsHook()

  // 使用新的API来获取错误日志 - 使用防抖搜索词
  const {
    data: apiResponse,
    isLoading,
    error: apiError,
    refetch,
  } = useErrorLogsAPI({
    timeRange: '7d', // 可以后续添加到state中
    searchTerm: debouncedSearchTerm, // 使用防抖后的搜索词
    searchField: advancedSearch.searchField,
    severity: filters.selectedSeverity,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: currentPage,
    limit: itemsPerPage,
  })

  // 判断是否正在搜索（用户输入了但还未完成防抖）
  const isSearching = filters.searchTerm !== debouncedSearchTerm

  // 使用API数据，如果没有则使用fallback数据
  const data = apiResponse?.data || fallbackData || []
  const totalItems = apiResponse?.total || data.length
  const totalPages =
    apiResponse?.totalPages || Math.ceil(totalItems / itemsPerPage)

  // 当搜索参数变化时，重置到第一页
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [
    filters.selectedSeverity,
    filters.sortBy,
    filters.sortOrder,
    setCurrentPage,
  ])

  return (
    <FullscreenCard
      title={
        <>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${themeStyles.cardSecondary}`}
          >
            <AlertTriangle className={`w-5 h-5 ${themeStyles.textError}`} />
          </div>
          {t.dashboard('前端错误日志')}
          {isLoading && (
            <div
              className={`w-4 h-4 ml-2 border-2 rounded-full animate-spin ${themeStyles.borderPrimary}`}
            ></div>
          )}
        </>
      }
      className="h-[800px]"
      header={
        <div className="px-4">
          <SearchFilterBar
            searchTerm={filters.searchTerm}
            onSearchChange={handleSearchChange}
            filterOptions={[
              { value: 'all', label: t.dashboard('所有级别') },
              { value: 'high', label: t.dashboard('高') },
              { value: 'medium', label: t.dashboard('中') },
              { value: 'low', label: t.dashboard('低') },
            ]}
            selectedFilter={filters.selectedSeverity}
            onFilterChange={handleSeverityChange}
            sortOptions={[
              { key: 'timestamp', label: t.dashboard('时间') },
              { key: 'count', label: t.dashboard('次数') },
              { key: 'severity', label: t.dashboard('级别') },
            ]}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={handleSortChange}
            showAdvancedSearch={true}
            onAdvancedSearchToggle={handleAdvancedSearchToggle}
            searchField={advancedSearch.searchField}
            onSearchFieldChange={handleSearchFieldChange}
            useRegex={advancedSearch.useRegex}
            onUseRegexChange={handleUseRegexChange}
            caseSensitive={advancedSearch.caseSensitive}
            onCaseSensitiveChange={handleCaseSensitiveChange}
            isSearching={isSearching}
          />
        </div>
      }
    >
      <div className="flex-1 overflow-hidden p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className={`w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4 ${themeStyles.borderPrimary}`}
              />
              <ThemeTextSM weight="medium" variant="secondary">
                {t.dashboard('加载中...')}
              </ThemeTextSM>
            </div>
          </div>
        ) : apiError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ThemeText variant="error">
                {t.dashboard('加载错误日志失败')}
              </ThemeText>
              <button
                onClick={() => refetch()}
                className={`mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:scale-105 ${themeStyles.cardSecondary} ${themeStyles.textError} ${themeStyles.hoverSecondary}`}
              >
                {t.dashboard('重试')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <ErrorLogsList
              data={data}
              expandedError={expandedError}
              isLoading={isLoading}
              onErrorExpand={handleErrorExpand}
              onErrorClick={onErrorClick}
            />
            <div className="mt-4 flex items-center justify-between">
              <ThemeTextSM variant="muted">
                {t.dashboard(
                  '共 {count} 条记录，第 {page} 页，共 {totalPages} 页',
                  {
                    params: {
                      count: totalItems,
                      page: currentPage,
                      totalPages: totalPages,
                    },
                  }
                )}
              </ThemeTextSM>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                className="flex items-center gap-2"
              />
            </div>
          </>
        )}
      </div>
    </FullscreenCard>
  )
}
