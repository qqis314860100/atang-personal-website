/**
 * 测试工具函数库
 * 使用标准Playwright API
 */

const { chromium } = require('playwright')
const config = require('./config')
const fs = require('fs')
const path = require('path')

let browser
let page

/**
 * 初始化浏览器
 */
async function initBrowser() {
  if (!browser) {
    console.log('启动浏览器...')
    browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    page = await context.newPage()
  }
  return { browser, page }
}

/**
 * 页面导航
 * @param {string} urlPath - 相对路径
 */
async function navigateTo(urlPath) {
  const { page } = await initBrowser()
  const url = `${config.baseUrl}${urlPath}`
  console.log(`导航到: ${url}`)
  await page.goto(url, { waitUntil: 'networkidle' })
}

/**
 * 等待页面加载
 * @param {number} timeout - 超时时间（毫秒）
 */
async function waitForPageLoad(timeout = config.timeouts.navigation) {
  const { page } = await initBrowser()
  const timeoutSeconds = timeout / 1000
  console.log(`等待页面加载 (${timeoutSeconds}秒)...`)
  await page.waitForTimeout(timeout)
}

/**
 * 获取页面快照（在标准Playwright中，我们直接使用page对象）
 * @returns {Object} 页面对象
 */
async function getSnapshot() {
  const { page } = await initBrowser()
  console.log('获取页面状态...')
  return page
}

/**
 * 查找元素
 * @param {Object} page - 页面对象
 * @param {Function} predicate - 查找条件
 * @returns {Object|null} 找到的元素或null
 */
async function findElement(page, selector) {
  try {
    const element = await page.$(selector)
    return element
  } catch (error) {
    console.error(`查找元素失败: ${selector}`, error)
    return null
  }
}

/**
 * 点击元素
 * @param {Object} page - 页面对象
 * @param {string} selector - 元素选择器
 * @param {string} description - 元素描述
 */
async function clickElement(page, selector, description) {
  console.log(`点击元素: ${description} (${selector})`)
  try {
    await page.click(selector)
  } catch (error) {
    throw new Error(
      `点击元素失败: ${description} (${selector}): ${error.message}`
    )
  }
}

/**
 * 输入文本
 * @param {Object} page - 页面对象
 * @param {string} selector - 元素选择器
 * @param {string} text - 要输入的文本
 * @param {string} description - 元素描述
 * @param {boolean} submit - 是否提交
 */
async function typeText(page, selector, text, description, submit = false) {
  console.log(`在 ${description} (${selector}) 中输入: ${text}`)
  try {
    await page.fill(selector, text)
    if (submit) {
      await page.press(selector, 'Enter')
    }
  } catch (error) {
    throw new Error(
      `输入文本失败: ${description} (${selector}): ${error.message}`
    )
  }
}

/**
 * 上传文件
 * @param {Object} page - 页面对象
 * @param {string} selector - 文件输入选择器
 * @param {string} filePath - 文件路径
 */
async function uploadFile(page, selector, filePath) {
  console.log(`上传文件: ${filePath}`)
  try {
    const input = await page.$(selector)
    if (!input) {
      throw new Error(`找不到文件输入元素: ${selector}`)
    }
    await input.setInputFiles(filePath)
  } catch (error) {
    throw new Error(`上传文件失败: ${error.message}`)
  }
}

/**
 * 等待文本出现
 * @param {Object} page - 页面对象
 * @param {string} text - 要等待的文本
 * @param {number} timeout - 超时时间（毫秒）
 */
async function waitForText(page, text, timeout = config.timeouts.element) {
  console.log(`等待文本出现: "${text}" (${timeout}ms)...`)
  try {
    await page.waitForSelector(`text="${text}"`, { timeout })
  } catch (error) {
    throw new Error(`等待文本出现失败: "${text}": ${error.message}`)
  }
}

/**
 * 处理对话框
 * @param {Object} page - 页面对象
 * @param {boolean} accept - 是否接受对话框
 * @param {string} promptText - 提示文本（如果有）
 */
async function handleDialog(page, accept = true, promptText = '') {
  console.log(`处理对话框: ${accept ? '接受' : '拒绝'}`)

  // 设置对话框处理器
  page.once('dialog', async (dialog) => {
    if (accept) {
      if (promptText && dialog.type() === 'prompt') {
        await dialog.accept(promptText)
      } else {
        await dialog.accept()
      }
    } else {
      await dialog.dismiss()
    }
  })
}

/**
 * 截图
 * @param {Object} page - 页面对象
 * @param {string} name - 截图名称
 * @param {string} selector - 元素选择器（可选）
 */
async function takeScreenshot(page, name, selector = null) {
  const filename = `${name}-${new Date()
    .toISOString()
    .replace(/[:.]/g, '-')}.png`
  const filePath = path.join(config.screenshots.directory, filename)

  // 确保截图目录存在
  if (!fs.existsSync(config.screenshots.directory)) {
    fs.mkdirSync(config.screenshots.directory, { recursive: true })
  }

  console.log(`截图: ${filename}`)

  try {
    if (selector) {
      const element = await page.$(selector)
      if (element) {
        await element.screenshot({ path: filePath })
      } else {
        await page.screenshot({ path: filePath })
      }
    } else {
      await page.screenshot({ path: filePath, fullPage: true })
    }
    return filePath
  } catch (error) {
    console.error(`截图失败: ${error.message}`)
    return null
  }
}

/**
 * 关闭浏览器
 */
async function closeBrowser() {
  if (browser) {
    console.log('关闭浏览器')
    await browser.close()
    browser = null
    page = null
  }
}

// 导出工具函数
module.exports = {
  initBrowser,
  navigateTo,
  waitForPageLoad,
  getSnapshot,
  findElement,
  clickElement,
  typeText,
  uploadFile,
  waitForText,
  handleDialog,
  takeScreenshot,
  closeBrowser,
}
