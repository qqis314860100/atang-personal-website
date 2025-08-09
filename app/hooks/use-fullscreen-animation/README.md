# useFullscreenAnimation 全屏动画钩子

一个功能完整的 React 钩子，用于管理全屏动画状态和样式。提供流畅的全屏切换动画，支持自定义动画参数和样式。

## 特性

- 🎬 **流畅动画**: 平滑的全屏切换动画
- 🎨 **自定义样式**: 可配置的动画参数
- 📱 **响应式支持**: 自动适应不同屏幕尺寸
- 🎭 **状态管理**: 完整的全屏状态管理
- 🔧 **灵活配置**: 丰富的动画选项
- ⚡ **性能优化**: 优化的动画性能

## 安装

```bash
# 钩子已内置，无需额外安装
```

## 基本用法

```tsx
import { useFullscreenAnimation } from '@/app/hooks/use-fullscreen-animation'

function FullscreenComponent() {
  const { isFullscreen, toggleFullscreen, animationStyles } =
    useFullscreenAnimation()

  return (
    <div
      className={`transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
      style={animationStyles}
    >
      <button onClick={toggleFullscreen}>
        {isFullscreen ? '退出全屏' : '进入全屏'}
      </button>
    </div>
  )
}
```

## 高级用法

### 自定义动画参数

```tsx
const { isFullscreen, toggleFullscreen, animationStyles } =
  useFullscreenAnimation({
    duration: 500,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    scale: 0.8,
    translateY: 20,
    opacity: 0.8,
  })
```

### 自定义变换原点

```tsx
const { isFullscreen, toggleFullscreen, animationStyles } =
  useFullscreenAnimation({
    transformOrigin: 'center center',
  })
```

### 手动控制全屏状态

```tsx
const { isFullscreen, setFullscreen, animationStyles } =
  useFullscreenAnimation()

const enterFullscreen = () => setFullscreen(true)
const exitFullscreen = () => setFullscreen(false)

return (
  <div>
    <button onClick={enterFullscreen}>进入全屏</button>
    <button onClick={exitFullscreen}>退出全屏</button>
    <div style={animationStyles}>内容区域</div>
  </div>
)
```

### 获取动画类名

```tsx
const { isFullscreen, animationClasses, fullscreenClasses } =
  useFullscreenAnimation()

