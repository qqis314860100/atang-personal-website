console.log('🔍 弹幕调试信息...')

// 模拟检查弹幕数据
const mockVideoId = 'f6ad8630-036f-4f79-862e-bcda6d58e6dc'

console.log('📋 检查项目:')
console.log('1. 视频ID:', mockVideoId)
console.log('2. 弹幕API端点: /api/danmaku')
console.log('3. 弹幕查询参数: { videoId, limit: 100 }')

console.log('\n🔧 可能的问题:')
console.log('- 弹幕数据为空')
console.log('- 弹幕颜色无效')
console.log('- CSS动画未加载')
console.log('- 容器高度为0')
console.log('- z-index层级问题')

console.log('\n💡 调试步骤:')
console.log('1. 打开浏览器开发者工具')
console.log('2. 查看Console标签页的日志')
console.log('3. 查看Network标签页的API请求')
console.log('4. 查看Elements标签页的DOM结构')

console.log('\n🎯 检查要点:')
console.log('- 弹幕数据是否成功获取')
console.log('- 弹幕容器是否可见')
console.log('- CSS动画是否生效')
console.log('- 弹幕元素是否添加到DOM')

console.log('\n📝 调试命令:')
console.log('// 在浏览器控制台执行以下命令')
console.log('// 1. 检查弹幕数据')
console.log(
  'fetch("/api/danmaku?videoId=' +
    mockVideoId +
    '&limit=100").then(r => r.json()).then(console.log)'
)
console.log('')
console.log('// 2. 检查弹幕容器')
console.log('document.querySelector("[class*=\\"Danmaku\\"]")')
console.log('')
console.log('// 3. 检查CSS动画')
console.log('document.querySelector(".animate-danmaku-scroll")')

console.log('\n🎉 调试脚本完成!')
