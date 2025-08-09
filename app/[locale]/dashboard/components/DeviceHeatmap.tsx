'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Smartphone, Monitor, Tablet, Globe, List, Grid3X3 } from 'lucide-react'
import { useState } from 'react'
import {
  HeatmapView,
  getDefaultHeatmapColor,
} from '@/app/components/heatmap/heatmap-view'
import { FullscreenCard } from '@/app/components/full-screen'

interface DeviceHeatmapData {
  device: string
  count: number
  browsers: { [key: string]: number }
  intensity: number
  // 新增详细设备信息
  deviceDetails?: {
    browserName: string
    browserVersion: string
    osName: string
    osVersion: string
    deviceModel: string
    screenResolution: string
    language: string
  }[]
}

interface DeviceHeatmapProps {
  data: DeviceHeatmapData[]
}

export function DeviceHeatmap({ data }: DeviceHeatmapProps) {
  const [expandedDevice, setExpandedDevice] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'heatmap'>('list')

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500'
    if (intensity >= 0.6) return 'bg-orange-500'
    if (intensity >= 0.4) return 'bg-yellow-500'
    if (intensity >= 0.2) return 'bg-blue-500'
    return 'bg-gray-500'
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-white" />
      case 'tablet':
        return <Tablet className="w-4 h-4 text-white" />
      case 'desktop':
        return <Monitor className="w-4 h-4 text-white" />
      default:
        return <Globe className="w-4 h-4 text-white" />
    }
  }

  const getTopBrowsers = (browsers: { [key: string]: number }) => {
    return Object.entries(browsers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([browser, count]) => ({ browser, count }))
  }

  const renderListView = () => (
    <div className="space-y-4">
      {data.length > 0 ? (
        data.map((device, index) => {
          const topBrowsers = getTopBrowsers(device.browsers)
          const isExpanded = expandedDevice === device.device

          return (
            <div key={index} className="space-y-2">
              <div
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() =>
                  setExpandedDevice(isExpanded ? null : device.device)
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${getHeatmapColor(
                      device.intensity
                    )}`}
                  >
                    {getDeviceIcon(device.device)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {device.device}
                    </p>
                    <p className="text-xs text-gray-400">
                      {Object.keys(device.browsers).length} 种浏览器
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {device.count}
                    </p>
                    <p className="text-xs text-gray-400">访问次数</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full ${getHeatmapColor(
                      device.intensity
                    )}`}
                  ></div>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {isExpanded && (
                <div className="pl-4 space-y-3">
                  <div className="bg-gray-800/30 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-white mb-2">
                      热门浏览器
                    </h4>
                    <div className="space-y-2">
                      {topBrowsers.map((browser, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-gray-300">
                            {browser.browser}
                          </span>
                          <span className="text-xs text-gray-400">
                            {browser.count} 次
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Smartphone className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm">暂无设备数据</p>
        </div>
      )}
    </div>
  )

  const renderHeatmapView = () => {
    const renderDeviceItem = (
      device: DeviceHeatmapData,
      index: number,
      isExpanded: boolean
    ) => (
      <div className="text-center">
        {getDeviceIcon(device.device)}
        <p className="text-xs font-medium text-white mt-1">{device.device}</p>
        <p className="text-xs text-white/80">{device.count}</p>
      </div>
    )

    const renderExpandedContent = (device: DeviceHeatmapData) => {
      const topBrowsers = getTopBrowsers(device.browsers)
      return (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-white mb-2">浏览器分布</h4>
            <div className="space-y-2">
              {topBrowsers.map((browser, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-300">{browser.browser}</span>
                  <span className="text-gray-400">{browser.count} 次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <HeatmapView
        data={data.map((device) => ({ ...device, id: device.device }))}
        viewMode="grid"
        expandedItem={expandedDevice}
        onItemClick={(deviceId) =>
          setExpandedDevice(expandedDevice === deviceId ? null : deviceId)
        }
        onItemExpand={setExpandedDevice}
        renderItem={renderDeviceItem}
        renderExpandedContent={renderExpandedContent}
        gridCols={3}
        itemHeight="h-24"
        getHeatmapColor={getDefaultHeatmapColor}
        emptyIcon={<Smartphone className="w-6 h-6 text-gray-400" />}
        emptyText="暂无设备数据"
      />
    )
  }

  return (
    <FullscreenCard
      title={
        <>
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-400" />
          </div>
          设备分布热力图
        </>
      }
      actions={
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-green-500/20 text-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-green-500/20 text-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            title="热力图视图"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      }
    >
      {viewMode === 'list' ? renderListView() : renderHeatmapView()}
    </FullscreenCard>
  )
}
