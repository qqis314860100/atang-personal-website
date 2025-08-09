'use client'

import { HeatmapView, getDefaultHeatmapColor } from './heatmap-view'
import { useState } from 'react'

// 示例：基础热力图
export function BasicHeatmapExample() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const data = [
    { id: 'item1', intensity: 0.9, count: 150, name: '项目A' },
    { id: 'item2', intensity: 0.7, count: 120, name: '项目B' },
    { id: 'item3', intensity: 0.5, count: 80, name: '项目C' },
    { id: 'item4', intensity: 0.3, count: 50, name: '项目D' },
  ]

  const renderItem = (item: any, index: number, isExpanded: boolean) => (
    <div className="text-center">
      <p className="text-xs font-medium text-white">{item.name}</p>
      <p className="text-xs text-white/80">{item.count}</p>
    </div>
  )

  const renderExpandedContent = (item: any) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-white">详细信息</h4>
      <p className="text-xs text-gray-300">
        强度: {(item.intensity * 100).toFixed(0)}%
      </p>
      <p className="text-xs text-gray-300">数量: {item.count}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">基础热力图示例</h3>
      <HeatmapView
        data={data}
        viewMode="grid"
        expandedItem={expandedItem}
        onItemClick={(itemId) =>
          setExpandedItem(expandedItem === itemId ? null : itemId)
        }
        onItemExpand={setExpandedItem}
        renderItem={renderItem}
        renderExpandedContent={renderExpandedContent}
        gridCols={2}
        itemHeight="h-20"
        getHeatmapColor={getDefaultHeatmapColor}
        emptyIcon={<div className="w-6 h-6 text-gray-400">📊</div>}
        emptyText="暂无数据"
      />
    </div>
  )
}

// 示例：列表视图热力图
export function ListHeatmapExample() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const data = [
    {
      id: 'user1',
      intensity: 0.8,
      name: '用户A',
      visits: 200,
      lastVisit: '2024-01-15',
    },
    {
      id: 'user2',
      intensity: 0.6,
      name: '用户B',
      visits: 150,
      lastVisit: '2024-01-14',
    },
    {
      id: 'user3',
      intensity: 0.4,
      name: '用户C',
      visits: 100,
      lastVisit: '2024-01-13',
    },
  ]

  const renderItem = (item: any, index: number, isExpanded: boolean) => (
    <>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{index + 1}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{item.name}</p>
          <p className="text-xs text-gray-400">{item.visits} 次访问</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-white">{item.visits}</p>
        <p className="text-xs text-gray-400">访问次数</p>
      </div>
    </>
  )

  const renderExpandedContent = (item: any) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-white">用户详情</h4>
      <p className="text-xs text-gray-300">最后访问: {item.lastVisit}</p>
      <p className="text-xs text-gray-300">
        活跃度: {(item.intensity * 100).toFixed(0)}%
      </p>
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">列表视图热力图示例</h3>
      <HeatmapView
        data={data}
        viewMode="list"
        expandedItem={expandedItem}
        onItemClick={(itemId) =>
          setExpandedItem(expandedItem === itemId ? null : itemId)
        }
        onItemExpand={setExpandedItem}
        renderItem={renderItem}
        renderExpandedContent={renderExpandedContent}
        getHeatmapColor={getDefaultHeatmapColor}
        emptyIcon={<div className="w-6 h-6 text-gray-400">👥</div>}
        emptyText="暂无用户数据"
      />
    </div>
  )
}

// 示例：自定义颜色热力图
export function CustomColorHeatmapExample() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const data = [
    { id: 'task1', intensity: 0.9, priority: '高', status: '进行中' },
    { id: 'task2', intensity: 0.6, priority: '中', status: '待处理' },
    { id: 'task3', intensity: 0.3, priority: '低', status: '已完成' },
  ]

  const getCustomHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-purple-500'
    if (intensity >= 0.6) return 'bg-indigo-500'
    if (intensity >= 0.4) return 'bg-cyan-500'
    if (intensity >= 0.2) return 'bg-teal-500'
    return 'bg-gray-500'
  }

  const renderItem = (item: any, index: number, isExpanded: boolean) => (
    <div className="text-center">
      <p className="text-xs font-medium text-white">任务 {index + 1}</p>
      <p className="text-xs text-white/80">{item.priority}</p>
    </div>
  )

  const renderExpandedContent = (item: any) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-white">任务详情</h4>
      <p className="text-xs text-gray-300">优先级: {item.priority}</p>
      <p className="text-xs text-gray-300">状态: {item.status}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">自定义颜色热力图示例</h3>
      <HeatmapView
        data={data}
        viewMode="grid"
        expandedItem={expandedItem}
        onItemClick={(itemId) =>
          setExpandedItem(expandedItem === itemId ? null : itemId)
        }
        onItemExpand={setExpandedItem}
        renderItem={renderItem}
        renderExpandedContent={renderExpandedContent}
        gridCols={3}
        itemHeight="h-24"
        getHeatmapColor={getCustomHeatmapColor}
        emptyIcon={<div className="w-6 h-6 text-gray-400">📋</div>}
        emptyText="暂无任务数据"
      />
    </div>
  )
}
