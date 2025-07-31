'use client'

import { useState } from 'react'
import { debugAuth } from '@/app/actions/test/debug-auth'
import { testSupabaseConnection } from '@/app/actions/test/test-supabase-connection'
import { checkDatabaseConnection } from '@/app/actions/test/check-database-connection'
import { testNetwork } from '@/app/actions/test/test-network'
import { checkSupabaseProject } from '@/app/actions/test/check-supabase-project'
import { testSimpleQuery } from '@/app/actions/test/test-simple-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const [authResult, setAuthResult] = useState<any>(null)
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [dbResult, setDbResult] = useState<any>(null)
  const [networkResult, setNetworkResult] = useState<any>(null)
  const [projectResult, setProjectResult] = useState<any>(null)
  const [simpleQueryResult, setSimpleQueryResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleDebugAuth = async () => {
    setLoading(true)
    try {
      const debugResult = await debugAuth()
      setAuthResult(debugResult)
    } catch (error) {
      setAuthResult({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    try {
      const testResult = await testSupabaseConnection()
      setConnectionResult(testResult)
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckDatabase = async () => {
    setLoading(true)
    try {
      const dbResult = await checkDatabaseConnection()
      setDbResult(dbResult)
    } catch (error) {
      setDbResult({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestNetwork = async () => {
    setLoading(true)
    try {
      const networkResult = await testNetwork()
      setNetworkResult(networkResult)
    } catch (error) {
      setNetworkResult({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckProject = async () => {
    setLoading(true)
    try {
      const projectResult = await checkSupabaseProject()
      setProjectResult(projectResult)
    } catch (error) {
      setProjectResult({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestSimpleQuery = async () => {
    setLoading(true)
    try {
      const simpleQueryResult = await testSimpleQuery()
      setSimpleQueryResult(simpleQueryResult)
    } catch (error) {
      setSimpleQueryResult({
        success: false,
        message: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">认证调试页面</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">认证调试</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDebugAuth}
              disabled={loading}
              className="w-full text-xs"
              size="sm"
            >
              {loading ? '调试中...' : '开始调试认证'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Supabase 连接</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestConnection}
              disabled={loading}
              className="w-full text-xs"
              size="sm"
            >
              {loading ? '测试中...' : '测试 Supabase 连接'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">数据库连接</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCheckDatabase}
              disabled={loading}
              className="w-full text-xs"
              size="sm"
            >
              {loading ? '检查中...' : '检查数据库连接'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">网络测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestNetwork}
              disabled={loading}
              className="w-full text-xs"
              size="sm"
            >
              {loading ? '测试中...' : '测试网络连接'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">项目检查</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleCheckProject}
              disabled={loading}
              className="w-full text-xs"
              size="sm"
            >
              {loading ? '检查中...' : '检查 Supabase 项目'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">简单查询测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestSimpleQuery}
              disabled={loading}
              className="w-full text-xs"
              size="sm"
            >
              {loading ? '测试中...' : '测试简单查询'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {simpleQueryResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>简单查询测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>状态:</strong>{' '}
                {simpleQueryResult.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div>
                <strong>消息:</strong> {simpleQueryResult.message}
              </div>
              {simpleQueryResult.results && (
                <div className="space-y-2">
                  <div>
                    <strong>表名测试:</strong>
                    <div className="ml-4 space-y-1">
                      {Object.entries(simpleQueryResult.results).map(
                        ([tableName, result]: [string, any]) => {
                          if (tableName === 'rlsStatus') return null
                          return (
                            <div key={tableName}>
                              {tableName}:{' '}
                              {result.error
                                ? `❌ ${result.error.message}`
                                : '✅ 成功'}
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <strong>完整结果:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(simpleQueryResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {projectResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supabase 项目检查结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>状态:</strong>{' '}
                {projectResult.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div>
                <strong>消息:</strong> {projectResult.message}
              </div>
              {projectResult.results && (
                <div className="space-y-2">
                  <div>
                    <strong>项目信息:</strong>
                    <div className="ml-4 space-y-1">
                      <div>
                        项目 ID: {projectResult.results.projectInfo.projectId}
                      </div>
                      <div>
                        主机名: {projectResult.results.projectInfo.hostname}
                      </div>
                      <div>
                        协议: {projectResult.results.projectInfo.protocol}
                      </div>
                    </div>
                  </div>
                  <div>
                    <strong>API 端点测试:</strong>
                    <div className="ml-4 space-y-1">
                      {Object.entries(projectResult.results.endpoints).map(
                        ([endpoint, result]: [string, any]) => (
                          <div key={endpoint}>
                            {endpoint}:{' '}
                            {result.success
                              ? `✅ ${result.status}`
                              : `❌ ${result.error}`}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <strong>完整结果:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(projectResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {networkResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>网络测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>状态:</strong>{' '}
                {networkResult.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div>
                <strong>消息:</strong> {networkResult.message}
              </div>
              {networkResult.results && (
                <div className="space-y-2">
                  <div>
                    <strong>URL 测试:</strong>
                    <div className="ml-4 space-y-1">
                      {Object.entries(networkResult.results.urlTests).map(
                        ([url, result]: [string, any]) => (
                          <div key={url}>
                            {url}:{' '}
                            {result.success ? '✅ 成功' : `❌ ${result.error}`}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <strong>DNS 测试:</strong>
                    {networkResult.results.dnsTest.success
                      ? '✅ 成功'
                      : `❌ ${networkResult.results.dnsTest.error}`}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <strong>完整结果:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(networkResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {authResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>认证调试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>状态:</strong>{' '}
                {authResult.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div>
                <strong>消息:</strong> {authResult.message}
              </div>
              {authResult.testError && (
                <div>
                  <strong>测试错误:</strong> {authResult.testError}
                </div>
              )}
              {authResult.userError && (
                <div>
                  <strong>用户错误:</strong> {authResult.userError}
                </div>
              )}
              <div className="mt-4">
                <strong>完整结果:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(authResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {connectionResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Supabase 连接测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>状态:</strong>{' '}
                {connectionResult.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div>
                <strong>消息:</strong> {connectionResult.message}
              </div>
              {connectionResult.results && (
                <div className="space-y-2">
                  <div>
                    <strong>UserProfile 表:</strong>
                    {connectionResult.results.userProfile.error
                      ? `❌ ${connectionResult.results.userProfile.error.message}`
                      : '✅ 正常'}
                  </div>
                  <div>
                    <strong>Post 表:</strong>
                    {connectionResult.results.post.error
                      ? `❌ ${connectionResult.results.post.error.message}`
                      : '✅ 正常'}
                  </div>
                  <div>
                    <strong>PDFAnnotation 表:</strong>
                    {connectionResult.results.pdfAnnotation.error
                      ? `❌ ${connectionResult.results.pdfAnnotation.error.message}`
                      : '✅ 正常'}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <strong>完整结果:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(connectionResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {dbResult && (
        <Card>
          <CardHeader>
            <CardTitle>数据库连接检查结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <strong>状态:</strong>{' '}
                {dbResult.success ? '✅ 成功' : '❌ 失败'}
              </div>
              <div>
                <strong>消息:</strong> {dbResult.message}
              </div>
              {dbResult.results && (
                <div className="space-y-2">
                  <div>
                    <strong>环境变量:</strong>
                    <div className="ml-4 space-y-1">
                      <div>
                        URL:{' '}
                        {dbResult.results.envVars.hasUrl
                          ? '✅ 存在'
                          : '❌ 缺失'}
                      </div>
                      <div>
                        Service Role:{' '}
                        {dbResult.results.envVars.hasServiceRole
                          ? '✅ 存在'
                          : '❌ 缺失'}
                      </div>
                      <div>
                        Database URL:{' '}
                        {dbResult.results.envVars.hasDatabaseUrl
                          ? '✅ 存在'
                          : '❌ 缺失'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <strong>简单查询:</strong>
                    {dbResult.results.simpleQuery.error
                      ? `❌ ${dbResult.results.simpleQuery.error.message}`
                      : '✅ 正常'}
                  </div>
                  <div>
                    <strong>RPC 调用:</strong>
                    {dbResult.results.rpcCall.error
                      ? `❌ ${dbResult.results.rpcCall.error.message}`
                      : '✅ 正常'}
                  </div>
                </div>
              )}
              <div className="mt-4">
                <strong>完整结果:</strong>
                <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                  {JSON.stringify(dbResult, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
