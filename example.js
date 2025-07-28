const { chromium } = require('playwright')

;(async () => {
  // 启动浏览器
  const browser = await chromium.launch({})

  // 打开一个新页面
  const page = await browser.newPage()

  // 跳转到指定网址
  await page.goto('http://localhost:3000')

  // 截取屏幕快照并保存为 example.png
  await page.screenshot({ path: 'example.png' })

  // 关闭浏览器
  await browser.close()
})()
