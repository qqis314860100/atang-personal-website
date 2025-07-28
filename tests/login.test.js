/**
 * 登录功能测试
 * 使用标准Playwright API进行端到端测试
 */

const utils = require('./utils')
const config = require('./config')

/**
 * 测试用户登录流程
 */
async function testLogin() {
  try {
    // 1. 导航到登录页面
    await utils.navigateTo('/zh/login')

    // 2. 获取页面对象
    const page = await utils.getSnapshot()
    console.log('页面已加载，准备测试登录功能')

    // 截图记录登录前状态
    await utils.takeScreenshot(page, 'before-login')

    // 3. 查找邮箱输入框并输入
    const emailSelector =
      'input[type="email"], input[name="email"], input[placeholder*="邮箱"]'
    const emailInput = await utils.findElement(page, emailSelector)

    if (!emailInput) {
      throw new Error('未找到邮箱输入框')
    }

    await utils.typeText(
      page,
      emailSelector,
      config.testUser.email,
      '邮箱输入框'
    )

    // 4. 查找密码输入框并输入
    const passwordSelector =
      'input[type="password"], input[name="password"], input[placeholder*="密码"]'
    const passwordInput = await utils.findElement(page, passwordSelector)

    if (!passwordInput) {
      throw new Error('未找到密码输入框')
    }

    await utils.typeText(
      page,
      passwordSelector,
      config.testUser.password,
      '密码输入框'
    )

    // 5. 查找登录按钮并点击
    const loginButtonSelector =
      'button:has-text("登录"), button:has-text("Login"), [type="submit"]'
    const loginButton = await utils.findElement(page, loginButtonSelector)

    if (!loginButton) {
      throw new Error('未找到登录按钮')
    }

    await utils.clickElement(page, loginButtonSelector, '登录按钮')

    // 6. 等待登录完成
    await utils.waitForPageLoad()

    // 7. 验证登录结果
    // 截图记录登录后状态
    await utils.takeScreenshot(page, 'after-login')

    // 检查是否有欢迎信息或用户名显示
    try {
      // 等待任何一个成功登录的指示元素出现
      await page.waitForSelector(
        [
          `text="${config.testUser.email}"`,
          'text="欢迎"',
          'text="个人中心"',
          'text="退出"',
          'text="登出"',
        ].join(', '),
        { timeout: 5000 }
      )

      console.log('测试通过：用户登录成功')
    } catch (error) {
      // 检查是否有错误消息
      const errorSelector = '[role="alert"], .error-message'
      const errorElement = await page.$(errorSelector)

      if (errorElement) {
        const errorText = await errorElement.textContent()
        throw new Error(`测试失败：${errorText}`)
      } else {
        throw new Error('测试失败：未能确认登录结果')
      }
    }

    console.log('登录测试完成')
  } catch (error) {
    console.error('测试过程中出现错误:', error)
    // 获取当前页面对象
    const page = await utils.getSnapshot()
    // 测试失败时截图
    await utils.takeScreenshot(page, 'login-failure')
    throw error
  }
}

/**
 * 测试用户登出流程
 */
async function testLogout() {
  try {
    // 1. 获取页面对象
    const page = await utils.getSnapshot()

    // 2. 查找用户菜单或头像并点击
    const userMenuSelector =
      '[aria-label*="用户"], .avatar, button:has-text("个人中心")'
    const userMenu = await utils.findElement(page, userMenuSelector)

    if (!userMenu) {
      throw new Error('未找到用户菜单')
    }

    await utils.clickElement(page, userMenuSelector, '用户菜单')
    await utils.waitForPageLoad(1000) // 短暂等待菜单显示

    // 3. 查找登出按钮并点击
    const logoutButtonSelector =
      'button:has-text("退出"), button:has-text("登出"), button:has-text("注销")'
    const logoutButton = await utils.findElement(page, logoutButtonSelector)

    if (!logoutButton) {
      throw new Error('未找到登出按钮')
    }

    await utils.clickElement(page, logoutButtonSelector, '登出按钮')

    // 4. 等待登出完成
    await utils.waitForPageLoad()

    // 5. 验证登出结果
    // 截图记录登出后状态
    await utils.takeScreenshot(page, 'after-logout')

    // 检查是否有登录按钮或登录链接
    try {
      await page.waitForSelector(
        'a:has-text("登录"), button:has-text("登录"), a:has-text("Login"), button:has-text("Login")',
        { timeout: 5000 }
      )
      console.log('测试通过：用户登出成功')
    } catch (error) {
      throw new Error('测试失败：用户可能未成功登出')
    }

    console.log('登出测试完成')
  } catch (error) {
    console.error('测试过程中出现错误:', error)
    // 获取当前页面对象
    const page = await utils.getSnapshot()
    // 测试失败时截图
    await utils.takeScreenshot(page, 'logout-failure')
    throw error
  }
}

// 导出测试函数
module.exports = {
  testLogin,
  testLogout,
}
