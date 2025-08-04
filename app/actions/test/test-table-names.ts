'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function testTableNames() {
  const supabase = await createAdminClient()
  const results: any = {}

  // 测试不同的表名格式
  const tableNames = [
    'PDFAnnotation',
    'pdfannotation',
    '"PDFAnnotation"',
    '"pdfannotation"',
    'public.PDFAnnotation',
    'public.pdfannotation',
  ]

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
