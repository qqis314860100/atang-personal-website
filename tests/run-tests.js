/**
 * 测试运行器
 * 用于运行Playwright MCP测试
 */

const { testLogin, testLogout } = require('./login.test')
const { testResumeUpload } = require('./resume-upload.test')

async function runTests() {
  console.log('开始运行测试...')

  // 确保本地服务器已启动
  console.log('请确保您的Next.js应用已在本地运行 (http://localhost:3000)')

  try {
    // 运行登录测试
    console.log('\n=== 测试用户登录功能 ===')
    await testLogin()

    // 运行简历上传测试
    console.log('\n=== 测试简历上传功能 ===')
    await testResumeUpload()

    // 运行登出测试
    console.log('\n=== 测试用户登出功能 ===')
    await testLogout()

    console.log('\n✅ 所有测试已成功完成')
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:', error)
    process.exit(1)
  }
}

// 允许单独运行特定测试
async function runSpecificTest(testName) {
  console.log(`开始运行测试: ${testName}`)

  try {
    switch (testName) {
      case 'login':
        await testLogin()
        break
      case 'resume':
        await testResumeUpload()
        break
      case 'logout':
        await testLogout()
        break
      default:
        console.error(`未知的测试名称: ${testName}`)
        process.exit(1)
    }
    console.log(`\n✅ 测试 ${testName} 已成功完成`)
  } catch (error) {
    console.error(`\n❌ 测试 ${testName} 失败:`, error)
    process.exit(1)
  }
}

// 解析命令行参数
const args = process.argv.slice(2)
if (args.length > 0) {
  runSpecificTest(args[0])
} else {
  // 运行所有测试
  runTests().catch((error) => {
    console.error('测试运行失败:', error)
    process.exit(1)
  })
}
