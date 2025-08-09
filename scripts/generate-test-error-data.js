// 生成测试错误日志数据
const testErrorData = [
  {
    id: '1',
    type: 'TypeError',
    message: 'Cannot read property of undefined',
    count: 150, // 数量最多，方块最大
    severity: 'high',
    timestamp: new Date().toISOString(),
    page: '/dashboard',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.1',
    level: 'error',
    source: 'frontend',
    stackTrace: 'Error: Cannot read property...',
  },
  {
    id: '2',
    type: 'ReferenceError',
    message: 'Variable is not defined',
    count: 89, // 数量中等，方块中等
    severity: 'medium',
    timestamp: new Date().toISOString(),
    page: '/profile',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.2',
    level: 'error',
    source: 'frontend',
    stackTrace: 'ReferenceError: Variable...',
  },
  {
    id: '3',
    type: 'SyntaxError',
    message: 'Unexpected token',
    count: 45, // 数量较少，方块较小
    severity: 'low',
    timestamp: new Date().toISOString(),
    page: '/settings',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.3',
    level: 'error',
    source: 'frontend',
    stackTrace: 'SyntaxError: Unexpected...',
  },
  {
    id: '4',
    type: 'NetworkError',
    message: 'Failed to fetch',
    count: 120, // 数量较多，方块较大
    severity: 'high',
    timestamp: new Date().toISOString(),
    page: '/api',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.4',
    level: 'error',
    source: 'frontend',
    stackTrace: 'NetworkError: Failed...',
  },
  {
    id: '5',
    type: 'ValidationError',
    message: 'Invalid input format',
    count: 67, // 数量中等，方块中等
    severity: 'medium',
    timestamp: new Date().toISOString(),
    page: '/form',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.5',
    level: 'error',
    source: 'frontend',
    stackTrace: 'ValidationError: Invalid...',
  },
  {
    id: '6',
    type: 'TimeoutError',
    message: 'Request timeout',
    count: 23, // 数量最少，方块最小
    severity: 'low',
    timestamp: new Date().toISOString(),
    page: '/search',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.6',
    level: 'error',
    source: 'frontend',
    stackTrace: 'TimeoutError: Request...',
  },
  {
    id: '7',
    type: 'MemoryError',
    message: 'Out of memory',
    count: 95, // 数量较多，方块较大
    severity: 'high',
    timestamp: new Date().toISOString(),
    page: '/upload',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.7',
    level: 'error',
    source: 'frontend',
    stackTrace: 'MemoryError: Out of...',
  },
  {
    id: '8',
    type: 'PermissionError',
    message: 'Access denied',
    count: 34, // 数量较少，方块较小
    severity: 'medium',
    timestamp: new Date().toISOString(),
    page: '/admin',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.8',
    level: 'error',
    source: 'frontend',
    stackTrace: 'PermissionError: Access...',
  },
]

console.log('测试错误数据生成完成！')
console.log('数据特点：')
console.log('- 数量最多：TypeError (150次) - 方块最大')
console.log('- 数量较多：NetworkError (120次), MemoryError (95次) - 方块较大')
console.log(
  '- 数量中等：ReferenceError (89次), ValidationError (67次) - 方块中等'
)
console.log('- 数量较少：SyntaxError (45次), PermissionError (34次) - 方块较小')
console.log('- 数量最少：TimeoutError (23次) - 方块最小')

// 导出数据供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testErrorData
}
