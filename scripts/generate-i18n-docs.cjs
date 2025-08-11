const fs = require('fs')
const path = require('path')

const namespaces = ['common', 'navbar', 'resume', 'dashboard', 'forms', 'login']

async function generateDocs() {
  const docs = {}

  for (const ns of namespaces) {
    docs[ns] = {}
    try {
      const zhPath = path.join(process.cwd(), 'messages', 'zh', `${ns}.json`)
      const enPath = path.join(process.cwd(), 'messages', 'en', `${ns}.json`)

      const zhContent = fs.readFileSync(zhPath, 'utf-8')
      const enContent = fs.readFileSync(enPath, 'utf-8')

      const zhTranslations = JSON.parse(zhContent)
      const enTranslations = JSON.parse(enContent)

      Object.keys(zhTranslations).forEach((key) => {
        docs[ns][key] = {
          zh: zhTranslations[key],
          en: enTranslations[key] || '⚠️ Missing translation',
        }
      })
    } catch (error) {
      console.warn(`Failed to generate docs for namespace "${ns}"`, error)
    }
  }

  // 生成 Markdown 文档
  let markdown = '# i18n Translation Keys\n\n'

  Object.entries(docs).forEach(([ns, translations]) => {
    markdown += `## ${ns}\n\n`
    markdown += '| Key | 中文 | English |\n'
    markdown += '|-----|------|---------|'

    Object.entries(translations).forEach(([key, { zh, en }]) => {
      markdown += `\n| \`${key}\` | ${zh} | ${en} |`
    })

    markdown += '\n\n'
  })

  const docsPath = path.join(process.cwd(), 'docs')
  const filePath = path.join(docsPath, 'i18n-keys.md')

  try {
    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true })
    }
    fs.writeFileSync(filePath, markdown, 'utf-8')
    console.log(`✅ i18n documentation generated at ${filePath}`)
  } catch (error) {
    console.error('Failed to write documentation file:', error)
    process.exit(1)
  }
}

generateDocs()
