# FullscreenModal 全屏模态框组件

一个功能完整的全屏模态框组件，集成了滚动锁定、拖拽和全屏动画功能。

## 特性

- 🚫 **滚动锁定**: 防止背景滚动穿透
- 🎯 **拖拽支持**: 可选的拖拽功能
- 🎬 **全屏动画**: 流畅的全屏切换动画
- 📱 **触摸支持**: 完整的触摸设备支持
- 🎨 **高度可定制**: 丰富的配置选项
- ♿ **无障碍**: 支持键盘导航和屏幕阅读器

## 安装

```bash
# 组件已内置，无需额外安装
```

## 基本用法

```tsx
import { FullscreenModal } from '@/app/components/fullscreen-modal'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <FullscreenModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="我的模态框"
    >
      <div>模态框内容</div>
    </FullscreenModal>
  )
}
```

## 高级用法

### 启用拖拽功能

```tsx
<FullscreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="可拖拽的模态框"
  draggable={true}
  initialPosition={{ x: 100, y: 100 }}
>
  <div>可拖拽的模态框内容</div>
</FullscreenModal>
```

### 自定义动画

```tsx
<FullscreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="自定义动画"
  animation={{
    duration: 800,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    scale: 0.9,
    translateY: 30,
    opacity: 0.7,
  }}
>
  <div>自定义动画的模态框</div>
</FullscreenModal>
```

### 自定义滚动锁定

```tsx
<FullscreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="自定义滚动锁定"
  scrollLock={{
    enabled: true,
    selector: 'div[data-scrollable], .custom-scroll',
    preserveScrollPosition: false,
  }}
>
  <div>自定义滚动锁定的模态框</div>
</FullscreenModal>
```

### 自定义尺寸

```tsx
<FullscreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="自定义尺寸"
  size={{
    width: 'w-[800px]',
    height: 'h-[700px]',
    maxWidth: 'max-w-[95vw]',
    maxHeight: 'max-h-[90vh]',
  }}
>
  <div>自定义尺寸的模态框</div>
</FullscreenModal>
```

### 添加自定义头部和底部

```tsx
<FullscreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="自定义头部和底部"
  header={
    <div className="p-4 bg-blue-50">
      <h3 className="text-lg font-semibold">自定义头部</h3>
    </div>
  }
  footer={
    <div className="p-4 bg-gray-50">
      <button className="px-4 py-2 bg-blue-600 text-white rounded">确认</button>
    </div>
  }
>
  <div>带有自定义头部和底部的模态框</div>
</FullscreenModal>
```

### 添加自定义操作按钮

```tsx
<FullscreenModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="自定义操作按钮"
  actions={
    <button className="p-2 hover:bg-gray-100 rounded-lg">自定义操作</button>
  }
>
  <div>带有自定义操作按钮的模态框</div>
</FullscreenModal>
```

## API 参考

### Props

| 属性              | 类型                     | 默认值         | 说明           |
| ----------------- | ------------------------ | -------------- | -------------- |
| `isOpen`          | `boolean`                | -              | 是否显示模态框 |
| `onClose`         | `() => void`             | -              | 关闭回调函数   |
| `title`           | `ReactNode`              | -              | 模态框标题     |
| `children`        | `ReactNode`              | -              | 模态框内容     |
| `className`       | `string`                 | `''`           | 自定义样式类名 |
| `header`          | `ReactNode`              | -              | 自定义头部内容 |
| `footer`          | `ReactNode`              | -              | 自定义底部内容 |
| `actions`         | `ReactNode`              | -              | 自定义操作按钮 |
| `draggable`       | `boolean`                | `false`        | 是否启用拖拽   |
| `initialPosition` | `{x: number, y: number}` | `{x: 0, y: 0}` | 拖拽初始位置   |
| `size`            | `SizeConfig`             | 见下方         | 尺寸配置       |
| `animation`       | `AnimationConfig`        | 见下方         | 动画配置       |
| `scrollLock`      | `ScrollLockConfig`       | 见下方         | 滚动锁定配置   |

### SizeConfig

```tsx
interface SizeConfig {
  width?: string // 宽度类名，如 'w-[500px]'
  height?: string // 高度类名，如 'h-[600px]'
  maxWidth?: string // 最大宽度类名，如 'max-w-[90vw]'
  maxHeight?: string // 最大高度类名，如 'max-h-[80vh]'
}
```

### AnimationConfig

```tsx
interface AnimationConfig {
  duration?: number // 动画持续时间（毫秒）
  easing?: string // 缓动函数
  scale?: number // 全屏时的缩放比例
  translateY?: number // 全屏时的Y轴偏移
  opacity?: number // 全屏时的透明度
}
```

### ScrollLockConfig

```tsx
interface ScrollLockConfig {
  enabled?: boolean // 是否启用滚动锁定
  selector?: string // 可滚动元素选择器
  preserveScrollPosition?: boolean // 是否保持滚动位置
}
```

## 内置功能

### 滚动锁定

- 自动防止背景滚动穿透
- 支持触摸设备的滚动锁定
- 智能边界检测，防止过度滚动

### 拖拽功能

- 鼠标和触摸拖拽支持
- 边界限制和边缘吸附
- 流畅的拖拽动画

### 全屏动画

- 平滑的全屏切换动画
- 可自定义的动画参数
- 响应式的动画状态

### 最小化功能

- 支持模态框最小化
- 最小化状态下的快速操作

## 样式定制

组件使用 Tailwind CSS 类名，可以通过 `className` 属性进行样式定制：

```tsx
<FullscreenModal
  className="bg-gray-900 text-white border-gray-700"
  // ... 其他属性
>
  <div>自定义样式的模态框</div>
</FullscreenModal>
```

## 无障碍支持

- 支持键盘导航（Tab、Escape）
- 适当的 ARIA 属性
- 屏幕阅读器友好

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

1. **拖拽功能**: 拖拽时模态框会变为 `position: fixed`，可能影响布局
2. **滚动锁定**: 在某些移动设备上可能需要额外的触摸事件处理
3. **全屏动画**: 动画性能取决于设备的硬件加速支持

## 故障排除

### 拖拽不工作

确保 `draggable={true}` 并且没有其他元素阻止事件传播。

### 滚动锁定失效

检查 `scrollLock.enabled` 设置，确保选择器正确匹配可滚动元素。

### 动画卡顿

尝试调整动画参数，减少 `duration` 或使用更简单的 `easing` 函数。
