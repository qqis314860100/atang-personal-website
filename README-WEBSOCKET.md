# WebSocket 实时通信功能

## 🚀 功能概述

本项目已成功实现 WebSocket 实时通信功能，包括：

- **实时聊天室**: 支持多用户实时聊天
- **在线用户统计**: 实时显示在线用户数量
- **输入状态提示**: 显示谁正在输入
- **连接状态监控**: 实时显示 WebSocket 连接状态

## 📋 技术栈

- **Socket.IO**: 实时通信库
- **Next.js**: 前端框架
- **React Hooks**: 状态管理
- **TypeScript**: 类型安全

## 🛠️ 安装和启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
# 方式一：使用启动脚本（推荐）
npm run dev:full

# 方式二：分别启动
npm run socket    # 启动 Socket.IO 服务器
npm run dev       # 启动 Next.js 开发服务器
```

### 3. 访问应用

- **主应用**: http://localhost:3000
- **项目页面**: http://localhost:3000/zh/project
- **测试页面**: http://localhost:3000/test-socket

## 🎯 功能特性

### 聊天室功能

- ✅ 实时消息发送和接收
- ✅ 在线用户统计
- ✅ 输入状态提示
- ✅ 连接状态指示器
- ✅ 自动重连机制
- ✅ 用户加入/离开通知

### 在线访客统计

- ✅ 实时在线用户数量
- ✅ 连接状态显示
- ✅ 自动更新

## 📁 文件结构

```
├── server/
│   └── socket-server.js          # Socket.IO 服务器
├── lib/hooks/
│   └── use-socket.ts            # WebSocket Hook
├── components/project/
│   ├── chat-room.tsx            # 聊天室组件
│   └── online-visitors.tsx      # 在线访客组件
├── app/test-socket/
│   └── page.tsx                 # 测试页面
└── scripts/
    └── start-dev.js             # 开发环境启动脚本
```

## 🔧 配置说明

### 环境变量

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SOCKET_PORT=3001
```

### 端口配置

- **Next.js**: 3000
- **Socket.IO**: 3001

## 🧪 测试方法

### 1. 基本连接测试

访问 http://localhost:3000/test-socket 查看：

- WebSocket 连接状态
- 在线用户数量
- 消息发送/接收

### 2. 多用户测试

1. 打开多个浏览器窗口
2. 访问 http://localhost:3000/zh/project
3. 点击右下角的聊天室按钮
4. 发送消息测试实时通信

### 3. 连接状态测试

- 断开网络连接，观察连接状态变化
- 重新连接网络，观察自动重连

## 🚨 故障排除

### 常见问题

1. **Socket 服务器无法启动**

   ```bash
   # 检查端口是否被占用
   netstat -an | findstr :3001

   # 手动启动 Socket 服务器
   node server/socket-server.js
   ```

2. **WebSocket 连接失败**

   - 确保 Socket 服务器正在运行
   - 检查防火墙设置
   - 验证 CORS 配置

3. **消息无法发送**
   - 检查连接状态
   - 查看浏览器控制台错误
   - 验证 Socket.IO 客户端版本

### 调试技巧

1. **查看服务器日志**

   ```bash
   # Socket 服务器日志
   node server/socket-server.js
   ```

2. **浏览器开发者工具**

   - 打开 Network 标签
   - 查看 WebSocket 连接
   - 检查 Console 错误

3. **测试连接**
   ```javascript
   // 在浏览器控制台测试
   const socket = io('http://localhost:3001')
   socket.on('connect', () => console.log('已连接'))
   ```

## 🔄 下一步优化

### 计划功能

- [ ] 消息持久化到数据库
- [ ] 用户认证和身份管理
- [ ] 多房间支持
- [ ] 文件上传功能
- [ ] 表情符号支持
- [ ] 消息搜索功能
- [ ] 消息通知
- [ ] 在线状态管理

### 性能优化

- [ ] 消息分页加载
- [ ] 连接池优化
- [ ] 消息压缩
- [ ] 断线重连优化

## 📞 技术支持

如果遇到问题，请检查：

1. 服务器是否正常运行
2. 端口是否被占用
3. 网络连接是否正常
4. 浏览器控制台是否有错误

---

**🎉 恭喜！WebSocket 实时通信功能已成功实现！**
