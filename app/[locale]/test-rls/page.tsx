'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { checkRLSPolicies } from '@/app/actions/test/check-rls-policies'

export default function TestRLSPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    try {
      const testResult = await checkRLSPolicies()
      setResult(testResult)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : '未知错误' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">RLS 策略测试</h1>

      <Button onClick={handleTest} disabled={loading}>
        {loading ? '测试中...' : '运行 RLS 测试'}
      </Button>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
