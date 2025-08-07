import { NextRequest } from 'next/server'

const sessionHistory = new Map<string, { role: string; content: string }[]>()

// 工具函数
async function calculator(code: string) {
  try {
    // 仅支持简单表达式
    // eslint-disable-next-line no-eval
    const result = eval(code)
    return { result }
  } catch (e: any) {
    return { error: e.message }
  }
}
async function weather_query(city: string) {
  // 这里用模拟数据，实际可接入第三方天气API
  return { city, temperature: '25°C', description: '晴' }
}
async function web_search(query: string) {
  // 这里用模拟数据，实际可接入搜索API
  return { result: `关于“${query}”的搜索结果未找到。` }
}
const toolFunctions: Record<string, Function> = {
  calculator,
  weather_query,
  web_search,
}

export async function POST(req: NextRequest) {
  const { query, sessionId } = await req.json()
  if (!sessionId) {
    return new Response(JSON.stringify({ error: '缺少sessionId' }), {
      status: 400,
    })
  }

  // 维护历史对话
  if (!sessionHistory.has(sessionId)) sessionHistory.set(sessionId, [])
  const history = sessionHistory.get(sessionId)!
  history.push({ role: 'user', content: query })

  // 构造上下文
  const messages = [
    {
      role: 'system',
      content:
        '你是一个专业的中文编程助手，回答要简洁、直接、实用。你可以调用工具：calculator、weather_query、web_search。',
    },
    ...history,
  ]

  // DeepSeek工具描述
  const tools = [
    {
      type: 'function',
      function: {
        name: 'calculator',
        description: '一个可以执行JavaScript代码的计算器',
        parameters: {
          type: 'object',
          properties: {
            code: { type: 'string', description: '要执行的JavaScript代码' },
          },
          required: ['code'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'weather_query',
        description: '查询指定城市的实时天气信息',
        parameters: {
          type: 'object',
          properties: { city: { type: 'string', description: '城市名称' } },
          required: ['city'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'web_search',
        description: '查询实时信息、新闻、股票等',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string', description: '搜索关键词' } },
          required: ['query'],
        },
      },
    },
  ]

  // 调用 DeepSeek API（用 fetch 实现流式）
  const apiKey = process.env.DEEPSEEK_API_KEY!
  const url = 'https://api.deepseek.com/v1/chat/completions'
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({
    model: 'deepseek-chat',
    messages,
    stream: true,
    tools,
  })

  const upstream = await fetch(url, { method: 'POST', headers, body })
  if (!upstream.ok) {
    return new Response(
      JSON.stringify({
        error: '请求失败,DeepSeek API返回: ' + upstream.statusText,
      }),
      {
        status: 500,
      }
    )
  }
  // 1.返创建一个转换流，用于在数据流传输过程中进行转换
  const { readable, writable } = new TransformStream()
  // 2.获取写入器和读取器
  const writer = writable.getWriter()
  const reader = upstream.body!.getReader()
  // 3.初始化AI回复和工具调用状态
  let assistantMsg = ''
  let currentToolCall = null
  // 4.创建一个解码器，用于将二进制数据转换为文本
  const decoder = new TextDecoder()
  // 5.创建一个循环，用于读取数据流
  async function pump() {
    while (true) {
      // 6.读取数据流
      const { value, done } = await reader.read()
      if (done) break
      const chunk = decoder.decode(value)
      // 7.将数据流按行分割
      const lines = chunk.split('\n').filter(Boolean)
      // 8.遍历每一行
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          // 9.解析数据
          try {
            const jsonStr = line.slice(6)
            // 跳过 [DONE] 消息
            if (jsonStr.trim() === '[DONE]') {
              continue
            }
            const data = JSON.parse(jsonStr)
            // 10.工具调用 - 暂时跳过，因为流式API的工具调用需要特殊处理
            if (data.choices?.[0]?.delta?.tool_calls) {
              console.log(
                '检测到工具调用，但流式API的工具调用需要特殊处理，暂时跳过'
              )
              assistantMsg =
                '检测到工具调用，但流式API的工具调用需要特殊处理，暂时跳过'
              // 20.发送AI回复 - 只发送新增的内容，不是完整内容
              await writer.write(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: 'final_answer',
                    value:
                      '检测到工具调用，但流式API的工具调用需要特殊处理，暂时跳过', // 只发送当前这个chunk的内容
                  })}\n\n`
                )
              )
              // TODO: 实现完整的工具调用累积逻辑
            }
            // 普通内容流式输出
            const content = data.choices?.[0]?.delta?.content
            if (content) {
              // 19.追加到AI回复
              assistantMsg += content
              // 20.发送AI回复 - 只发送新增的内容，不是完整内容
              await writer.write(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({
                    type: 'final_answer',
                    value: content, // 只发送当前这个chunk的内容
                  })}\n\n`
                )
              )
            }
          } catch (error) {
            console.error('解析JSON失败:', error, '原始数据:', line)
            // 继续处理下一行，不中断流
            continue
          }
        }
      }
    }
    // 21.记录AI回复到历史
    history.push({ role: 'assistant', content: assistantMsg })
    // 22.关闭写入器
    await writer.close()
  }
  pump()

  // 23.返回流式响应
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
