// 测试Supabase上传功能
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载.env.local文件
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const testSupabaseUpload = async () => {
  console.log('🧪 测试Supabase上传功能...')

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('📋 环境变量检查:')
  console.log('- SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置')
  console.log('- SUPABASE_ANON_KEY:', supabaseKey ? '已设置' : '未设置')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 缺少必要的环境变量')
    return
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('✅ Supabase客户端创建成功')

    // 测试存储桶访问
    console.log('\n📦 测试存储桶访问...')
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('❌ 获取存储桶列表失败:', bucketsError)
      return
    }

    console.log('✅ 存储桶列表获取成功')
    console.log(
      '📋 可用存储桶:',
      buckets.map((b) => b.name)
    )

    // 检查upload存储桶
    const uploadBucket = buckets.find((b) => b.name === 'upload')
    if (!uploadBucket) {
      console.error('❌ 未找到upload存储桶')
      return
    }

    console.log('✅ upload存储桶存在')

    // 测试文件列表
    console.log('\n📁 测试文件列表...')
    const { data: files, error: filesError } = await supabase.storage
      .from('upload')
      .list()

    if (filesError) {
      console.error('❌ 获取文件列表失败:', filesError)
      return
    }

    console.log('✅ 文件列表获取成功')
    console.log('📋 文件数量:', files.length)

    // 创建测试文件
    console.log('\n📝 创建测试文件...')
    const testContent = '这是一个测试文件'
    const testFileName = `test_${Date.now()}.txt`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('upload')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ 文件上传失败:', uploadError)
      return
    }

    console.log('✅ 测试文件上传成功:', uploadData)

    // 获取公开URL
    console.log('\n🔗 获取公开URL...')
    const { data: urlData } = supabase.storage
      .from('upload')
      .getPublicUrl(testFileName)

    console.log('✅ 公开URL获取成功:', urlData.publicUrl)

    // 清理测试文件
    console.log('\n🧹 清理测试文件...')
    const { error: deleteError } = await supabase.storage
      .from('upload')
      .remove([testFileName])

    if (deleteError) {
      console.error('❌ 删除测试文件失败:', deleteError)
    } else {
      console.log('✅ 测试文件删除成功')
    }

    console.log('\n🎉 Supabase上传功能测试完成！')
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testSupabaseUpload()
