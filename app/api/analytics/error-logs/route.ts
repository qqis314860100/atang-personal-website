import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/database/analytics'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查询参数
    const options = {
      timeRange: searchParams.get('timeRange') || '7d',
      searchTerm: searchParams.get('searchTerm') || undefined,
      searchField: searchParams.get('searchField') || 'all',
      severity: searchParams.get('severity') || 'all',
      sortBy: searchParams.get('sortBy') || 'timestamp',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    }

    // 调用数据库服务获取错误日志
    const result = await analyticsService.getErrorLogs(options)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('错误日志API错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取错误日志失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    )
  }
}
