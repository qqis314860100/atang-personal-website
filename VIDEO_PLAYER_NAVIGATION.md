# 视频播放器导航功能实现

## 功能概述

将视频管理系统中的视频列表与视频播放器页面进行集成，用户可以通过点击视频卡片或预览模态框中的按钮跳转到视频播放器页面进行观看。

## 主要修改

### 1. 视频播放器页面优化 (`app/[locale]/project/(feature)/video-player/page.tsx`)

- **URL 参数支持**：添加了 `searchParams` 参数，支持从 URL 获取视频 ID
- **组件参数传递**：将 `videoId` 传递给所有子组件
- **接口定义**：添加了 `VideoPlayerPageProps` 接口

```typescript
interface VideoPlayerPageProps {
  searchParams: {
    id?: string
  }
}
```

### 2. 视频信息组件增强 (`app/[locale]/project/(feature)/video-player/components/VideoInfo.tsx`)

- **动态数据加载**：使用 `useVideo` hook 获取视频数据
- **加载状态**：添加了骨架屏加载效果
- **错误处理**：添加了错误状态显示
- **完整信息展示**：
  - 视频标题和描述
  - 播放量、弹幕数、点赞数、点踩数
  - 视频时长
  - 分类和标签
  - 上传者信息和上传时间

### 3. 视频管理列表优化 (`app/[locale]/project/(feature)/video-manage/components/VideoManagerClient.tsx`)

- **点击跳转**：整个视频卡片可点击跳转到播放器
- **操作按钮**：
  - 预览按钮（绿色眼睛图标）
  - 编辑按钮（蓝色编辑图标）
  - 删除按钮（红色删除图标）
- **事件处理**：使用 `e.stopPropagation()` 防止事件冒泡
- **悬停效果**：添加了播放按钮的悬停效果

### 4. 预览模态框增强 (`app/[locale]/project/(feature)/video-manage/components/VideoPreviewModal.tsx`)

- **播放按钮**：将关闭按钮改为播放按钮
- **跳转功能**：点击播放按钮跳转到视频播放器页面
- **自动关闭**：跳转后自动关闭模态框

## 用户体验改进

### 1. 多种访问方式

- **卡片点击**：直接点击视频卡片跳转到播放器
- **悬停播放**：鼠标悬停时显示播放按钮
- **预览播放**：在预览模态框中点击播放按钮

### 2. 视觉反馈

- **鼠标指针**：卡片添加 `cursor-pointer` 样式
- **悬停效果**：卡片和按钮都有悬停动画
- **工具提示**：操作按钮添加了 `title` 属性

### 3. 操作区分

- **预览功能**：快速查看视频信息
- **播放功能**：跳转到完整的播放器页面
- **编辑功能**：修改视频信息
- **删除功能**：移除视频

## 技术实现

### 1. 路由跳转

```typescript
const handleViewVideo = (videoId: string) => {
  router.push(`/project/video-player?id=${videoId}`)
}
```

### 2. 事件处理

```typescript
onClick={(e) => {
  e.stopPropagation()
  handleViewVideo(video.id)
}}
```

### 3. 数据获取

```typescript
const { data: video, isLoading, error } = useVideo(videoId)
```

## 文件结构

```
app/[locale]/project/(feature)/
├── video-manage/
│   └── components/
│       ├── VideoManagerClient.tsx    # 主管理组件（已修改）
│       └── VideoPreviewModal.tsx    # 预览模态框（已修改）
└── video-player/
    ├── page.tsx                     # 播放器页面（已修改）
    └── components/
        ├── VideoInfo.tsx            # 视频信息组件（已修改）
        ├── VideoComments.tsx        # 评论组件（已修改）
        └── DanmakuList.tsx          # 弹幕列表（已支持）
```

## 使用流程

1. **视频管理页面**：

   - 用户查看视频列表
   - 点击视频卡片或悬停播放按钮

2. **跳转到播放器**：

   - URL 变为 `/project/video-player?id=video-id`
   - 播放器页面加载对应视频

3. **播放器页面**：
   - 显示视频播放器
   - 显示视频详细信息
   - 显示弹幕列表
   - 显示评论区域

## 后续改进建议

1. **URL 优化**：使用更友好的 URL 格式，如 `/video/video-id`
2. **历史记录**：添加浏览历史功能
3. **推荐视频**：在播放器页面显示相关视频推荐
4. **播放列表**：支持播放列表功能
5. **快捷键**：添加键盘快捷键支持
6. **移动端优化**：进一步优化移动端体验
