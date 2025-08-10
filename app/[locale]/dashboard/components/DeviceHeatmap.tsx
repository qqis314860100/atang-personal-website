'use client'

import { useState, useMemo } from 'react'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Smartphone,
  Monitor,
  Tablet,
  List,
  Grid3X3,
  Globe,
  MonitorSmartphone,
} from 'lucide-react'
import { useI18n } from '@/app/hooks/use-i18n'
import { useTheme } from 'next-themes'
import { getThemeClasses } from '@/lib/theme/colors'
import { FullscreenCard } from '@/app/components/full-screen'
import {
  ThemeText,
  ThemeTextSM,
  ThemeTextXS,
} from '@/app/components/ui/theme-text'

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
  const t = useI18n()
  const { theme } = useTheme()
  const currentTheme = theme === 'dark' ? 'dark' : 'light'

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

  return (
    <FullscreenCard
      title={
        <>
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              currentTheme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-500/10'
            }`}
          >
            <Smartphone className="w-5 h-5 text-blue-400" />
          </div>
          {t.dashboard('设备访问热力图')}
        </>
      }
      className="h-[800px]"
      header={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <List className="w-4 h-4 inline mr-1" />
            {t.dashboard('列表视图')}
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Grid3X3 className="w-4 h-4 inline mr-1" />
            {t.dashboard('热力图视图')}
          </button>
        </div>
      }
    >
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? renderListView() : renderHeatmapView()}
      </div>
    </FullscreenCard>
  )

  function renderListView() {
    return (
      <div className="space-y-4">
        {data.map((device, index) => {
          const topBrowsers = getTopBrowsers(device.browsers)
          return (
            <ThemeCard
              key={index}
              variant="glass"
              className={getThemeClasses(
                'transition-all duration-300 border cursor-pointer',
                currentTheme,
                {
                  card: 'glass',
                  border: 'primary',
                  gradient: 'primary',
                  shadow: 'glass',
                  hover: 'primary',
                }
              )}
              onClick={() =>
                setExpandedDevice(
                  expandedDevice === device.device ? null : device.device
                )
              }
            >
              <ThemeCardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        currentTheme === 'dark'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      {getDeviceIcon(device.device)}
                    </div>
                    <div>
                      <ThemeText weight="medium" variant="primary">
                        {device.device}
                      </ThemeText>
                      <ThemeTextSM variant="tertiary">
                        {Object.keys(device.browsers).length}{' '}
                        {t.dashboard('种浏览器')}
                      </ThemeTextSM>
                    </div>
                  </div>
                  <div className="text-right">
                    <ThemeText size="lg" weight="semibold" variant="primary">
                      {device.count}
                    </ThemeText>
                    <ThemeTextXS variant="tertiary">
                      {t.dashboard('次访问')}
                    </ThemeTextXS>
                  </div>
                  <div className="text-right">
                    <ThemeTextSM weight="medium" variant="primary">
                      {(
                        (device.count /
                          data.reduce((sum, d) => sum + d.count, 0)) *
                        100
                      ).toFixed(1)}
                      %
                    </ThemeTextSM>
                    <ThemeTextXS variant="tertiary">
                      {t.dashboard('占比')}
                    </ThemeTextXS>
                  </div>
                </div>

                {/* 展开的详细信息 */}
                {expandedDevice === device.device && (
                  <div className="p-4 bg-gray-700/30 rounded-lg space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <ThemeTextSM
                          weight="medium"
                          variant="primary"
                          className="mb-2"
                        >
                          {t.dashboard('浏览器分布')}
                        </ThemeTextSM>
                        <div className="space-y-2">
                          {topBrowsers.map((browser, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <ThemeText variant="secondary">
                                {browser.browser}
                              </ThemeText>
                              <ThemeText variant="tertiary">
                                {browser.count} {t.dashboard('次')}
                              </ThemeText>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <ThemeTextSM
                          weight="medium"
                          variant="primary"
                          className="mb-2"
                        >
                          {t.dashboard('设备详情')}
                        </ThemeTextSM>
                        {device.deviceDetails &&
                        device.deviceDetails.length > 0 ? (
                          <div className="space-y-2">
                            <ThemeTextSM variant="secondary">
                              {t.dashboard('操作系统')}:{' '}
                              {device.deviceDetails[0].osName}{' '}
                              {device.deviceDetails[0].osVersion}
                            </ThemeTextSM>
                            <ThemeTextSM variant="secondary">
                              {t.dashboard('屏幕分辨率')}:{' '}
                              {device.deviceDetails[0].screenResolution}
                            </ThemeTextSM>
                            <ThemeTextSM variant="secondary">
                              {t.dashboard('语言')}:{' '}
                              {device.deviceDetails[0].language}
                            </ThemeTextSM>
                          </div>
                        ) : (
                          <ThemeTextSM variant="muted">
                            {t.dashboard('暂无详细设备信息')}
                          </ThemeTextSM>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ThemeCardContent>
            </ThemeCard>
          )
        })}
      </div>
    )
  }

  function renderHeatmapView() {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((device, index) =>
          renderDeviceItem(device, index, expandedDevice === device.device)
        )}
      </div>
    )
  }

  function renderDeviceItem(
    device: DeviceHeatmapData,
    index: number,
    isExpanded: boolean
  ) {
    return (
      <div key={index} className="relative">
        <div
          className={`w-full h-32 rounded-lg cursor-pointer transition-all duration-300 ${
            isExpanded ? 'h-auto' : ''
          }`}
          style={{
            backgroundColor: getHeatmapColor(device.intensity),
          }}
          onClick={() => setExpandedDevice(isExpanded ? null : device.device)}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-2">
            <div className="text-center">
              <div className="mb-2">{getDeviceIcon(device.device)}</div>
              <p className="text-xs font-medium">{device.device}</p>
              <p className="text-xs opacity-75">{device.count}</p>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-2 p-3 bg-gray-700/30 rounded-lg">
            {renderExpandedContent(device)}
          </div>
        )}
      </div>
    )
  }

  function renderExpandedContent(device: DeviceHeatmapData) {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{t.dashboard('访问次数')}:</span>
          <span className="text-white font-medium">{device.count}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{t.dashboard('占比')}:</span>
          <span className="text-white font-medium">
            {(
              (device.count / data.reduce((sum, d) => sum + d.count, 0)) *
              100
            ).toFixed(1)}
            %
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">{t.dashboard('浏览器种类')}:</span>
          <span className="text-white font-medium">
            {Object.keys(device.browsers).length}
          </span>
        </div>
      </div>
    )
  }
}