return (
  <div className={`${animationClasses} ${fullscreenClasses}`}>
    使用预定义类名的内容
  </div>
)
```

## API 参考

### 参数

| 属性              | 类型     | 默认值            | 说明                 |
| ----------------- | -------- | ----------------- | -------------------- |
| `duration`        | `number` | `300`             | 动画持续时间（毫秒） |
| `easing`          | `string` | `'ease-in-out'`   | 动画缓动函数         |
| `scale`           | `number` | `1`               | 缩放比例             |
| `translateY`      | `number` | `0`               | Y 轴平移距离         |
| `opacity`         | `number` | `1`               | 透明度               |
| `transformOrigin` | `string` | `'center center'` | 变换原点             |

### 返回值

| 属性                       | 类型                                     | 说明                   |
| -------------------------- | ---------------------------------------- | ---------------------- |
| `isFullscreen`             | `boolean`                                | 当前是否全屏           |
| `isAnimating`              | `boolean`                                | 是否正在动画中         |
| `toggleFullscreen`         | `() => void`                             | 切换全屏状态           |
| `setFullscreen`            | `(fullscreen: boolean) => void`          | 设置全屏状态           |
| `animationStyles`          | `CSSProperties`                          | 动画样式对象           |
| `animationClasses`         | `string`                                 | 动画相关的 CSS 类名    |
| `fullscreenClasses`        | `string`                                 | 全屏状态的 CSS 类名    |
| `transitionDuration`       | `string`                                 | 过渡持续时间字符串     |
| `transitionEasing`         | `string`                                 | 过渡缓动函数字符串     |
| `transformOrigin`          | `string`                                 | 变换原点字符串         |
| `getAnimationStyles`       | `(fullscreen: boolean) => CSSProperties` | 获取指定状态的动画样式 |
| `getSizeClasses`           | `(fullscreen: boolean) => string`        | 获取指定状态的尺寸类名 |
| `getAnimationStateClasses` | `(fullscreen: boolean) => string`        | 获取指定状态的动画类名 |

## 使用示例

### 基础全屏切换

```tsx
function BasicFullscreen() {
  const { isFullscreen, toggleFullscreen, animationStyles } =
    useFullscreenAnimation()

  return (
    <div
      className="bg-blue-500 text-white p-8 rounded-lg cursor-pointer"
      style={animationStyles}
      onClick={toggleFullscreen}
    >
      <h2 className="text-2xl font-bold mb-4">
        {isFullscreen ? '全屏模式' : '普通模式'}
      </h2>
      <p>点击切换全屏状态</p>
    </div>
  )
}
```

### 卡片全屏展开

```tsx
function CardFullscreen() {
  const { isFullscreen, toggleFullscreen, animationStyles } =
    useFullscreenAnimation({
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      scale: 0.9,
      translateY: 10,
      opacity: 0.9,
    })

  return (
    <div
      className={`
        bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer
        transition-all duration-400
        ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative max-w-sm'}
      `}
      style={animationStyles}
      onClick={toggleFullscreen}
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">卡片标题</h3>
        <p className="text-gray-600">
          {isFullscreen
            ? '这是全屏模式下的详细内容，可以显示更多信息...'
            : '点击展开查看详情'}
        </p>
      </div>
    </div>
  )
}
```

### 图片全屏查看

```tsx
function ImageFullscreen() {
  const { isFullscreen, toggleFullscreen, animationStyles } =
    useFullscreenAnimation({
      duration: 300,
      easing: 'ease-out',
      scale: 0.8,
      opacity: 0.8,
    })

  return (
    <div
      className={`
        relative cursor-pointer overflow-hidden
        ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-64 h-48 rounded-lg'}
      `}
      style={animationStyles}
      onClick={toggleFullscreen}
    >
      <img
        src="/example-image.jpg"
        alt="示例图片"
        className={`
          w-full h-full object-cover
          ${isFullscreen ? 'object-contain' : 'object-cover'}
        `}
      />
      {isFullscreen && (
        <div className="absolute top-4 right-4 text-white text-2xl">✕</div>
      )}
    </div>
  )
}
```

### 模态框全屏

```tsx
function ModalFullscreen() {
  const [isOpen, setIsOpen] = useState(false)
  const { isFullscreen, toggleFullscreen, animationStyles } =
    useFullscreenAnimation({
      duration: 500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      scale: 0.7,
      translateY: 30,
      opacity: 0.7,
    })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setIsOpen(false)}
      />
      <div
        className={`
          bg-white rounded-lg shadow-2xl relative z-10
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-96 max-h-96'}
        `}
        style={animationStyles}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">模态框标题</h2>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {isFullscreen ? '缩小' : '全屏'}
            </button>
          </div>
          <p>模态框内容...</p>
        </div>
      </div>
    </div>
  )
}
```

### 响应式全屏

```tsx
function ResponsiveFullscreen() {
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

  const { isFullscreen, toggleFullscreen, animationStyles } =
    useFullscreenAnimation({
      duration: 400,
      scale: windowSize.width < 768 ? 0.9 : 0.8,
      translateY: windowSize.width < 768 ? 15 : 25,
    })

  return (
    <div
      className={`
        bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl
        cursor-pointer transition-all duration-400
        ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative max-w-md'
        }
      `}
      style={animationStyles}
      onClick={toggleFullscreen}
    >
      <h2 className="text-2xl font-bold mb-3">响应式全屏</h2>
      <p className="text-purple-100">
        屏幕尺寸: {windowSize.width} x {windowSize.height}
      </p>
    </div>
  )
}
```

## 内置功能

### 动画状态管理

- **全屏状态**: 自动管理全屏状态
- **动画状态**: 跟踪动画进行状态
- **状态切换**: 平滑的状态切换

### 样式计算

- **动态样式**: 根据状态计算样式
- **CSS 属性**: 自动生成 CSS 属性
- **类名管理**: 提供预定义的 CSS 类名

### 动画配置

- **持续时间**: 可配置的动画时长
- **缓动函数**: 自定义的缓动效果
- **变换参数**: 灵活的变换选项

## 样式集成

### Tailwind CSS

```tsx
const { isFullscreen, animationStyles, fullscreenClasses } =
  useFullscreenAnimation()

return (
  <div
    className={`
      bg-blue-500 text-white p-6 rounded-lg shadow-lg
      transition-all duration-300 ease-in-out
      ${fullscreenClasses}
    `}
    style={animationStyles}
  >
    内容区域
  </div>
)
```

### CSS Modules

```tsx
import styles from './Fullscreen.module.css'

const { isFullscreen, animationStyles } = useFullscreenAnimation()

return (
  <div
    className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''}`}
    style={animationStyles}
  >
    内容区域
  </div>
)
```

### 内联样式

```tsx
const { isFullscreen, animationStyles } = useFullscreenAnimation()

const customStyles = {
  ...animationStyles,
  backgroundColor: isFullscreen ? '#1f2937' : '#3b82f6',
  color: 'white',
}

return <div style={customStyles}>自定义样式内容</div>
```

## 注意事项

1. **性能**: 大量元素使用全屏动画时注意性能
2. **层级**: 全屏元素应该有适当的 z-index
3. **响应式**: 考虑不同屏幕尺寸的动画效果
4. **无障碍**: 确保全屏状态对屏幕阅读器友好

## 故障排除

### 动画不流畅

- 检查动画持续时间设置
- 验证缓动函数是否正确
- 确保没有 CSS 冲突

### 全屏状态不正确

- 检查状态管理逻辑
- 验证事件处理器绑定
- 确保状态更新时机正确

### 样式问题

- 检查 CSS 类名是否正确应用
- 验证内联样式优先级
- 确保没有样式覆盖

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器完全支持
