# ScrollLock 滚动锁定组件

## 概述

ScrollLock 是一个用于防止移动端弹窗滚动穿透的通用组件，它通过智能检测可滚动元素并阻止边界滚动来实现完整的滚动锁定。

## 特性

- 🚫 **完全阻止滚动穿透**：不仅阻止 body 滚动，还阻止所有可滚动元素的边界滚动
- 🎯 **智能边界检测**：只在真正需要阻止滚动时才阻止，保持正常的滚动体验
- 🔧 **高度可配置**：支持自定义选择器和滚动位置保持
- 🧹 **自动清理**：自动管理事件监听器，防止内存泄漏
- 📱 **移动端优化**：专门针对触摸滚动优化

## 使用方法

### 1. 组件方式

```tsx
import ScrollLock from '@/app/components/scroll-lock/scroll-lock'

function Modal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ScrollLock isActive={isOpen}>
      <div className="modal">
        <h2>弹窗内容</h2>
        <p>这里的内容不会滚动穿透</p>
        <button onClick={() => setIsOpen(false)}>关闭</button>
      </div>
    </ScrollLock>
  )
}
```

### 2. Hook 方式（推荐）

```tsx
import { useScrollLock } from '@/app/hooks/use-scroll-lock'

function Modal() {
  const [isOpen, setIsOpen] = useState(false)
  const { lockScroll, unlockScroll, isLocked } = useScrollLock({
    enabled: true,
    selector: 'div, section, article', // 自定义选择器
    preserveScrollPosition: true, // 保持滚动位置
  })

  useEffect(() => {
    if (isOpen) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }, [isOpen, lockScroll, unlockScroll])

  return (
    <div className="modal">
      <h2>弹窗内容</h2>
      <p>滚动状态: {isLocked ? '已锁定' : '未锁定'}</p>
      <button onClick={() => setIsOpen(false)}>关闭</button>
    </div>
  )
}
```

### 3. 高级用法

```tsx
function AdvancedModal() {
  const [isOpen, setIsOpen] = useState(false)
  const { lockScroll, unlockScroll, toggleScrollLock, isLocked } =
    useScrollLock({
      selector: 'div[data-scrollable], .custom-scroll', // 自定义选择器
      preserveScrollPosition: false, // 不保持滚动位置
    })

  // 手动控制滚动锁定
  const handleToggle = () => {
    toggleScrollLock()
  }

  // 条件性锁定
  useEffect(() => {
    if (isOpen && window.innerWidth <= 768) {
      // 只在移动端锁定
      lockScroll()
    }
  }, [isOpen, lockScroll])

  return (
    <div className="modal">
      <button onClick={handleToggle}>
        {isLocked ? '解锁滚动' : '锁定滚动'}
      </button>
    </div>
  )
}
```

## API 参考

### ScrollLock 组件

| 属性        | 类型        | 默认值 | 说明             |
| ----------- | ----------- | ------ | ---------------- |
| `isActive`  | `boolean`   | -      | 是否激活滚动锁定 |
| `children`  | `ReactNode` | -      | 子元素           |
| `className` | `string`    | `''`   | 自定义样式类名   |

### useScrollLock Hook

#### 参数

| 参数                     | 类型      | 默认值                                                                               | 说明                 |
| ------------------------ | --------- | ------------------------------------------------------------------------------------ | -------------------- |
| `enabled`                | `boolean` | `true`                                                                               | 是否启用滚动锁定功能 |
| `selector`               | `string`  | `'div, section, article, aside, main, nav, header, footer, ul, ol, li, table, form'` | 可滚动元素选择器     |
| `preserveScrollPosition` | `boolean` | `true`                                                                               | 是否保持滚动位置     |

#### 返回值

| 属性               | 类型         | 说明                 |
| ------------------ | ------------ | -------------------- |
| `isLocked`         | `boolean`    | 当前是否已锁定滚动   |
| `lockScroll`       | `() => void` | 锁定滚动函数         |
| `unlockScroll`     | `() => void` | 解锁滚动函数         |
| `toggleScrollLock` | `() => void` | 切换滚动锁定状态函数 |

## 工作原理

1. **全局滚动禁用**：设置 `body` 为 `position: fixed` 并记录原始滚动位置
2. **智能元素检测**：使用选择器查找所有可滚动元素
3. **边界滚动阻止**：为每个可滚动元素添加触摸事件监听器，检测滚动边界
4. **条件性阻止**：只在到达滚动边界时才阻止默认行为
5. **自动清理**：组件卸载时自动清理所有事件监听器

## 注意事项

- 确保在移动端测试滚动穿透防护效果
- 自定义选择器时注意性能影响，避免选择过多元素
- 在 SSR 环境中使用时需要确保客户端渲染
- 某些第三方组件可能需要特殊处理

## 浏览器兼容性

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ 移动端浏览器

## 常见问题

### Q: 为什么某些元素仍然可以滚动？

A: 检查该元素是否被选择器覆盖，或者是否有特殊的滚动实现。

### Q: 如何自定义可滚动元素检测？

A: 使用 `selector` 参数指定自定义选择器。

### Q: 滚动锁定后如何恢复？

A: 使用 `unlockScroll()` 函数或设置 `isActive={false}`。

### Q: 是否支持嵌套弹窗？

A: 支持，但建议使用 Hook 方式手动管理状态。
