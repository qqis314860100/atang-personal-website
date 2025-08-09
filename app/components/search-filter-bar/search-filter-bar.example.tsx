'use client'

import { SearchFilterBar } from './search-filter-bar'
import { useState } from 'react'

// 示例：基础搜索过滤栏
export function BasicSearchFilterExample() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="搜索产品..."
      filterOptions={[
        { value: 'all', label: '所有分类' },
        { value: 'electronics', label: '电子产品' },
        { value: 'clothing', label: '服装' },
        { value: 'books', label: '图书' },
      ]}
      selectedFilter={selectedCategory}
      onFilterChange={setSelectedCategory}
      sortOptions={[
        { key: 'name', label: '名称' },
        { key: 'price', label: '价格' },
        { key: 'date', label: '日期' },
      ]}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={setSortBy}
    />
  )
}

// 示例：高级搜索过滤栏
export function AdvancedSearchFilterExample() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchField, setSearchField] = useState('all')
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="搜索任务..."
      filterOptions={[
        { value: 'all', label: '所有状态' },
        { value: 'pending', label: '待处理' },
        { value: 'in-progress', label: '进行中' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' },
      ]}
      selectedFilter={selectedStatus}
      onFilterChange={setSelectedStatus}
      sortOptions={[
        { key: 'priority', label: '优先级' },
        { key: 'dueDate', label: '截止日期' },
        { key: 'createdAt', label: '创建时间' },
      ]}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={setSortBy}
      showAdvancedSearch={true}
      onAdvancedSearchToggle={() => console.log('Toggle advanced search')}
      searchField={searchField}
      onSearchFieldChange={setSearchField}
      useRegex={useRegex}
      onUseRegexChange={setUseRegex}
      caseSensitive={caseSensitive}
      onCaseSensitiveChange={setCaseSensitive}
    />
  )
}

// 示例：仅搜索栏
export function SearchOnlyExample() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="快速搜索..."
      showFilter={false}
      showSort={false}
    />
  )
}

// 示例：仅过滤栏
export function FilterOnlyExample() {
  const [selectedType, setSelectedType] = useState('all')

  return (
    <SearchFilterBar
      searchTerm=""
      onSearchChange={() => {}}
      showSearch={false}
      showSort={false}
      filterOptions={[
        { value: 'all', label: '所有类型' },
        { value: 'error', label: '错误' },
        { value: 'warning', label: '警告' },
        { value: 'info', label: '信息' },
      ]}
      selectedFilter={selectedType}
      onFilterChange={setSelectedType}
    />
  )
}
