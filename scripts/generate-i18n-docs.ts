import { generateI18nDocs } from '../utils/i18n-helper'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const markdown = await generateI18nDocs()
  if (!markdown) {
    console.error('Failed to generate i18n documentation')
    process.exit(1)
  }

  const docsPath = path.resolve(__dirname, '../docs')
  const filePath = path.join(docsPath, 'i18n-keys.md')

  try {
    await fs.mkdir(docsPath, { recursive: true })
    await fs.writeFile(filePath, markdown, 'utf-8')
    console.log(`✅ i18n documentation generated at ${filePath}`)
  } catch (error) {
    console.error('Failed to write documentation file:', error)
    process.exit(1)
  }
}

main()
