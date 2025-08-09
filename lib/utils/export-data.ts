import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface ExportData {
  [key: string]: any
}

interface ExportOptions {
  filename?: string
  sheetName?: string
  format?: 'xlsx' | 'csv' | 'json'
}

/**
 * 导出数据到Excel文件
 */
export function exportToExcel(data: ExportData[], options: ExportOptions = {}) {
  const {
    filename = `dashboard-data-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Dashboard Data',
    format = 'xlsx',
  } = options

  try {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    let buffer: Buffer
    let mimeType: string
    let fileExtension: string

    if (format === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet)
      buffer = Buffer.from(csvContent, 'utf-8')
      mimeType = 'text/csv;charset=utf-8'
      fileExtension = 'csv'
    } else {
      buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
      mimeType =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      fileExtension = 'xlsx'
    }

    const blob = new Blob([buffer], { type: mimeType })
    saveAs(blob, `${filename}.${fileExtension}`)

    return { success: true, filename: `${filename}.${fileExtension}` }
  } catch (error) {
    console.error('导出Excel失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败',
    }
  }
}

/**
 * 导出数据到JSON文件
 */
export function exportToJSON(data: ExportData, options: ExportOptions = {}) {
  const {
    filename = `dashboard-data-${new Date().toISOString().split('T')[0]}`,
    format = 'json',
  } = options

  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    saveAs(blob, `${filename}.json`)

    return { success: true, filename: `${filename}.json` }
  } catch (error) {
    console.error('导出JSON失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败',
    }
  }
}

/**
 * 导出Dashboard数据
 */
export function exportDashboardData(
  data: any,
  type: 'traffic' | 'behavior' | 'performance' | 'realtime' | 'all'
) {
  const timestamp = new Date().toISOString().split('T')[0]

  switch (type) {
    case 'traffic':
      return exportToExcel(
        [
          { 指标: '总浏览量', 数值: data.pageViews, 单位: '次' },
          { 指标: '独立访客', 数值: data.uniqueVisitors, 单位: '人' },
          { 指标: '跳出率', 数值: data.bounceRate, 单位: '%' },
          { 指标: '平均会话时长', 数值: data.avgSessionDuration, 单位: '秒' },
          { 指标: '转化率', 数值: data.conversionRate, 单位: '%' },
        ],
        {
          filename: `traffic-data-${timestamp}`,
          sheetName: '流量数据',
        }
      )

    case 'behavior':
      const behaviorData = [
        ...data.userInteractions.map((item: any) => ({
          交互类型: item.action,
          次数: item.count,
          占比: `${(
            (item.count /
              data.userInteractions.reduce(
                (sum: number, i: any) => sum + i.count,
                0
              )) *
            100
          ).toFixed(1)}%`,
        })),
        ...data.deviceTypes.map((item: any) => ({
          设备类型: item.device,
          占比: `${item.percentage}%`,
        })),
      ]
      return exportToExcel(behaviorData, {
        filename: `behavior-data-${timestamp}`,
        sheetName: '用户行为数据',
      })

    case 'performance':
      return exportToExcel(
        [
          { 指标: '页面加载时间', 数值: data.performance.loadTime, 单位: '秒' },
          { 指标: '响应时间', 数值: data.performance.responseTime, 单位: '秒' },
          { 指标: '系统可用性', 数值: data.performance.uptime, 单位: '%' },
          { 指标: '错误数', 数值: data.errors, 单位: '个' },
        ],
        {
          filename: `performance-data-${timestamp}`,
          sheetName: '性能数据',
        }
      )

    case 'realtime':
      return exportToExcel(
        [
          { 指标: '当前用户', 数值: data.realTimeUsers, 单位: '人' },
          { 指标: '活跃会话', 数值: data.activeSessions || 0, 单位: '个' },
          { 指标: '页面浏览量', 数值: data.pageViews, 单位: '次' },
          { 指标: '事件总数', 数值: data.events || 0, 单位: '个' },
        ],
        {
          filename: `realtime-data-${timestamp}`,
          sheetName: '实时数据',
        }
      )

    case 'all':
      return exportToJSON(data, {
        filename: `dashboard-all-data-${timestamp}`,
      })

    default:
      return { success: false, error: '未知的导出类型' }
  }
}

/**
 * 导出图表数据
 */
export function exportChartData(chartData: any[], chartType: string) {
  const timestamp = new Date().toISOString().split('T')[0]

  return exportToExcel(chartData, {
    filename: `${chartType}-chart-data-${timestamp}`,
    sheetName: `${chartType}图表数据`,
  })
}

/**
 * 导出错误日志
 */
export function exportErrorLogs(errorLogs: any[]) {
  const timestamp = new Date().toISOString().split('T')[0]

  const formattedLogs = errorLogs.map((log) => ({
    错误类型: log.type,
    发生次数: log.count,
    最后发生时间: log.lastOccurrence,
    严重程度: log.severity,
  }))

  return exportToExcel(formattedLogs, {
    filename: `error-logs-${timestamp}`,
    sheetName: '错误日志',
  })
}
