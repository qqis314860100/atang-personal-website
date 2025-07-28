'use client'

import { useState } from 'react'
import { testDatabaseConnection } from '@/app/actions/test-db'
import { testAdminConnection } from '@/app/actions/test-admin'
import { testOtherTables } from '@/app/actions/test-other-tables'
import { testServiceRoleConnection } from '@/app/actions/test-service-role'
import { debugEnvironmentVariables } from '@/app/actions/debug-env'
import { testTableNames } from '@/app/actions/test-table-names'
import { testOtherTablesServiceRole } from '@/app/actions/test-other-tables-service-role'

export default function TestDBPage() {
  const [result, setResult] = useState<any>(null)
  const [adminResult, setAdminResult] = useState<any>(null)
  const [otherTablesResult, setOtherTablesResult] = useState<any>(null)
  const [serviceRoleResult, setServiceRoleResult] = useState<any>(null)
  const [envResult, setEnvResult] = useState<any>(null)
  const [tableNamesResult, setTableNamesResult] = useState<any>(null)
  const [otherTablesServiceRoleResult, setOtherTablesServiceRoleResult] =
    useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [otherTablesLoading, setOtherTablesLoading] = useState(false)
  const [serviceRoleLoading, setServiceRoleLoading] = useState(false)
  const [envLoading, setEnvLoading] = useState(false)
  const [tableNamesLoading, setTableNamesLoading] = useState(false)
  const [otherTablesServiceRoleLoading, setOtherTablesServiceRoleLoading] =
    useState(false)

  const handleTest = async () => {
    setLoading(true)
    try {
      const testResult = await testDatabaseConnection()
      setResult(testResult)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : '未知错误' })
    } finally {
      setLoading(false)
    }
  }

  const handleAdminTest = async () => {
    setAdminLoading(true)
    try {
      const testResult = await testAdminConnection()
      setAdminResult(testResult)
    } catch (error) {
      setAdminResult({
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setAdminLoading(false)
    }
  }

  const handleOtherTablesTest = async () => {
    setOtherTablesLoading(true)
    try {
      const testResult = await testOtherTables()
      setOtherTablesResult(testResult)
    } catch (error) {
      setOtherTablesResult({
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setOtherTablesLoading(false)
    }
  }

  const handleServiceRoleTest = async () => {
    setServiceRoleLoading(true)
    try {
      const testResult = await testServiceRoleConnection()
      setServiceRoleResult(testResult)
    } catch (error) {
      setServiceRoleResult({
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setServiceRoleLoading(false)
    }
  }

  const handleEnvTest = async () => {
    setEnvLoading(true)
    try {
      const testResult = await debugEnvironmentVariables()
      setEnvResult(testResult)
    } catch (error) {
      setEnvResult({
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setEnvLoading(false)
    }
  }

  const handleTableNamesTest = async () => {
    setTableNamesLoading(true)
    try {
      const testResult = await testTableNames()
      setTableNamesResult(testResult)
    } catch (error) {
      setTableNamesResult({
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setTableNamesLoading(false)
    }
  }

  const handleOtherTablesServiceRoleTest = async () => {
    setOtherTablesServiceRoleLoading(true)
    try {
      const testResult = await testOtherTablesServiceRole()
      setOtherTablesServiceRoleResult(testResult)
    } catch (error) {
      setOtherTablesServiceRoleResult({
        error: error instanceof Error ? error.message : '未知错误',
      })
    } finally {
      setOtherTablesServiceRoleLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">数据库连接测试</h1>

      <div className="space-y-4">
        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试普通用户连接'}
        </button>

        <button
          onClick={handleAdminTest}
          disabled={adminLoading}
          className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {adminLoading ? '测试中...' : '测试管理员连接'}
        </button>

        <button
          onClick={handleOtherTablesTest}
          disabled={otherTablesLoading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {otherTablesLoading ? '测试中...' : '测试其他表连接'}
        </button>

        <button
          onClick={handleServiceRoleTest}
          disabled={serviceRoleLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {serviceRoleLoading ? '测试中...' : '测试服务角色连接'}
        </button>

        <button
          onClick={handleEnvTest}
          disabled={envLoading}
          className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {envLoading ? '测试中...' : '检查环境变量'}
        </button>

        <button
          onClick={handleTableNamesTest}
          disabled={tableNamesLoading}
          className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {tableNamesLoading ? '测试中...' : '测试表名格式'}
        </button>

        <button
          onClick={handleOtherTablesServiceRoleTest}
          disabled={otherTablesServiceRoleLoading}
          className="bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-4"
        >
          {otherTablesServiceRoleLoading ? '测试中...' : '测试其他表服务角色'}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">普通用户测试结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {adminResult && (
        <div className="mt-4 p-4 bg-red-100 rounded">
          <h2 className="font-bold mb-2">管理员测试结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(adminResult, null, 2)}
          </pre>
        </div>
      )}

      {otherTablesResult && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h2 className="font-bold mb-2">其他表测试结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(otherTablesResult, null, 2)}
          </pre>
        </div>
      )}

      {serviceRoleResult && (
        <div className="mt-4 p-4 bg-purple-100 rounded">
          <h2 className="font-bold mb-2">服务角色测试结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(serviceRoleResult, null, 2)}
          </pre>
        </div>
      )}

      {envResult && (
        <div className="mt-4 p-4 bg-yellow-100 rounded">
          <h2 className="font-bold mb-2">环境变量检查结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(envResult, null, 2)}
          </pre>
        </div>
      )}

      {tableNamesResult && (
        <div className="mt-4 p-4 bg-orange-100 rounded">
          <h2 className="font-bold mb-2">表名格式测试结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(tableNamesResult, null, 2)}
          </pre>
        </div>
      )}

      {otherTablesServiceRoleResult && (
        <div className="mt-4 p-4 bg-indigo-100 rounded">
          <h2 className="font-bold mb-2">其他表服务角色测试结果:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(otherTablesServiceRoleResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
