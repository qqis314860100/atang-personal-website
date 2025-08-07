import { NextRequest } from 'next/server'

// ====== 扩展工具函数 ======

// 1. 文件操作工具
async function file_operations(
  operation: string,
  path: string,
  content?: string
) {
  try {
    switch (operation) {
      case 'read':
        // 这里可以接入真实的文件系统API
        return { success: true, content: `模拟读取文件: ${path}` }
      case 'write':
        return { success: true, message: `模拟写入文件: ${path}` }
      case 'delete':
        return { success: true, message: `模拟删除文件: ${path}` }
      default:
        return { error: '不支持的操作' }
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 2. 网络请求工具
async function http_request(
  method: string,
  url: string,
  headers?: Record<string, string>,
  body?: string
) {
  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: headers || {},
      body: body,
    })
    const data = await response.text()
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 3. 时间日期工具
async function datetime_operations(
  operation: string,
  format?: string,
  timezone?: string
) {
  const now = new Date()
  try {
    switch (operation) {
      case 'current':
        return {
          datetime: now.toISOString(),
          timestamp: now.getTime(),
          formatted: now.toLocaleString('zh-CN'),
        }
      case 'format':
        return {
          formatted: now.toLocaleString('zh-CN', {
            timeZone: timezone || 'Asia/Shanghai',
            ...(format && { dateStyle: format as any }),
          }),
        }
      default:
        return { error: '不支持的操作' }
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 4. 数据转换工具
async function data_converter(input: string, from: string, to: string) {
  try {
    switch (from) {
      case 'json':
        const parsed = JSON.parse(input)
        switch (to) {
          case 'yaml':
            return {
              result: `模拟JSON转YAML: ${JSON.stringify(parsed, null, 2)}`,
            }
          case 'xml':
            return { result: `模拟JSON转XML: ${input}` }
          default:
            return { error: '不支持的转换格式' }
        }
      case 'base64':
        switch (to) {
          case 'text':
            return { result: Buffer.from(input, 'base64').toString() }
          default:
            return { error: '不支持的转换格式' }
        }
      default:
        return { error: '不支持的输入格式' }
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 5. 数学计算工具（扩展版）
async function advanced_calculator(expression: string, precision?: number) {
  try {
    // 支持更多数学函数
    const mathFunctions = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      sqrt: Math.sqrt,
      pow: Math.pow,
      log: Math.log,
      exp: Math.exp,
      abs: Math.abs,
      round: Math.round,
      floor: Math.floor,
      ceil: Math.ceil,
      PI: Math.PI,
      E: Math.E,
    }

    // 创建安全的计算环境
    const safeEval = (expr: string) => {
      // 只允许数学表达式，防止恶意代码
      const allowedChars = /^[0-9+\-*/()., \s]+$/
      if (!allowedChars.test(expr)) {
        throw new Error('表达式包含不允许的字符')
      }
      return eval(expr)
    }

    const result = safeEval(expression)
    return {
      result: precision ? Number(result.toFixed(precision)) : result,
      expression,
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 6. 文本处理工具
async function text_processor(operation: string, text: string, options?: any) {
  try {
    switch (operation) {
      case 'count_words':
        return { count: text.split(/\s+/).length }
      case 'count_chars':
        return { count: text.length }
      case 'to_uppercase':
        return { result: text.toUpperCase() }
      case 'to_lowercase':
        return { result: text.toLowerCase() }
      case 'reverse':
        return { result: text.split('').reverse().join('') }
      case 'extract_numbers':
        const numbers = text.match(/\d+/g) || []
        return { numbers: numbers.map((n) => parseInt(n)) }
      default:
        return { error: '不支持的操作' }
    }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 7. 系统信息工具
async function system_info() {
  return {
    platform: process.platform,
    nodeVersion: process.version,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    pid: process.pid,
  }
}

// 导出所有工具
export const extendedTools = {
  file_operations,
  http_request,
  datetime_operations,
  data_converter,
  advanced_calculator,
  text_processor,
  system_info,
}

// API端点用于测试工具
export async function POST(req: NextRequest) {
  const { tool, ...params } = await req.json()

  if (!extendedTools[tool as keyof typeof extendedTools]) {
    return new Response(JSON.stringify({ error: '工具不存在' }), {
      status: 400,
    })
  }

  try {
    const toolFunction = extendedTools[tool as keyof typeof extendedTools]
    const result = await (toolFunction as Function)(...Object.values(params))
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
}
