#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 开始性能优化 (Windows版本)...\n')

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
          // Windows兼容的删除命令
          execSync(`rmdir /s /q "${file}"`, { stdio: 'inherit' })
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

// 检查大文件 (Windows兼容)
function checkLargeFiles() {
  console.log('\n📊 检查大文件...')

  try {
    // 使用PowerShell命令检查大文件
    const result = execSync(
      'powershell "Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object -First 10 | Format-Table Name, @{Name=\'Size(MB)\';Expression={[math]::Round($_.Length/1MB,2)}}"',
      { encoding: 'utf8' }
    )
    console.log('最大的10个文件:')
    console.log(result)
  } catch (error) {
    console.log(`⚠️  无法检查大文件: ${error.message}`)
  }
}

// 清理构建缓存
function cleanBuildCache() {
  console.log('\n🧹 清理构建缓存...')

  try {
    // 清理Next.js缓存
    if (fs.existsSync('.next')) {
      execSync('rmdir /s /q ".next"', { stdio: 'inherit' })
      console.log('✅ Next.js缓存已清理')
    }

    // 清理TypeScript构建信息
    if (fs.existsSync('tsconfig.tsbuildinfo')) {
      fs.unlinkSync('tsconfig.tsbuildinfo')
      console.log('✅ TypeScript构建信息已清理')
    }

    // 清理node_modules缓存
    if (fs.existsSync('node_modules/.cache')) {
      execSync('rmdir /s /q "node_modules\\.cache"', { stdio: 'inherit' })
      console.log('✅ Node modules缓存已清理')
    }
  } catch (error) {
    console.log(`⚠️  清理缓存失败: ${error.message}`)
  }
}

// 主函数
function main() {
  cleanTempFiles()
  cleanBuildCache()
  optimizeGit()
  checkLargeFiles()

  console.log('\n🎉 性能优化完成！')
  console.log('\n💡 建议:')
  console.log('1. 重启Cursor/VS Code')
  console.log('2. 如果还是很卡，考虑禁用一些扩展')
  console.log('3. 定期运行此脚本保持性能')
  console.log('4. 考虑使用 npm run clean 快速清理')
}

main()
