# 🎬 在线视频播放器

https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
一个功能完整的在线视频播放器，支持弹幕功能，类似 B 站的视频播放体验。

## ✨ 主要功能

### 🎥 视频播放控制

- ✅ 播放/暂停控制
- ✅ 音量调节和静音
- ✅ 进度条拖拽跳转
- ✅ 全屏模式
- ✅ 键盘快捷键支持
- ✅ 自动隐藏控制栏

### 💬 弹幕系统

- ✅ 实时弹幕发送
- ✅ 弹幕动画效果
- ✅ 随机弹幕颜色
- ✅ 弹幕密度控制
- ✅ 弹幕类型选择（滚动/顶部/底部）

### 🎨 用户界面

- ✅ 现代化 UI 设计
- ✅ 响应式布局
- ✅ 视频信息展示
- ✅ 评论系统
- ✅ 相关视频推荐

## 🚀 快速开始

### 访问地址

```
http://localhost:3002/zh/video-player
```

### 测试页面

```
http://localhost:3002/zh/video-player/test
```

## 🎮 使用说明

### 基本操作

- **播放/暂停**: 点击播放按钮或按空格键
- **音量控制**: 使用音量滑块调节
- **进度跳转**: 拖拽进度条到指定时间
- **全屏模式**: 点击全屏按钮
- **弹幕发送**: 点击弹幕按钮，输入内容后发送

### 键盘快捷键

- `空格键`: 播放/暂停
- `F`: 全屏切换
- `M`: 静音切换
- `←/→`: 快退/快进（5 秒）

## 📁 文件结构

```
app/[locale]/video-player/
├── page.tsx                    # 主页面
├── test/page.tsx              # 测试页面
├── components/
│   ├── VideoPlayer.tsx        # 主视频播放器
│   ├── Danmaku.tsx           # 弹幕组件
│   ├── VideoInfo.tsx         # 视频信息
│   ├── VideoComments.tsx     # 评论系统
│   ├── RelatedVideos.tsx     # 相关视频
│   ├── video-player.css      # 样式文件
│   └── README.md             # 说明文档
```

## 🎯 核心组件

### VideoPlayer

主要的视频播放器组件，包含：

- 视频播放控制
- 弹幕系统集成
- 用户交互处理
- 响应式设计

### Danmaku

弹幕渲染组件，支持：

- 弹幕动画效果
- 多种弹幕类型
- 性能优化
- 内存管理

### VideoInfo

视频信息展示，包含：

- 视频标题和描述
- 点赞/点踩功能
- 分享和下载
- 作者信息

### VideoComments

评论系统，支持：

- 发表评论
- 回复功能
- 点赞系统
- 嵌套评论

## 🎨 样式特性

### 弹幕动画

```css
@keyframes danmaku-scroll {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(-100%);
  }
}
```

### 响应式设计

- 移动端优化
- 平板适配
- 桌面端体验

### 主题支持

- 深色模式兼容
- 自定义颜色
- 动画效果

## 🔧 技术栈

- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS
- **组件**: Radix UI
- **图标**: Lucide React
- **动画**: CSS Animations
- **类型**: TypeScript

## 🚀 部署说明

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm start
```

## 📱 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎯 性能优化

- 弹幕元素复用
- 内存泄漏防护
- 动画性能优化
- 懒加载支持

## 🔮 未来计划

- [ ] 弹幕过滤系统
- [ ] 视频质量切换
- [ ] 播放速度控制
- [ ] 弹幕高级设置
- [ ] 视频下载功能
- [ ] 字幕支持
- [ ] 画中画模式
- [ ] 弹幕历史记录

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## �� 许可证

MIT License
