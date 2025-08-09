import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/database/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    const type = searchParams.get('type')

    // 根据type参数返回不同类型的数据
    switch (type) {
      case 'pageHeatmap':
        const pageHeatmapData = await analyticsService.getPageHeatmapData(
          timeRange
        )
        return NextResponse.json({
          success: true,
          data: pageHeatmapData,
          timeRange,
          timestamp: new Date().toISOString(),
        })

      case 'deviceHeatmap':
        const deviceHeatmapData = await analyticsService.getDeviceHeatmapData(
          timeRange
        )
        return NextResponse.json({
          success: true,
          data: deviceHeatmapData,
          timeRange,
          timestamp: new Date().toISOString(),
        })

      case 'performanceHeatmap':
        const performanceHeatmap =
          await analyticsService.getPerformanceHeatmapData(timeRange)
        return NextResponse.json({
          success: true,
          data: performanceHeatmap,
          timeRange,
          timestamp: new Date().toISOString(),
        })

      case 'errorDetail':
        const errorId = searchParams.get('errorId')
        if (!errorId) {
          return NextResponse.json(
            { success: false, error: '缺少错误ID参数' },
            { status: 400 }
          )
        }
        const errorDetail = await analyticsService.getErrorLogDetail(errorId)
        return NextResponse.json({
          success: true,
          data: errorDetail,
          timestamp: new Date().toISOString(),
        })

      default:
        // 获取简化的Dashboard数据
        const data = await analyticsService.getDashboardData(timeRange)
        return NextResponse.json({
          success: true,
          data,
          timeRange,
          timestamp: new Date().toISOString(),
        })
    }
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取数据失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
