# Socket.IO 自定义事件文档

## 概述

本文档描述了聊天室应用中所有已实现的 Socket.IO 自定义事件。

## 事件列表

### 1. `your_ip` - 获取用户 IP 地址

**触发时机**: 用户连接时自动触发
**发送方**: 后端 → 前端
**数据结构**:

```javascript
{
  ip: '192.168.1.100' // 用户真实IP地址
}
```

**用途**: 获取并显示用户的 IP 地址（已脱敏处理）

### 2. `join` - 用户加入聊天室

**触发时机**: 前端主动发送
**发送方**: 前端 → 后端
**数据结构**:

```javascript
{
  username: "用户名",
  visitorId: "访客ID"
}
```

**用途**: 用户加入聊天室，后端会触发 `user_joined`、`online_users`、`user_count` 事件

### 3. `user_joined` - 用户加入通知

**触发时机**: 有新用户加入时
**发送方**: 后端 → 前端（广播给其他用户）
**数据结构**:

```javascript
{
  id: "socket.id",
  username: "用户名",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

### 4. `user_left` - 用户离开通知

**触发时机**: 用户断开连接时
**发送方**: 后端 → 前端（广播给其他用户）
**数据结构**:

```javascript
{
  id: "socket.id",
  username: "用户名",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

### 5. `online_users` - 在线用户列表

**触发时机**: 用户加入时
**发送方**: 后端 → 前端
**数据结构**:

```javascript
;[
  {
    id: 'socket.id',
    username: '用户名',
    timestamp: '2024-01-01T00:00:00.000Z',
    processId: 12345,
  },
]
```

### 6. `user_count` - 在线用户数量

**触发时机**: 用户加入/离开时
**发送方**: 后端 → 前端
**数据结构**:

```javascript
5 // 数字，表示当前在线用户数量
```

### 7. `send_message` - 发送消息

**触发时机**: 用户发送消息时
**发送方**: 前端 → 后端
**数据结构**:

```javascript
{
  username: "用户名",
  message: "消息内容"
}
```

### 8. `new_message` - 新消息通知

**触发时机**: 有新消息时
**发送方**: 后端 → 前端（广播给所有用户）
**数据结构**:

```javascript
{
  id: "socket.id",
  username: "用户名",
  message: "消息内容",
  timestamp: "2024-01-01T00:00:00.000Z"
}
```

### 9. `typing` - 输入状态

**触发时机**: 用户开始/停止输入时
**发送方**: 前端 → 后端
**数据结构**:

```javascript
{
  username: "用户名",
  isTyping: true // 或 false
}
```

### 10. `user_typing` - 用户输入状态通知

**触发时机**: 有用户开始/停止输入时
**发送方**: 后端 → 前端（广播给其他用户）
**数据结构**:

```javascript
{
  username: "用户名",
  isTyping: true // 或 false
}
```

## 内置事件

### `connect` - 连接成功

**触发时机**: Socket.IO 连接建立时
**发送方**: Socket.IO 客户端

### `disconnect` - 连接断开

**触发时机**: Socket.IO 连接断开时
**发送方**: Socket.IO 客户端

## 测试方法

运行测试脚本验证所有事件：

```bash
node test-socket-events.js
```

## 注意事项

1. **IP 地址获取**: 后端会尝试从多个头部获取真实 IP 地址

   - `x-forwarded-for`
   - `x-real-ip`
   - `cf-connecting-ip`
   - 回退到 `socket.handshake.address`

2. **事件顺序**: 用户连接时的典型事件顺序：

   ```
   connect → your_ip → join → user_joined → online_users → user_count
   ```

3. **错误处理**: 所有事件都有相应的错误处理机制

4. **性能优化**: 生产环境启用了集群模式和心跳检测
