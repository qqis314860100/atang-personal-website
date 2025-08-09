'use client'

import { ReactNode } from 'react'

export interface HeatmapItem {
  id: string
  intensity: number
  [key: string]: any
}

export interface HeatmapViewProps<T extends HeatmapItem> {
  data: T[]
  viewMode: 'grid' | 'list'
  expandedItem: string | null
  onItemClick: (itemId: string) => void
  onItemExpand: (itemId: string | null) => void
  renderItem: (item: T, index: number, isExpanded: boolean) => ReactNode
  renderExpandedContent?: (item: T) => ReactNode
  gridCols?: number
  itemHeight?: string
  emptyIcon?: ReactNode
  emptyText?: string
  getHeatmapColor: (intensity: number) => string
  showEmptyState?: boolean
}

export function HeatmapView<T extends HeatmapItem>({
  data,
  viewMode,
  expandedItem,
  onItemClick,
  onItemExpand,
  renderItem,
  renderExpandedContent,
  gridCols = 3,
  itemHeight = 'h-24',
  emptyIcon,
  emptyText = '暂无数据',
  getHeatmapColor,
  showEmptyState = true,
}: HeatmapViewProps<T>) {
  if (data.length === 0 && showEmptyState) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          {emptyIcon}
        </div>
        <p className="text-gray-400 text-sm">{emptyText}</p>
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <div className={`grid grid-cols-${gridCols} gap-2`}>
          {data.map((item, index) => {
            const intensity = item.intensity
            const opacity = 0.4 + intensity * 0.6
            const isExpanded = expandedItem === item.id

            return (
              <div key={item.id} className="space-y-1">
                <div
                  className={`relative group cursor-pointer ${itemHeight} rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 ${getHeatmapColor(
                    intensity
                  )}`}
                  style={{ opacity }}
                  onClick={() => onItemExpand(isExpanded ? null : item.id)}
                >
                  {renderItem(item, index, isExpanded)}
                </div>

                {isExpanded && renderExpandedContent && (
                  <div className="ml-4 p-4 bg-gray-800/20 border border-gray-700/30 rounded-lg space-y-4">
                    {renderExpandedContent(item)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const isExpanded = expandedItem === item.id

        return (
          <div key={item.id} className="space-y-2">
            <div
              className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => onItemClick(item.id)}
            >
              {renderItem(item, index, isExpanded)}
            </div>

            {isExpanded && renderExpandedContent && (
              <div className="ml-4 p-4 bg-gray-800/20 border border-gray-700/30 rounded-lg space-y-4">
                {renderExpandedContent(item)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export const getDefaultHeatmapColor = (intensity: number) => {
  if (intensity >= 0.8) return 'bg-red-500'
  if (intensity >= 0.6) return 'bg-orange-500'
  if (intensity >= 0.4) return 'bg-yellow-500'
  if (intensity >= 0.2) return 'bg-blue-500'
  return 'bg-gray-500'
}
 