/**
 * 生成示例PDF文件用于测试
 * 需要安装 pdfkit: npm install pdfkit
 */

const fs = require('fs')
const PDFDocument = require('pdfkit')

// 创建一个示例简历PDF
function createSampleResumePDF() {
  // 创建一个PDF文档
  const doc = new PDFDocument()

  // 将输出流导向文件
  doc.pipe(fs.createWriteStream(__dirname + '/sample-resume.pdf'))

  // 添加标题
  doc.fontSize(25).text('个人简历示例', {
    align: 'center',
  })

  doc.moveDown()

  // 添加个人信息
  doc.fontSize(16).text('基本信息', {
    underline: true,
  })

  doc
    .fontSize(12)
    .text('姓名: 张三')
    .text('年龄: 28岁')
    .text('电话: 13800138000')
    .text('邮箱: zhangsan@example.com')

  doc.moveDown()

  // 添加教育背景
  doc.fontSize(16).text('教育背景', {
    underline: true,
  })

  doc
    .fontSize(12)
    .text('2012-2016 北京大学 计算机科学与技术 本科')
    .text('2016-2019 清华大学 软件工程 硕士')

  doc.moveDown()

  // 添加工作经验
  doc.fontSize(16).text('工作经验', {
    underline: true,
  })

  doc
    .fontSize(12)
    .text('2019-2021 ABC科技有限公司 前端开发工程师')
    .text('- 负责公司主要产品的Web前端开发')
    .text('- 使用React和TypeScript开发企业级应用')
    .text('- 优化前端性能，提高用户体验')

  doc
    .moveDown()
    .text('2021-至今 XYZ互联网公司 高级前端开发工程师')
    .text('- 负责团队的技术选型和架构设计')
    .text('- 开发和维护公司核心业务系统')
    .text('- 指导初级开发人员，提高团队整体技术水平')

  doc.moveDown()

  // 添加技能
  doc.fontSize(16).text('专业技能', {
    underline: true,
  })

  doc
    .fontSize(12)
    .text('- 前端: JavaScript, TypeScript, React, Vue, Next.js')
    .text('- 后端: Node.js, Express, NestJS')
    .text('- 数据库: MySQL, MongoDB, PostgreSQL')
    .text('- 其他: Git, Docker, CI/CD, AWS')

  // 完成PDF
  doc.end()

  console.log('示例简历PDF已创建: ' + __dirname + '/sample-resume.pdf')
}

// 执行函数
createSampleResumePDF()
