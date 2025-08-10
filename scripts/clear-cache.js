#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧹 清理 Next.js 缓存...')

// 要清理的目录
const dirsToClean = ['.next', 'node_modules/.cache', '.turbo']

// 要清理的文件
const filesToClean = ['tsconfig.tsbuildinfo', '.env.local']

// 清理目录
dirsToClean.forEach((dir) => {
  const fullPath = path.join(process.cwd(), dir)
  if (fs.existsSync(fullPath)) {
    console.log(`删除目录: ${dir}`)
    fs.rmSync(fullPath, { recursive: true, force: true })
  }
})

// 清理文件
filesToClean.forEach((file) => {
  const fullPath = path.join(process.cwd(), file)
  if (fs.existsSync(fullPath)) {
    console.log(`删除文件: ${file}`)
    fs.unlinkSync(fullPath)
  }
})

console.log('✅ 缓存清理完成！')
console.log('💡 建议重新启动开发服务器: npm run dev')
