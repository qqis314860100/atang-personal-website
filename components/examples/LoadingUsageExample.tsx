'use client'

import { useLoading } from '@/app/hooks/use-loading'
import { useState } from 'react'

// 使用示例组件 - 展示如何在不同场景下使用全局加载
export function LoadingUsageExample() {
  const { showLoading, hideLoading } = useLoading()
  const [data, setData] = useState<any>(null)

  // 示例1: API请求加载
  const handleApiRequest = async () => {
    showLoading('正在获取数据', '请稍候...')

    try {
      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setData({ message: '数据加载成功！', timestamp: new Date() })
    } catch (error) {
      console.error('请求失败:', error)
    } finally {
      hideLoading()
    }
  }

  // 示例2: 文件上传加载
  const handleFileUpload = async () => {
    showLoading('正在上传文件', '请勿关闭页面...')

    try {
      // 模拟文件上传
      await new Promise((resolve) => setTimeout(resolve, 3000))
      console.log('文件上传成功')
    } catch (error) {
      console.error('上传失败:', error)
    } finally {
      hideLoading()
    }
  }

  // 示例3: 数据处理加载
  const handleDataProcess = async () => {
    showLoading('正在处理数据', '这可能需要几秒钟...')

    try {
      // 模拟数据处理
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('数据处理完成')
    } catch (error) {
      console.error('处理失败:', error)
    } finally {
      hideLoading()
    }
  }

  // 示例4: 自定义消息
  const handleCustomLoading = async () => {
    showLoading('正在保存您的设置', '马上就好...')

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('设置保存成功')
    } catch (error) {
      console.error('保存失败:', error)
    } finally {
      hideLoading()
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900">全局加载组件使用示例</h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleApiRequest}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          API请求示例
        </button>

        <button
          onClick={handleFileUpload}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          文件上传示例
        </button>

        <button
          onClick={handleDataProcess}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          数据处理示例
        </button>

        <button
          onClick={handleCustomLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          自定义消息示例
        </button>
      </div>

      {data && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">请求结果:</h3>
          <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// 在其他组件中的使用方法:
/*
import { useLoading } from '@/hooks/use-loading'

function YourComponent() {
  const { showLoading, hideLoading } = useLoading()

  const handleSomeAction = async () => {
    // 显示加载状态
    showLoading('正在处理', '请稍候...')
    
    try {
      // 执行异步操作
      await someAsyncOperation()
    } catch (error) {
      // 处理错误
    } finally {
      // 隐藏加载状态
      hideLoading()
    }
  }

  return <button onClick={handleSomeAction}>执行操作</button>
}
*/
