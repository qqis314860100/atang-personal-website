# useScrollLock 滚动锁定钩子

一个功能完整的 React 钩子，用于防止页面滚动穿透。支持锁定 body 滚动和特定元素的滚动，具有智能边界检测和滚动位置保持功能。

## 特性

- 🚫 **滚动锁定**: 防止背景滚动穿透
- 🎯 **智能检测**: 自动检测可滚动元素
- 📍 **位置保持**: 保持滚动位置不丢失
- 🔧 **灵活配置**: 支持多种锁定策略
- 📱 **触摸支持**: 完整的移动设备支持
- ⚡ **性能优化**: 优化的滚动处理逻辑

## 安装

```bash
# 钩子已内置，无需额外安装
```

## 基本用法

```tsx
import { useScrollLock } from '@/app/hooks/use-scroll-lock'

function Modal() {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock({ enabled: isOpen })

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <button onClick={() => setIsOpen(false)}>关闭</button>
    </div>
  )
}
```

## 高级用法

### 锁定特定元素

```tsx
useScrollLock({
  enabled: true,
  selector: 'div, section, article',
  preserveScrollPosition: true,
})
```

### 自定义滚动锁定策略

```tsx
useScrollLock({
  enabled: true,
  selector: '.scrollable-content',
  preserveScrollPosition: false,
  lockStrategy: 'strict', // 严格锁定模式
})
```

### 条件性滚动锁定

```tsx
const [isModalOpen, setIsModalOpen] = useState(false)
const [isSidebarOpen, setIsSidebarOpen] = useState(false)

// 只在模态框打开时锁定滚动
useScrollLock({ enabled: isModalOpen })

// 或者同时考虑多个条件
useScrollLock({ enabled: isModalOpen || isSidebarOpen })
```

### 动态选择器

```tsx
const [activeSection, setActiveSection] = useState('main')

useScrollLock({
  enabled: true,
  selector: `#${activeSection}, .${activeSection}-content`,
  preserveScrollPosition: true,
})
```

## API 参考

### 参数

| 属性                     | 类型                     | 默认值       | 说明               |
| ------------------------ | ------------------------ | ------------ | ------------------ |
| `enabled`                | `boolean`                | `false`      | 是否启用滚动锁定   |
| `selector`               | `string`                 | -            | 要锁定的元素选择器 |
| `preserveScrollPosition` | `boolean`                | `true`       | 是否保持滚动位置   |
| `lockStrategy`           | `'strict' \| 'flexible'` | `'flexible'` | 锁定策略           |

### 返回值

无返回值，钩子直接操作 DOM 和事件监听器。

### 类型定义

```tsx
interface UseScrollLockOptions {
  enabled: boolean
  selector?: string
  preserveScrollPosition?: boolean
  lockStrategy?: 'strict' | 'flexible'
}
```

## 使用示例

### 基础模态框

```tsx
function BasicModal() {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock({ enabled: isOpen })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 bg-white p-6 rounded-lg">
        <h2>模态框标题</h2>
        <p>模态框内容...</p>
        <button onClick={() => setIsOpen(false)}>关闭</button>
      </div>
    </div>
  )
}
```

### 侧边栏导航

```tsx
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock({
    enabled: isOpen,
    selector: 'body, main, .content-area',
  })

  return (
    <>
      <button onClick={() => setIsOpen(true)}>打开侧边栏</button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6">
              <h2>侧边栏</h2>
              <nav>
                <ul>
                  <li>
                    <a href="#home">首页</a>
                  </li>
                  <li>
                    <a href="#about">关于</a>
                  </li>
                  <li>
                    <a href="#contact">联系</a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

### 图片查看器

```tsx
function ImageViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  useScrollLock({
    enabled: isOpen,
    selector: 'body, .gallery, .image-grid',
    preserveScrollPosition: true,
  })

  const openImage = (src: string) => {
    setSelectedImage(src)
    setIsOpen(true)
  }

  return (
    <>
      <div className="gallery grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className="cursor-pointer hover:opacity-80"
            onClick={() => openImage(image.src)}
          />
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <img
            src={selectedImage}
            alt="查看大图"
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}
```

### 全屏视频播放器

```tsx
function VideoPlayer() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useScrollLock({
    enabled: isFullscreen,
    selector: 'body, .video-container, .content-wrapper',
    preserveScrollPosition: true,
  })

  return (
    <div className="video-container">
      <video
        className="w-full"
        controls
        onDoubleClick={() => setIsFullscreen(!isFullscreen)}
      >
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <video className="max-w-full max-h-full" controls autoPlay>
            <source src="/video.mp4" type="video/mp4" />
          </video>
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setIsFullscreen(false)}
          >
            退出全屏
          </button>
        </div>
      )}
    </div>
  )
}
```

### 响应式滚动锁定

```tsx
function ResponsiveScrollLock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useScrollLock({
    enabled: isOpen,
    selector: isMobile
      ? 'body, .mobile-content'
      : 'body, .desktop-content, .sidebar',
    preserveScrollPosition: !isMobile,
  })

  return (
    <div className={`content ${isOpen ? 'locked' : ''}`}>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '解锁滚动' : '锁定滚动'}
      </button>
      <div className="content-area">{/* 内容区域 */}</div>
    </div>
  )
}
```

## 内置功能

### 滚动检测

- **智能识别**: 自动识别可滚动元素
- **边界检测**: 检测滚动边界和位置
- **事件处理**: 处理滚动相关事件

### 锁定策略

- **严格模式**: 完全阻止所有滚动
- **灵活模式**: 允许边界滚动
- **选择器锁定**: 锁定特定元素

### 位置保持

- **滚动记忆**: 记住滚动位置
- **状态恢复**: 解锁后恢复位置
- **平滑过渡**: 避免位置跳跃

## 样式集成

### Tailwind CSS

```tsx
function StyledModal() {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock({ enabled: isOpen })

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <div className="relative z-10 bg-white rounded-lg shadow-2xl m-4 p-6">
        模态框内容
      </div>
    </div>
  )
}
```

### CSS Modules

```tsx
import styles from './Modal.module.css'

function Modal() {
  const [isOpen, setIsOpen] = useState(false)

  useScrollLock({ enabled: isOpen })

  return (
    <div className={`${styles.modal} ${isOpen ? styles.open : ''}`}>
      模态框内容
    </div>
  )
}
```

## 注意事项

1. **性能**: 大量元素时注意性能影响
2. **兼容性**: 确保浏览器兼容性
3. **无障碍**: 考虑屏幕阅读器用户
4. **触摸设备**: 移动设备上的特殊处理

## 故障排除

### 滚动锁定不工作

- 检查 `enabled` 参数是否正确
- 验证选择器是否匹配元素
- 确保没有其他代码干扰

### 滚动位置丢失

- 设置 `preserveScrollPosition: true`
- 检查元素是否正确识别
- 验证滚动事件处理

### 触摸滚动问题

- 移动设备上测试触摸滚动
- 检查触摸事件处理
- 验证 preventDefault 使用

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器完全支持
