import { I18nExample } from '@/components/examples/I18nExample'

export default function TestI18nPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            智能中文映射工具演示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            这个工具允许你在开发时使用中文，但底层仍然是英文key + 模块化的架构。
            支持嵌套键、上下文、参数和fallback等功能。
          </p>
        </div>

        <I18nExample />
      </div>
    </div>
  )
}
