/**
 * 测试配置文件
 */

module.exports = {
  // 测试环境的基础URL
  baseUrl: 'http://localhost:3000',

  // 测试账号信息
  testUser: {
    email: 'test@example.com',
    password: 'password123',
  },

  // 测试文件路径
  testFiles: {
    resumePdf: './test/data/sample-resume.pdf',
  },

  // 超时设置（毫秒）
  timeouts: {
    navigation: 5000,
    element: 2000,
    action: 3000,
  },

  // 截图设置
  screenshots: {
    directory: './test/screenshots',
    takeOnFailure: true,
  },
}
