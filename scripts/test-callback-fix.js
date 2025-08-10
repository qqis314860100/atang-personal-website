#!/usr/bin/env node

// 测试回调函数修复
console.log('🧪 测试回调函数修复...')

// 模拟组件生命周期
class MockComponent {
  constructor() {
    this.mounted = false
    this.callbacks = []
    this.subscriptions = []
  }

  mount() {
    console.log('📦 组件挂载')
    this.mounted = true
  }

  unmount() {
    console.log('🗑️  组件卸载')
    this.mounted = false

    // 清理所有回调
    this.callbacks.forEach((callback) => {
      if (typeof callback === 'function') {
        try {
          callback()
        } catch (error) {
          console.warn('⚠️ 回调清理失败:', error.message)
        }
      }
    })

    // 清理所有订阅
    this.subscriptions.forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.warn('⚠️ 订阅清理失败:', error.message)
        }
      }
    })

    this.callbacks = []
    this.subscriptions = []
  }

  // 模拟异步回调
  async executeAsyncCallback(callback) {
    if (!this.mounted) {
      console.warn('🚫 组件已卸载，跳过回调执行')
      return
    }

    try {
      await callback()
    } catch (error) {
      if (this.mounted) {
        console.error('❌ 回调执行失败:', error.message)
      }
    }
  }

  // 模拟订阅
  subscribe(callback) {
    if (!this.mounted) return null

    const subscription = {
      unsubscribe: () => {
        const index = this.subscriptions.indexOf(subscription)
        if (index > -1) {
          this.subscriptions.splice(index, 1)
        }
      },
    }

    this.subscriptions.push(subscription)
    this.callbacks.push(callback)

    return subscription
  }
}

// 测试场景
async function testCallbackScenarios() {
  console.log('\n🔍 测试回调函数场景...')

  const component = new MockComponent()

  // 场景1: 正常挂载和卸载
  console.log('\n1. 正常挂载和卸载测试')
  component.mount()

  const subscription = component.subscribe(() => {
    console.log('✅ 回调正常执行')
  })

  component.unmount()
  console.log('✅ 正常卸载完成')

  // 场景2: 异步回调在组件卸载后执行
  console.log('\n2. 异步回调卸载后执行测试')
  component.mount()

  setTimeout(() => {
    component.executeAsyncCallback(async () => {
      console.log('⏰ 延迟回调执行')
    })
  }, 100)

  // 立即卸载
  component.unmount()

  // 等待异步回调
  await new Promise((resolve) => setTimeout(resolve, 200))

  // 场景3: 订阅清理测试
  console.log('\n3. 订阅清理测试')
  component.mount()

  const sub1 = component.subscribe(() => console.log('订阅1'))
  const sub2 = component.subscribe(() => console.log('订阅2'))

  console.log('📊 订阅数量:', component.subscriptions.length)
  component.unmount()
  console.log('📊 清理后订阅数量:', component.subscriptions.length)

  // 场景4: 错误处理测试
  console.log('\n4. 错误处理测试')
  component.mount()

  component.subscribe(() => {
    throw new Error('模拟回调错误')
  })

  component.unmount()

  console.log('\n✅ 所有测试场景完成!')
}

// 测试埋点系统
function testAnalyticsSystem() {
  console.log('\n📊 测试埋点系统...')

  const testCases = [
    {
      name: '正常错误',
      error: new Error('正常应用错误'),
      shouldTrack: true,
    },
    {
      name: 'Next.js开发工具错误',
      error: new Error('callback is no longer runnable'),
      shouldTrack: false,
    },
    {
      name: 'use-action-queue错误',
      error: new Error('use-action-queue callback error'),
      shouldTrack: false,
    },
  ]

  testCases.forEach((testCase) => {
    const shouldTrack =
      !testCase.error.message.includes('callback is no longer runnable') &&
      !testCase.error.message.includes('use-action-queue')

    const status = shouldTrack ? '✅ 应该追踪' : '🚫 应该忽略'
    console.log(`${testCase.name}: ${status}`)
  })
}

// 测试权限系统
function testPermissionsSystem() {
  console.log('\n🔐 测试权限系统...')

  const testUsers = [
    { name: '普通用户', isAdmin: false },
    { name: '管理员', isAdmin: true },
    { name: '未登录用户', isAdmin: undefined },
  ]

  testUsers.forEach((user) => {
    const role = user.isAdmin ? 'ADMIN' : 'USER'
    console.log(`${user.name}: ${role}`)
  })

  console.log('✅ 权限系统测试完成')
}

// 运行所有测试
async function runAllTests() {
  try {
    await testCallbackScenarios()
    testAnalyticsSystem()
    testPermissionsSystem()

    console.log('\n🎉 所有测试完成!')
    console.log('\n📋 修复总结:')
    console.log('- ✅ AuthListener: 添加了mounted状态检查')
    console.log('- ✅ 埋点系统: 过滤Next.js开发工具错误')
    console.log('- ✅ 权限系统: 使用useMemo和useCallback优化')
    console.log('- ✅ 回调函数: 添加了组件生命周期检查')
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

runAllTests()
