# DraggableButton 可拖拽按钮组件

一个功能完整的可拖拽浮动按钮组件，支持鼠标和触摸拖拽，具有边界限制和边缘吸附功能。

## 特性

- 🖱️ **鼠标拖拽**: 支持鼠标拖拽操作
- 📱 **触摸拖拽**: 完整的触摸设备支持
- 🎯 **边界限制**: 自动限制在视窗范围内
- 🔗 **边缘吸附**: 拖拽结束后自动吸附到左右边缘
- 🎨 **流畅动画**: 平滑的拖拽和悬停动画
- 🎭 **视觉反馈**: 拖拽状态下的视觉变化

## 安装

```bash
# 组件已内置，无需额外安装
```

## 基本用法

```tsx
import { DraggableButton } from '@/app/components/draggable-button'

function MyComponent() {
  const handleClick = () => {
    console.log('按钮被点击了！')
  }

  return (
    <DraggableButton onClick={handleClick}>
      <span>点击我</span>
    </DraggableButton>
  )
}
```

## 高级用法

### 自定义初始位置

```tsx
<DraggableButton
  initialPosition={{ x: 200, y: 300 }}
  onClick={() => console.log('自定义位置按钮')}
>
  <span>自定义位置</span>
</DraggableButton>
```

### 自定义边界限制

```tsx
<DraggableButton
  initialPosition={{ x: 100, y: 100 }}
  bounds={{
    minX: 50,
    maxX: 500,
    minY: 50,
    maxY: 400,
  }}
  onClick={() => console.log('边界限制按钮')}
>
  <span>边界限制</span>
</DraggableButton>
```

### 禁用边缘吸附

```tsx
<DraggableButton snapToEdges={false} onClick={() => console.log('无吸附按钮')}>
  <span>无吸附</span>
</DraggableButton>
```

### 拖拽事件回调

```tsx
<DraggableButton
  onDragStart={() => console.log('开始拖拽')}
  onDrag={(position) => console.log('拖拽中:', position)}
  onDragEnd={(position) => console.log('拖拽结束:', position)}
  onClick={() => console.log('拖拽事件按钮')}
>
  <span>拖拽事件</span>
</DraggableButton>
```

### 自定义样式

```tsx
<DraggableButton
  className="bg-red-600 hover:bg-red-700 w-20 h-20"
  onClick={() => console.log('自定义样式按钮')}
>
  <span>自定义样式</span>
</DraggableButton>
```

## API 参考

### Props

| 属性              | 类型                           | 默认值         | 说明             |
| ----------------- | ------------------------------ | -------------- | ---------------- |
| `children`        | `ReactNode`                    | -              | 按钮内容         |
| `onClick`         | `() => void`                   | -              | 点击回调函数     |
| `className`       | `string`                       | `''`           | 自定义样式类名   |
| `initialPosition` | `{x: number, y: number}`       | `{x: 0, y: 0}` | 初始位置         |
| `bounds`          | `BoundsConfig`                 | -              | 拖拽边界限制     |
| `snapToEdges`     | `boolean`                      | `true`         | 是否启用边缘吸附 |
| `onDragStart`     | `() => void`                   | -              | 拖拽开始回调     |
| `onDrag`          | `(position: Position) => void` | -              | 拖拽中回调       |
| `onDragEnd`       | `(position: Position) => void` | -              | 拖拽结束回调     |

### BoundsConfig

```tsx
interface BoundsConfig {
  minX?: number // 最小X坐标
  maxX?: number // 最大X坐标
  minY?: number // 最小Y坐标
  maxY?: number // 最大Y坐标
}
```

### Position

```tsx
interface Position {
  x: number // X坐标
  y: number // Y坐标
}
```

## 内置功能

### 拖拽功能

- **鼠标拖拽**: 支持鼠标左键拖拽
- **触摸拖拽**: 支持单指触摸拖拽
- **边界检测**: 自动检测拖拽边界
- **位置更新**: 实时更新按钮位置

### 边缘吸附

- **智能吸附**: 拖拽结束后自动吸附到左右边缘
- **中心线计算**: 基于屏幕中心线决定吸附方向
- **平滑过渡**: 吸附过程使用平滑动画

### 视觉反馈

- **拖拽状态**: 拖拽时显示不同的视觉效果
- **悬停效果**: 鼠标悬停时的动画效果
- **脉冲动画**: 内置的脉冲背景动画

## 样式定制

组件使用 Tailwind CSS 类名，可以通过 `className` 属性进行样式定制：

```tsx
<DraggableButton
  className="bg-green-600 hover:bg-green-700 w-20 h-20 rounded-lg"
  onClick={() => console.log('绿色方形按钮')}
>
  <span>绿色方形</span>
</DraggableButton>
```

### 默认样式

组件默认使用以下样式：

- `fixed z-50`: 固定定位，高层级
- `bg-gradient-to-r from-blue-600 to-purple-600`: 蓝紫渐变背景
- `rounded-full`: 圆形按钮
- `w-16 h-16`: 64x64 像素尺寸
- `shadow-2xl`: 大阴影效果

## 使用场景

### 浮动操作按钮

```tsx
<DraggableButton
  initialPosition={{ x: window.innerWidth - 100, y: window.innerHeight - 100 }}
  onClick={() => setShowModal(true)}
>
  <Plus className="w-8 h-8" />
</DraggableButton>
```

### 可拖拽的聊天按钮

```tsx
<DraggableButton
  initialPosition={{ x: 20, y: window.innerHeight - 100 }}
  onClick={() => setChatOpen(true)}
>
  <MessageCircle className="w-8 h-8" />
</DraggableButton>
```

### 可拖拽的帮助按钮

```tsx
<DraggableButton
  initialPosition={{ x: window.innerWidth - 100, y: 100 }}
  onClick={() => setHelpOpen(true)}
>
  <HelpCircle className="w-8 h-8" />
</DraggableButton>
```

## 注意事项

1. **定位**: 组件使用 `position: fixed`，确保在正确的容器中使用
2. **层级**: 默认 `z-50`，可根据需要调整
3. **边界**: 边界限制基于视窗尺寸，响应式调整
4. **触摸**: 触摸拖拽在移动设备上表现最佳

## 故障排除

### 拖拽不工作

- 确保没有其他元素阻止事件传播
- 检查 `onClick` 是否正确设置
- 验证触摸设备上的触摸事件支持

### 位置不正确

- 检查 `initialPosition` 是否在视窗范围内
- 验证 `bounds` 设置是否合理
- 确保没有 CSS 样式冲突

### 样式问题

- 使用 `className` 覆盖默认样式
- 检查 Tailwind CSS 是否正确加载
- 验证自定义样式优先级

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器完全支持
