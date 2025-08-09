# useDraggable 拖拽钩子

一个功能完整的 React 钩子，用于为任何元素添加拖拽功能。支持鼠标和触摸拖拽，具有边界限制、边缘吸附和流畅动画。

## 特性

- 🖱️ **鼠标拖拽**: 完整的鼠标拖拽支持
- 📱 **触摸拖拽**: 移动设备触摸拖拽
- 🎯 **边界限制**: 可配置的拖拽边界
- 🔗 **边缘吸附**: 智能边缘吸附功能
- 🎨 **流畅动画**: 平滑的拖拽动画
- 🎭 **状态管理**: 完整的拖拽状态管理

## 安装

```bash
# 钩子已内置，无需额外安装
```

## 基本用法

```tsx
import { useDraggable } from '@/app/hooks/use-draggable'

function DraggableBox() {
  const { position, isDragging, handlers } = useDraggable()

  return (
    <div
      className="w-32 h-32 bg-blue-500 cursor-move"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
      {...handlers}
    >
      拖拽我
    </div>
  )
}
```

## 高级用法

### 自定义初始位置

```tsx
const { position, isDragging, handlers } = useDraggable({
  initialPosition: { x: 100, y: 200 },
})
```

### 边界限制

```tsx
const { position, isDragging, handlers } = useDraggable({
  bounds: {
    minX: 0,
    maxX: 500,
    minY: 0,
    maxY: 400,
  },
})
```

### 边缘吸附

```tsx
const { position, isDragging, handlers } = useDraggable({
  snapToEdges: true, // 默认启用
  snapThreshold: 50, // 吸附阈值
})
```

### 拖拽事件回调

```tsx
const { position, isDragging, handlers } = useDraggable({
  onDragStart: () => console.log('开始拖拽'),
  onDrag: (pos) => console.log('拖拽中:', pos),
  onDragEnd: (pos) => console.log('拖拽结束:', pos),
})
```

### 自定义拖拽区域

```tsx
const { position, isDragging, handlers } = useDraggable({
  dragHandle: '.drag-handle', // 只允许拖拽特定区域
})
```

## API 参考

### 参数

| 属性              | 类型                           | 默认值         | 说明             |
| ----------------- | ------------------------------ | -------------- | ---------------- |
| `initialPosition` | `Position`                     | `{x: 0, y: 0}` | 初始位置         |
| `bounds`          | `BoundsConfig`                 | -              | 拖拽边界限制     |
| `snapToEdges`     | `boolean`                      | `true`         | 是否启用边缘吸附 |
| `snapThreshold`   | `number`                       | `50`           | 边缘吸附阈值     |
| `dragHandle`      | `string`                       | -              | 拖拽句柄选择器   |
| `onDragStart`     | `() => void`                   | -              | 拖拽开始回调     |
| `onDrag`          | `(position: Position) => void` | -              | 拖拽中回调       |
| `onDragEnd`       | `(position: Position) => void` | -              | 拖拽结束回调     |

### 返回值

| 属性            | 类型                      | 说明           |
| --------------- | ------------------------- | -------------- |
| `position`      | `Position`                | 当前拖拽位置   |
| `isDragging`    | `boolean`                 | 是否正在拖拽   |
| `mounted`       | `boolean`                 | 组件是否已挂载 |
| `setPosition`   | `(pos: Position) => void` | 手动设置位置   |
| `resetPosition` | `() => void`              | 重置到初始位置 |
| `handlers`      | `DragHandlers`            | 拖拽事件处理器 |

### 类型定义

```tsx
interface Position {
  x: number
  y: number
}

interface BoundsConfig {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
}

interface DragHandlers {
  onMouseDown: (e: React.MouseEvent) => void
  onTouchStart: (e: React.TouchEvent) => void
}
```

## 使用示例

### 基础拖拽元素

```tsx
function BasicDraggable() {
  const { position, handlers } = useDraggable()

  return (
    <div
      className="absolute w-24 h-24 bg-red-500 cursor-move rounded-lg"
      style={{ left: position.x, top: position.y }}
      {...handlers}
    >
      基础拖拽
    </div>
  )
}
```

### 带边界的拖拽

