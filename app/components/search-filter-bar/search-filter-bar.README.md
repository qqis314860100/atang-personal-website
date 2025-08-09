# SearchFilterBar 通用搜索过滤栏组件

一个功能完整的搜索、过滤和排序组件，支持基础搜索、高级搜索、字段过滤和排序功能。

## 功能特性

- 🔍 **智能搜索**：支持文本搜索，可配置占位符
- 🎯 **灵活过滤**：支持下拉选择过滤，可自定义选项
- 📊 **排序功能**：支持多字段排序，显示排序方向
- ⚡ **高级搜索**：支持字段选择、正则表达式、大小写敏感
- 🎨 **可定制**：支持显示/隐藏各个功能模块
- 📱 **响应式**：适配不同屏幕尺寸
- ♿ **无障碍**：支持键盘导航和屏幕阅读器

## 基础用法

```tsx
import { SearchFilterBar } from '@/components/ui/search-filter-bar'

function MyComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  return (
    <SearchFilterBar
      searchTerm={searchTerm}
      onSearchChange={setSearchChange}
      searchPlaceholder="搜索产品..."
      filterOptions={[
        { value: 'all', label: '所有分类' },
        { value: 'electronics', label: '电子产品' },
        { value: 'clothing', label: '服装' },
      ]}
      selectedFilter={selectedCategory}
      onFilterChange={setSelectedCategory}
      sortOptions={[
        { key: 'name', label: '名称' },
        { key: 'price', label: '价格' },
      ]}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={setSortBy}
    />
  )
}
```

## 高级用法

```tsx
<SearchFilterBar
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="高级搜索..."
  filterOptions={filterOptions}
  selectedFilter={selectedFilter}
  onFilterChange={setSelectedFilter}
  sortOptions={sortOptions}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={setSortBy}
  showAdvancedSearch={true}
  onAdvancedSearchToggle={handleAdvancedToggle}
  searchField={searchField}
  onSearchFieldChange={setSearchField}
  useRegex={useRegex}
  onUseRegexChange={setUseRegex}
  caseSensitive={caseSensitive}
  onCaseSensitiveChange={setCaseSensitive}
/>
```

## Props 配置

### 基础搜索配置

| 属性                | 类型                      | 默认值      | 说明                 |
| ------------------- | ------------------------- | ----------- | -------------------- |
| `searchTerm`        | `string`                  | -           | 搜索关键词（必需）   |
| `onSearchChange`    | `(value: string) => void` | -           | 搜索变化回调（必需） |
| `searchPlaceholder` | `string`                  | `"搜索..."` | 搜索框占位符         |

### 过滤配置

| 属性             | 类型                      | 默认值   | 说明             |
| ---------------- | ------------------------- | -------- | ---------------- |
| `filterOptions`  | `FilterOption[]`          | `[]`     | 过滤选项数组     |
| `selectedFilter` | `string`                  | `'all'`  | 当前选中的过滤值 |
| `onFilterChange` | `(value: string) => void` | -        | 过滤变化回调     |
| `filterLabel`    | `string`                  | `"过滤"` | 过滤标签文本     |

### 排序配置

| 属性           | 类型                   | 默认值   | 说明         |
| -------------- | ---------------------- | -------- | ------------ |
| `sortOptions`  | `SortOption[]`         | `[]`     | 排序选项数组 |
| `sortBy`       | `string`               | `''`     | 当前排序字段 |
| `sortOrder`    | `'asc' \| 'desc'`      | `'desc'` | 当前排序方向 |
| `onSortChange` | `(field: any) => void` | -        | 排序变化回调 |

### 显示控制

| 属性         | 类型      | 默认值 | 说明               |
| ------------ | --------- | ------ | ------------------ |
| `showSearch` | `boolean` | `true` | 是否显示搜索框     |
| `showFilter` | `boolean` | `true` | 是否显示过滤选择器 |
| `showSort`   | `boolean` | `true` | 是否显示排序选项   |
| `className`  | `string`  | `''`   | 自定义 CSS 类名    |

### 高级搜索配置

| 属性                     | 类型                               | 默认值  | 说明               |
| ------------------------ | ---------------------------------- | ------- | ------------------ |
| `showAdvancedSearch`     | `boolean`                          | `false` | 是否显示高级搜索   |
| `onAdvancedSearchToggle` | `() => void`                       | -       | 高级搜索切换回调   |
| `searchField`            | `string`                           | `'all'` | 当前搜索字段       |
| `onSearchFieldChange`    | `(field: string) => void`          | -       | 搜索字段变化回调   |
| `useRegex`               | `boolean`                          | `false` | 是否使用正则表达式 |
| `onUseRegexChange`       | `(use: boolean) => void`           | -       | 正则表达式切换回调 |
| `caseSensitive`          | `boolean`                          | `false` | 是否区分大小写     |
| `onCaseSensitiveChange`  | `(caseSensitive: boolean) => void` | -       | 大小写敏感切换回调 |

## 类型定义

```tsx
interface FilterOption {
  value: string
  label: string
}

interface SortOption {
  key: string
  label: string
}
```

## 使用场景

### 1. 产品列表页面

- 搜索产品名称
- 按分类过滤
- 按价格、评分排序

### 2. 任务管理页面

- 搜索任务内容
- 按状态过滤
- 按优先级、截止日期排序

### 3. 日志查看页面

- 搜索错误信息
- 按级别过滤
- 按时间、次数排序

### 4. 用户管理页面

- 搜索用户名
- 按角色过滤
- 按注册时间、活跃度排序

## 样式定制

组件使用 Tailwind CSS 类名，可以通过以下方式定制样式：

1. **覆盖默认样式**：使用 `className` 属性添加自定义类
2. **修改主题色彩**：调整 `bg-blue-500/20` 等颜色类
3. **调整间距**：修改 `p-3`、`space-y-3` 等间距类
4. **响应式设计**：使用 `grid-cols-2`、`md:grid-cols-3` 等响应式类

## 无障碍支持

- 支持键盘导航（Tab、Enter、Space）
- 语义化 HTML 标签
- 适当的 ARIA 标签
- 焦点状态指示
- 屏幕阅读器友好

## 性能优化

- 使用 `useCallback` 优化回调函数
- 条件渲染减少不必要的 DOM 节点
- 响应式设计减少重绘
- 合理的组件拆分

## 注意事项

1. **必需属性**：`searchTerm` 和 `onSearchChange` 是必需的
2. **回调函数**：确保所有回调函数都正确处理状态更新
3. **类型安全**：使用 TypeScript 获得更好的类型检查
4. **状态管理**：建议使用 React 状态管理库（如 Zustand、Redux）管理复杂状态
5. **样式冲突**：注意与现有样式的兼容性

## 更新日志

### v1.0.0

- 初始版本发布
- 支持基础搜索、过滤、排序功能
- 支持高级搜索选项
- 完整的 TypeScript 类型定义
