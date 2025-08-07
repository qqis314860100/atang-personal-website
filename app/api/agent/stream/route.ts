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
  try {
    const host = 'https://jisutqybmf.market.alicloudapi.com'
    const path = '/weather/query'
    const appcode = process.env.ALICLOUD_APPCODE // 从环境变量获取AppCode

    if (!appcode) {
      return {
        city,
        error: '未配置阿里云AppCode，请在环境变量中设置ALICLOUD_APPCODE',
      }
    }

    const headers = {
      Authorization: `APPCODE ${appcode}`,
      'Content-Type': 'application/json; charset=UTF-8',
    }

    const params = new URLSearchParams({
      city: city,
    })

    const url = `${host}${path}?${params.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      throw new Error(`天气查询失败: ${response.status}`)
    }

    const data = await response.json()

    // 解析阿里云天气API的响应格式
    if (data.status === 0 && data.result) {
      const weather = data.result
      return {
        city: weather.city,
        temperature: `${weather.temp}°C`,
        description: weather.weather,
        humidity: `${weather.humidity}%`,
        wind: weather.windpower,
        updateTime: weather.updatetime,
      }
    } else {
      return {
        city,
        error: data.msg || '获取天气信息失败',
      }
    }
  } catch (error: any) {
    console.error('天气查询失败:', error)
    return {
      city,
      error: `天气查询失败: ${error.message}`,
    }
  }
}

const toolFunctions: Record<string, Function> = {
  calculator,
  weather_query,
}

export async function POST(req: NextRequest) {
  try {
    const { query, sessionId } = await req.json()
    if (!sessionId) {
      return new Response(JSON.stringify({ error: '缺少sessionId' }), {
        status: 400,
      })
    }

    console.log(`收到查询: ${query}, sessionId: ${sessionId}`)

    // 维护历史对话
    if (!sessionHistory.has(sessionId)) sessionHistory.set(sessionId, [])
    const history = sessionHistory.get(sessionId)!
    history.push({ role: 'user', content: query })

    // 简化历史消息 - 只保留当前用户消息，不保留历史
    const currentMessage = { role: 'user', content: query }

    // 简化的系统提示词
    const systemPrompt =
      '你是一个专业的中文编程助手，回答要简洁、直接、实用。你可以调用工具：calculator、weather_query。'

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      currentMessage,
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

    // 检查请求体大小
    const bodySize = new TextEncoder().encode(body).length
    console.log(`请求体大小: ${Math.round(bodySize / 1024)}KB`)

    if (bodySize > 30000) {
      // 自动清理历史记录
      console.log('请求体过大，自动清理历史记录')
      sessionHistory.delete(sessionId)

      return new Response(
        JSON.stringify({
          error: '请求体过大，已自动清理历史记录，请重试',
          details: `当前大小: ${Math.round(bodySize / 1024)}KB，限制: 30KB`,
          messageCount: messages.length,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    const upstream = await fetch(url, { method: 'POST', headers, body })
    console.log(
      '请求体:',
      body,
      bodySize,
      upstream.ok,
      upstream.statusText,
      upstream.url
    )

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
    // 3.初始化AI回复和工具调用状态 - 确保每次请求都是全新状态
    let assistantMsg = ''
    let toolCalls: any[] = []
    let hasProcessedToolCalls = false // 添加标志位，防止重复处理工具调用
    let toolCallCount = 0 // 添加工具调用计数器
    // 4.创建一个解码器，用于将二进制数据转换为文本
    const decoder = new TextDecoder()
    // 5.创建一个循环，用于读取数据流
    async function pump() {
      try {
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
                // 10.工具调用处理
                if (data.choices?.[0]?.delta?.tool_calls) {
                  for (const toolCall of data.choices[0].delta.tool_calls) {
                    const toolIndex = toolCall.index || 0

                    // 确保工具调用数组有足够的空间
                    while (toolCalls.length <= toolIndex) {
                      toolCalls.push({
                        index: toolCalls.length,
                        function: { name: '', arguments: '' },
                      })
                    }

                    // 累积工具调用信息
                    if (toolCall.function?.name) {
                      toolCalls[toolIndex].function.name =
                        toolCall.function.name
                    }
                    if (toolCall.function?.arguments) {
                      toolCalls[toolIndex].function.arguments +=
                        toolCall.function.arguments
                    }
                  }
                }

                // 检查是否有完整的工具调用需要执行
                if (
                  data.choices?.[0]?.finish_reason === 'tool_calls' &&
                  !hasProcessedToolCalls
                ) {
                  hasProcessedToolCalls = true // 标记已处理
                  toolCallCount++ // 增加计数器

                  console.log(`开始执行工具调用，第${toolCallCount}次`)

                  // 执行所有工具调用
                  for (const toolCall of toolCalls) {
                    if (toolCall.function.name && toolCall.function.arguments) {
                      try {
                        const toolName = toolCall.function.name
                        const toolArgs = JSON.parse(toolCall.function.arguments)

                        console.log(`执行工具: ${toolName}`, toolArgs)

                        // 发送工具调用开始消息
                        await writer.write(
                          new TextEncoder().encode(
                            `data: ${JSON.stringify({
                              type: 'tool_call_start',
                              value: { tool: toolName, args: toolArgs },
                            })}\n\n`
                          )
                        )

                        // 执行工具调用
                        let toolResult = ''
                        if (toolFunctions[toolName]) {
                          try {
                            // 根据工具名称正确传递参数
                            let result
                            if (toolName === 'weather_query') {
                              result = await toolFunctions[toolName](
                                toolArgs.city
                              )
                            } else if (toolName === 'calculator') {
                              result = await toolFunctions[toolName](
                                toolArgs.code
                              )
                            } else {
                              result = await toolFunctions[toolName](
                                ...Object.values(toolArgs)
                              )
                            }
                            toolResult = JSON.stringify(result)
                            console.log(`工具 ${toolName} 执行成功`)
                          } catch (toolError: any) {
                            console.error(
                              `工具 ${toolName} 执行失败:`,
                              toolError
                            )
                            toolResult = JSON.stringify({
                              error: `工具执行失败: ${toolError.message}`,
                            })
                          }
                        } else {
                          toolResult = JSON.stringify({ error: '未知工具' })
                        }

                        // 发送工具调用结果
                        await writer.write(
                          new TextEncoder().encode(
                            `data: ${JSON.stringify({
                              type: 'tool_call_result',
                              value: { tool: toolName, result: toolResult },
                            })}\n\n`
                          )
                        )

                        // 追加到历史
                        history.push({ role: 'tool', content: toolResult })
                      } catch (error: any) {
                        console.error('执行工具调用失败:', error)
                        const errorResult = JSON.stringify({
                          error: `工具调用失败: ${error.message}`,
                        })

                        try {
                          await writer.write(
                            new TextEncoder().encode(
                              `data: ${JSON.stringify({
                                type: 'tool_call_error',
                                value: { error: error.message },
                              })}\n\n`
                            )
                          )
                          // 即使出错也要记录到历史
                          history.push({ role: 'tool', content: errorResult })
                        } catch (writeError) {
                          console.error('写入错误消息失败:', writeError)
                        }
                      }
                    }
                  }

                  // 重置工具调用状态
                  toolCalls = []
                  console.log(`工具调用执行完成，共执行${toolCallCount}次`)

                  // 工具调用完成后，需要继续等待AI的最终回复
                  // 不要在这里结束，继续处理后续的流数据
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
      } catch (error) {
        console.error('流处理过程中发生错误:', error)
        try {
          await writer.write(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                type: 'error',
                value: `流处理错误: ${
                  error instanceof Error ? error.message : '未知错误'
                }`,
              })}\n\n`
            )
          )
          await writer.close()
        } catch (closeError) {
          console.error('关闭流时发生错误:', closeError)
        }
      }
    }

    // 启动流处理
    pump().catch((error) => {
      console.error('pump函数执行失败:', error)
    })

    // 23.返回流式响应
    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('POST请求处理失败:', error)
    return new Response(
      JSON.stringify({
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