```tsx
function BoundedDraggable() {
  const { position, handlers } = useDraggable({
    bounds: {
      minX: 0,
      maxX: window.innerWidth - 96, // 96 = 24 * 4 (w-24)
      minY: 0,
      maxY: window.innerHeight - 96,
    },
  })

  return (
    <div
      className="absolute w-24 h-24 bg-green-500 cursor-move rounded-lg"
      style={{ left: position.x, top: position.y }}
      {...handlers}
    >
      边界拖拽
    </div>
  )
}
```

### 拖拽句柄

```tsx
function HandleDraggable() {
  const { position, handlers } = useDraggable({
    dragHandle: '.drag-handle',
  })

  return (
    <div
      className="absolute w-32 h-32 bg-blue-500 rounded-lg"
      style={{ left: position.x, top: position.y }}
    >
      <div className="drag-handle h-8 bg-blue-700 cursor-move rounded-t-lg flex items-center justify-center text-white">
        拖拽这里
      </div>
      <div className="p-2 text-white">内容区域</div>
      {...handlers}
    </div>
  )
}
```

### 响应式拖拽

```tsx
function ResponsiveDraggable() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { position, handlers } = useDraggable({
    bounds: {
      minX: 0,
      maxX: windowSize.width - 96,
      minY: 0,
      maxY: windowSize.height - 96,
    },
  })

  return (
    <div
      className="absolute w-24 h-24 bg-purple-500 cursor-move rounded-lg"
      style={{ left: position.x, top: position.y }}
      {...handlers}
    >
      响应式拖拽
    </div>
  )
}
```

### 拖拽状态指示

```tsx
function StatefulDraggable() {
  const { position, isDragging, handlers } = useDraggable()

  return (
    <div
      className={`absolute w-24 h-24 cursor-move rounded-lg transition-all duration-200 ${
        isDragging
          ? 'bg-red-600 scale-110 shadow-2xl'
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      style={{ left: position.x, top: position.y }}
      {...handlers}
    >
      {isDragging ? '拖拽中...' : '拖拽我'}
    </div>
  )
}
```

## 内置功能

### 拖拽检测

- **鼠标拖拽**: 左键拖拽检测
- **触摸拖拽**: 单指触摸拖拽
- **拖拽开始**: 精确的拖拽开始检测
- **拖拽结束**: 拖拽状态自动重置

### 边界处理

- **边界检测**: 实时边界限制
- **边界计算**: 基于元素尺寸的边界
- **响应式边界**: 窗口大小变化时自动调整

### 边缘吸附

- **智能吸附**: 拖拽结束后自动吸附
- **中心线计算**: 基于屏幕中心线的吸附方向
- **平滑过渡**: 吸附过程的动画效果

### 性能优化

- **requestAnimationFrame**: 流畅的拖拽动画
- **事件节流**: 拖拽过程中的性能优化
- **内存管理**: 自动清理事件监听器

## 样式集成

### Tailwind CSS

```tsx
const { position, isDragging, handlers } = useDraggable()

return (
  <div
    className={`
      absolute w-24 h-24 cursor-move rounded-lg shadow-lg
      transition-all duration-200 ease-out
      ${
        isDragging
          ? 'bg-red-500 scale-105 shadow-2xl'
          : 'bg-blue-500 hover:bg-blue-600'
      }
    `}
    style={{ left: position.x, top: position.y }}
    {...handlers}
  >
    拖拽元素
  </div>
)
```

### CSS Modules

```tsx
import styles from './Draggable.module.css'

const { position, isDragging, handlers } = useDraggable()

return (
  <div
    className={`${styles.draggable} ${isDragging ? styles.dragging : ''}`}
    style={{ left: position.x, top: position.y }}
    {...handlers}
  >
    拖拽元素
  </div>
)
```

## 注意事项

1. **定位**: 确保父容器使用相对定位
2. **层级**: 拖拽元素应该有适当的 z-index
3. **触摸**: 触摸设备上需要阻止默认行为
4. **性能**: 大量拖拽元素时考虑虚拟化

## 故障排除

### 拖拽不工作

- 检查事件处理器是否正确绑定
- 验证元素是否有正确的定位样式
- 确保没有其他事件阻止拖拽

### 位置不正确

- 检查父容器的定位方式
- 验证边界设置是否合理
- 确保初始位置在边界内

### 触摸问题

- 移动设备上测试触摸拖拽
- 检查触摸事件是否正确处理
- 验证 preventDefault 的使用

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器完全支持
