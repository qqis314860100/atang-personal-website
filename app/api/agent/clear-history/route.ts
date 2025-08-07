import { NextRequest } from 'next/server'

// 这里可以扩展为数据库存储，目前用内存Map
const sessionHistory = new Map<string, { role: string; content: string }[]>()

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()

  if (sessionHistory.has(sessionId)) {
    sessionHistory.delete(sessionId)
  }

  return new Response(JSON.stringify({ message: '历史已清除' }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
