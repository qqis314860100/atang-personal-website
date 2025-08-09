'use client'

import { SearchFilterBar } from '@/app/components/search-filter-bar/search-filter-bar'
import { useEffect } from 'react'
import { ErrorLogsList } from './ErrorLogsList'
import { Pagination } from '@/app/components/pagination/pagination'
import { useErrorLogs as useErrorLogsHook } from './useErrorLogs'
import { useErrorLogs as useErrorLogsAPI } from '@/lib/query-hook/use-analytics'
import {
  ErrorLog,
  calculateHeatmapData,
  PAGINATION_CONFIG,
} from './ErrorLogs.utils'
import { FullscreenCard } from '@/app/components/full-screen'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useI18n } from '@/app/hooks/use-i18n'

interface ErrorLogsProps {
  data: ErrorLog[] // 保留作为fallback数据
  onErrorClick: (errorId: string) => void
}

export function ErrorLogs({
  data: fallbackData,
  onErrorClick,
}: ErrorLogsProps) {
  const t = useI18n()
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
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          {t.dashboard('前端错误日志')}
          {isLoading && (
            <div className="w-4 h-4 ml-2 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </>
      }
      className="h-[800px]"
      header={
        <div className="p-4">
          <SearchFilterBar
            searchTerm={filters.searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t.dashboard('搜索错误类型、消息或页面...')}
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
      footer={
        totalItems > 0 ? (
          <div className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
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
              </div>
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                pageSizeOptions={[...PAGINATION_CONFIG.PAGE_SIZE_OPTIONS]}
                showPageInfo={false}
              />
            </div>
          </div>
        ) : undefined
      }
    >
      {/* 可滚动的内容区域 */}
      <div className="relative">
        {/* 全局加载遮罩层 - 在容器级别 */}
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-900/70 backdrop-blur-sm z-30 rounded-lg">
            <div className="flex items-center gap-3 text-blue-400 bg-gray-800/90 px-6 py-3 rounded-lg shadow-lg border border-gray-700/50">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">
                {t.dashboard('加载中...')}
              </span>
            </div>
          </div>
        )}

        {apiError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
              <p className="text-red-400">{t.dashboard('加载错误日志失败')}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors"
              >
                {t.dashboard('重试')}
              </button>
            </div>
          </div>
        ) : (
          <ErrorLogsList
            data={data}
            expandedError={expandedError}
            isLoading={false}
            onErrorExpand={handleErrorExpand}
            onErrorClick={onErrorClick}
          />
        )}
      </div>
    </FullscreenCard>
  )
}
