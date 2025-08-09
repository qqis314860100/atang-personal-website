'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface FiltersState {
  searchTerm: string
  selectedSeverity: string
  sortBy: 'timestamp' | 'count' | 'severity'
  sortOrder: 'asc' | 'desc'
}

export interface AdvancedSearchState {
  showAdvancedSearch: boolean
  searchField: 'all' | 'type' | 'message' | 'page' | 'userAgent'
  useRegex: boolean
  caseSensitive: boolean
}

export function useErrorLogs() {
  // 状态管理
  const [expandedError, setExpandedError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)

  // 搜索和过滤状态
  const [filters, setFilters] = useState<FiltersState>({
    searchTerm: '',
    selectedSeverity: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  })

  // 防抖搜索状态
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 高级搜索状态
  const [advancedSearch, setAdvancedSearch] = useState<AdvancedSearchState>({
    showAdvancedSearch: false,
    searchField: 'all',
    useRegex: false,
    caseSensitive: false,
  })

  // 防抖搜索效果
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm)
    }, 300) // 300ms 防抖延迟

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.searchTerm])

  // 当防抖搜索词变化时，重置到第一页
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm])

  // 事件处理函数
  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }))
    // 不立即重置页面，等防抖完成后再重置
  }, [])

  const handleSeverityChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, selectedSeverity: value }))
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback(
    (field: 'timestamp' | 'count' | 'severity') => {
      setFilters((prev) => {
        if (prev.sortBy === field) {
          return {
            ...prev,
            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
          }
        } else {
          return { ...prev, sortBy: field, sortOrder: 'desc' }
        }
      })
      setCurrentPage(1)
    },
    []
  )

  const handleErrorExpand = useCallback((errorId: string | null) => {
    setExpandedError(errorId)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)

    // 滚动到顶部
    const container = document.querySelector('.error-logs-container')
    if (container) {
      container.scrollTop = 0
    }
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }, [])

  // 高级搜索字段变化处理
  const handleSearchFieldChange = useCallback((field: string) => {
    if (['all', 'type', 'message', 'page', 'userAgent'].includes(field)) {
      setAdvancedSearch((prev) => ({
        ...prev,
        searchField: field as typeof advancedSearch.searchField,
      }))
    }
  }, [])

  const handleAdvancedSearchToggle = useCallback(() => {
    setAdvancedSearch((prev) => ({
      ...prev,
      showAdvancedSearch: !prev.showAdvancedSearch,
    }))
  }, [])

  const handleUseRegexChange = useCallback((value: boolean) => {
    setAdvancedSearch((prev) => ({ ...prev, useRegex: value }))
  }, [])

  const handleCaseSensitiveChange = useCallback((value: boolean) => {
    setAdvancedSearch((prev) => ({ ...prev, caseSensitive: value }))
  }, [])

  return {
    // 状态
    expandedError,
    currentPage,
    itemsPerPage,
    filters,
    advancedSearch,
    debouncedSearchTerm, // 防抖后的搜索词

    // 事件处理
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
  }
}
