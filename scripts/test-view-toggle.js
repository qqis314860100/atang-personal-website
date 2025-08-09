// 测试视图切换功能
console.log('🎯 测试视图切换功能...')

// 模拟一些错误日志数据
const mockErrorLogs = [
  {
    id: '1',
    type: 'TypeError',
    message: 'Cannot read property of undefined',
    stackTrace: 'at processData (app.js:15:3)',
    page: '/zh/dashboard',
    count: 5,
    lastOccurrence: '2024-01-15 10:30:00',
    severity: 'high',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.1',
  },
  {
    id: '2',
    type: 'ReferenceError',
    message: 'variable is not defined',
    stackTrace: 'at renderComponent (component.js:25:7)',
    page: '/zh/blog',
    count: 3,
    lastOccurrence: '2024-01-15 09:15:00',
    severity: 'medium',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.2',
  },
  {
    id: '3',
    type: 'SyntaxError',
    message: 'Unexpected token',
    stackTrace: 'at parseJSON (utils.js:8:12)',
    page: '/zh/about',
    count: 1,
    lastOccurrence: '2024-01-15 08:45:00',
    severity: 'low',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.3',
  },
]

console.log('✅ 模拟错误日志数据已准备')
console.log('📊 错误日志数量:', mockErrorLogs.length)

// 模拟设备分布数据
const mockDeviceData = [
  {
    device: 'desktop',
    count: 25,
    browsers: { Chrome: 15, Firefox: 8, Safari: 2 },
    intensity: 0.8,
  },
  {
    device: 'mobile',
    count: 18,
    browsers: { 'Chrome Mobile': 12, 'Safari Mobile': 6 },
    intensity: 0.6,
  },
  {
    device: 'tablet',
    count: 7,
    browsers: { Safari: 5, Chrome: 2 },
    intensity: 0.3,
  },
]

console.log('✅ 模拟设备分布数据已准备')
console.log('📱 设备类型数量:', mockDeviceData.length)

// 模拟页面热力图数据
const mockPageData = [
  {
    page: '/zh/dashboard',
    views: 45,
    avgTime: 180,
    intensity: 0.9,
    pageDetails: {
      uniqueVisitors: 32,
      deviceDistribution: [
        { device: 'desktop', count: 30 },
        { device: 'mobile', count: 12 },
        { device: 'tablet', count: 3 },
      ],
      browserDistribution: [
        { browser: 'Chrome', count: 25 },
        { browser: 'Firefox', count: 12 },
        { browser: 'Safari', count: 8 },
      ],
      pathInfo: { originalPath: '/zh/dashboard' },
    },
  },
  {
    page: '/zh/blog',
    views: 28,
    avgTime: 120,
    intensity: 0.7,
    pageDetails: {
      uniqueVisitors: 22,
      deviceDistribution: [
        { device: 'desktop', count: 18 },
        { device: 'mobile', count: 8 },
        { device: 'tablet', count: 2 },
      ],
      browserDistribution: [
        { browser: 'Chrome', count: 16 },
        { browser: 'Firefox', count: 8 },
        { browser: 'Safari', count: 4 },
      ],
      pathInfo: { originalPath: '/zh/blog' },
    },
  },
]

console.log('✅ 模拟页面热力图数据已准备')
console.log('📄 页面数量:', mockPageData.length)

console.log('\n🎉 所有测试数据准备完成!')
console.log(
  '💡 现在可以访问 http://localhost:3001/zh/dashboard 测试视图切换功能:'
)
console.log('   - 点击每个卡片右上角的切换按钮')
console.log('   - 在列表视图和热力图视图之间切换')
console.log('   - 体验不同的数据展示方式')

// 验证数据格式
console.log('\n🔍 数据格式验证:')
console.log(
  '错误日志 - 包含 severity 字段:',
  mockErrorLogs.every((e) => e.severity)
)
console.log(
  '设备数据 - 包含 intensity 字段:',
  mockDeviceData.every((d) => d.intensity)
)
console.log(
  '页面数据 - 包含 pageDetails 字段:',
  mockPageData.every((p) => p.pageDetails)
)

console.log('\n✨ 功能特性:')
console.log('✅ 固定高度布局 (600px)')
console.log('✅ 列表/热力图切换')
console.log('✅ 滚动功能')
console.log('✅ 悬停效果')
console.log('✅ 展开/收起功能')
console.log('✅ 响应式设计')
