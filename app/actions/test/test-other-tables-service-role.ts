'use server'

import { createAdminClient } from '@/utils/supabase/server'

export async function testOtherTablesServiceRole() {
  const supabase = await createAdminClient()
  const results: any = {}

  // 测试其他表
  const tableNames = ['UserProfile', 'Post', 'Category']

  for (const tableName of tableNames) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      results[tableName] = {
        success: !error,
        error: error?.message || null,
        data: data ? 'Data found' : 'No data',
      }
    } catch (err) {
      results[tableName] = {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        data: null,
      }
    }
  }

  return results
}
