/**
 * 简历上传功能测试
 * 使用标准Playwright API进行端到端测试
 */

const utils = require('./utils')
const config = require('./config')

// 简历上传测试
async function testResumeUpload() {
  try {
    // 1. 导航到简历页面
    await utils.navigateTo('/zh/user/resume')

    // 2. 获取页面对象
    const page = await utils.getSnapshot()
    console.log('页面已加载，准备测试上传功能')

    // 3. 查找上传区域并点击
    // 注意：这里使用CSS选择器替代了之前的快照查找方式
    const uploadAreaSelector =
      '.upload-area button, [role="button"]:has-text("上传文件"), [role="button"]:has-text("点击或拖拽文件")'
    const uploadArea = await utils.findElement(page, uploadAreaSelector)

    if (!uploadArea) {
      throw new Error('未找到上传区域')
    }

    // 截图记录上传前状态
    await utils.takeScreenshot(page, 'before-upload')

    // 点击上传区域
    await utils.clickElement(page, uploadAreaSelector, '上传区域按钮')

    // 4. 上传文件
    // 注意：在标准Playwright中，我们需要找到文件输入元素
    const fileInputSelector = 'input[type="file"]'
    await utils.uploadFile(page, fileInputSelector, config.testFiles.resumePdf)

    // 5. 等待上传完成和处理
    await utils.waitForPageLoad()

    // 6. 验证上传结果
    // 等待成功消息出现
    try {
      await utils.waitForText(page, '简历上传成功', 10000)
      console.log('测试通过：文件上传成功')
    } catch (error) {
      // 检查是否有错误消息
      const errorSelector = '[role="alert"], .error-message'
      const errorElement = await page.$(errorSelector)

      if (errorElement) {
        const errorText = await errorElement.textContent()
        throw new Error(`测试失败：${errorText}`)
      } else {
        throw new Error('测试失败：未能确认上传结果')
      }
    }

    // 截图记录上传后状态
    await utils.takeScreenshot(page, 'after-upload')

    // 7. 测试Markdown内容是否已加载
    const markdownSelector = '.prose'
    const markdownContent = await page.$(markdownSelector)

    if (markdownContent) {
      const text = await markdownContent.textContent()
      if (text && text.length > 10) {
        console.log('测试通过：Markdown内容已成功加载')
      } else {
        console.warn('警告：Markdown内容可能未正确加载')
      }
    }

    // 8. 测试删除功能
    const menuButtonSelector =
      '[aria-label*="menu"], button:has([aria-hidden="true"])'
    const menuButton = await page.$(menuButtonSelector)

    if (menuButton) {
      await utils.clickElement(page, menuButtonSelector, '文件菜单按钮')
      await utils.waitForPageLoad(1000) // 短暂等待菜单显示

      const deleteButtonSelector =
        'button:has-text("删除"), [role="menuitem"]:has-text("删除")'
      const deleteButton = await page.$(deleteButtonSelector)

      if (deleteButton) {
        // 设置对话框处理器（在点击前）
        await utils.handleDialog(page, true)

        // 点击删除按钮
        await utils.clickElement(page, deleteButtonSelector, '删除按钮')

        // 等待删除操作完成
        await utils.waitForPageLoad()

        // 验证删除成功
        // 截图记录删除后状态
        await utils.takeScreenshot(page, 'after-delete')

        // 检查上传区域是否重新出现
        const uploadAreaAfterDelete = await page.$(uploadAreaSelector)

        if (uploadAreaAfterDelete) {
          console.log('测试通过：文件删除成功')
        } else {
          throw new Error('测试失败：文件可能未被删除')
        }
      }
    }

    console.log('所有测试完成')
  } catch (error) {
    console.error('测试过程中出现错误:', error)
    // 获取当前页面对象
    const page = await utils.getSnapshot()
    // 测试失败时截图
    await utils.takeScreenshot(page, 'test-failure')
    throw error
  } finally {
    // 关闭浏览器
    await utils.closeBrowser()
  }
}

// 导出测试函数
module.exports = {
  testResumeUpload,
}
