// 临时使用内存存储，避免复杂的Prisma schema配置
// 如需持久化，可后续配置数据库schema

// 对话历史记录接口
export interface ChatMessage {
  id?: string
  sessionId: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  timestamp?: Date
}

// 内存存储
const sessionHistory = new Map<string, ChatMessage[]>()

// 创建新的对话会话
export async function createSession(sessionId: string) {
  try {
    if (!sessionHistory.has(sessionId)) {
      sessionHistory.set(sessionId, [])
    }
    return { success: true }
  } catch (error) {
    console.error('创建会话失败:', error)
    return { error: '创建会话失败' }
  }
}

// 添加消息到历史
export async function addMessage(message: ChatMessage) {
  try {
    if (!sessionHistory.has(message.sessionId)) {
      sessionHistory.set(message.sessionId, [])
    }
    const history = sessionHistory.get(message.sessionId)!
    history.push({
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    })
    return { success: true }
  } catch (error) {
    console.error('添加消息失败:', error)
    return { error: '添加消息失败' }
  }
}

// 获取会话历史
export async function getSessionHistory(sessionId: string, limit = 50) {
  try {
    const history = sessionHistory.get(sessionId) || []
    return history.slice(-limit)
  } catch (error) {
    console.error('获取历史失败:', error)
    return []
  }
}

// 清除会话历史
export async function clearSessionHistory(sessionId: string) {
  try {
    sessionHistory.delete(sessionId)
    return { success: true }
  } catch (error) {
    console.error('清除历史失败:', error)
    return { error: '清除历史失败' }
  }
}

// 获取所有会话列表
export async function getAllSessions() {
  try {
    const sessions: Array<{ sessionId: string; lastMessage?: ChatMessage }> = []
    for (const [sessionId, messages] of sessionHistory.entries()) {
      sessions.push({
        sessionId,
        lastMessage: messages[messages.length - 1],
      })
    }
    return sessions
  } catch (error) {
    console.error('获取会话列表失败:', error)
    return []
  }
}

// 删除过期会话（可选）
export async function cleanupExpiredSessions(daysOld = 30) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    for (const [sessionId, messages] of sessionHistory.entries()) {
      const hasRecentMessage = messages.some(
        (msg) => msg.timestamp && msg.timestamp > cutoffDate
      )
      if (!hasRecentMessage) {
        sessionHistory.delete(sessionId)
      }
    }

    return { success: true }
  } catch (error) {
    console.error('清理过期会话失败:', error)
    return { error: '清理失败' }
  }
}
