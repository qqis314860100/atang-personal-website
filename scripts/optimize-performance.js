#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 开始性能优化...\n')

// 清理临时文件
function cleanTempFiles() {
  console.log('🧹 清理临时文件...')

  const tempFiles = [
    'tsconfig.tsbuildinfo',
    '.next',
    'node_modules/.cache',
    'logs',
    '*.log',
  ]

  tempFiles.forEach((file) => {
    try {
      if (fs.existsSync(file)) {
        if (fs.lstatSync(file).isDirectory()) {
          execSync(`rm -rf "${file}"`, { stdio: 'inherit' })
        } else {
          fs.unlinkSync(file)
        }
        console.log(`✅ 已删除: ${file}`)
      }
    } catch (error) {
      console.log(`⚠️  无法删除 ${file}: ${error.message}`)
    }
  })
}

// 优化Git仓库
function optimizeGit() {
  console.log('\n🔧 优化Git仓库...')

  try {
    // 清理和压缩Git对象
    execSync('git gc --prune=now', { stdio: 'inherit' })
    console.log('✅ Git仓库已优化')

    // 重新生成索引
    execSync('git update-index --refresh', { stdio: 'inherit' })
    console.log('✅ Git索引已刷新')
  } catch (error) {
    console.log(`⚠️  Git优化失败: ${error.message}`)
  }
}

// 检查大文件
function checkLargeFiles() {
  console.log('\n📊 检查大文件...')

  try {
    const result = execSync(
      'git ls-files | xargs ls -la | sort -k5 -nr | head -10',
      { encoding: 'utf8' }
    )
    console.log('最大的10个文件:')
    console.log(result)
  } catch (error) {
    console.log(`⚠️  无法检查大文件: ${error.message}`)
  }
}

// 主函数
function main() {
  cleanTempFiles()
  optimizeGit()
  checkLargeFiles()

  console.log('\n🎉 性能优化完成！')
  console.log('\n💡 建议:')
  console.log('1. 重启Cursor/VS Code')
  console.log('2. 如果还是很卡，考虑禁用一些扩展')
  console.log('3. 定期运行此脚本保持性能')
}

main()
