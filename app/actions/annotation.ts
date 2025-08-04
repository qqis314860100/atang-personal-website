'use server'

import { createAdminClient } from '@/lib/supabase/server'
import {
  PDFAnnotation,
  CreateAnnotationData,
  UpdateAnnotationData,
} from '@/types/pdf'

// 获取用户的所有注释
export async function getAnnotations(
  pdfUrl?: string
): Promise<PDFAnnotation[]> {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('认证检查:', { user: user?.id, authError })

    if (authError || !user) {
      throw new Error('未授权访问')
    }

    // 构建查询
    let query = supabase.from('PDFAnnotation').select('*').eq('userId', user.id)

    // 如果指定了PDF URL，则过滤
    if (pdfUrl) {
      query = query.eq('pdfUrl', pdfUrl)
    }

    // 按创建时间排序
    query = query.order('createdAt', { ascending: false })

    const { data: annotations, error } = await query

    if (error) {
      console.error('获取注释失败:', error)
      throw new Error('获取注释失败')
    }

    return annotations || []
  } catch (error) {
    console.error('获取注释异常:', error)
    return []
  }
}

// 创建新注释
export async function createAnnotation(
  annotation: CreateAnnotationData
): Promise<PDFAnnotation | null> {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('未授权访问')
    }

    const { pdfUrl, x, y, text, page } = annotation

    // 验证必填字段
    if (!pdfUrl || x === undefined || y === undefined || !text || !page) {
      throw new Error('缺少必填字段')
    }

    // 创建注释
    const { data: newAnnotation, error } = await supabase
      .from('PDFAnnotation')
      .insert({
        userId: user.id,
        pdfUrl,
        x,
        y,
        text,
        page,
      })
      .select()
      .single()

    if (error) {
      console.error('创建注释失败:', error)
      throw new Error('创建注释失败')
    }

    return newAnnotation
  } catch (error) {
    console.error('创建注释异常:', error)
    return null
  }
}

// 更新注释
export async function updateAnnotation(
  id: string,
  updates: UpdateAnnotationData
): Promise<PDFAnnotation | null> {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('未授权访问')
    }

    if (!id) {
      throw new Error('缺少注释ID')
    }

    // 验证注释所有权
    const { data: existingAnnotation, error: checkError } = await supabase
      .from('PDFAnnotation')
      .select('id')
      .eq('id', id)
      .eq('userId', user.id)
      .single()

    if (checkError || !existingAnnotation) {
      throw new Error('注释不存在或无权限')
    }

    // 更新注释
    const updateData: any = {}
    if (updates.text !== undefined) updateData.text = updates.text
    if (updates.x !== undefined) updateData.x = updates.x
    if (updates.y !== undefined) updateData.y = updates.y
    if (updates.page !== undefined) updateData.page = updates.page

    const { data: annotation, error } = await supabase
      .from('PDFAnnotation')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新注释失败:', error)
      throw new Error('更新注释失败')
    }

    return annotation
  } catch (error) {
    console.error('更新注释异常:', error)
    return null
  }
}

// 删除注释
export async function deleteAnnotation(id: string): Promise<boolean> {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('未授权访问')
    }

    if (!id) {
      throw new Error('缺少注释ID')
    }

    // 验证注释所有权并删除
    const { error } = await supabase
      .from('PDFAnnotation')
      .delete()
      .eq('id', id)
      .eq('userId', user.id)

    if (error) {
      console.error('删除注释失败:', error)
      throw new Error('删除注释失败')
    }

    return true
  } catch (error) {
    console.error('删除注释异常:', error)
    return false
  }
}

// 批量同步注释（用于本地到云端的同步）
export async function syncAnnotations(
  annotations: PDFAnnotation[],
  pdfUrl: string
): Promise<boolean> {
  try {
    // 获取云端现有注释
    const cloudAnnotations = await getAnnotations(pdfUrl)
    const cloudAnnotationIds = new Set(cloudAnnotations.map((a) => a.id))

    // 过滤出需要创建的注释（本地有但云端没有的）
    const newAnnotations = annotations.filter(
      (a) => !cloudAnnotationIds.has(a.id)
    )

    // 批量创建新注释
    const createPromises = newAnnotations.map((annotation) =>
      createAnnotation({
        pdfUrl: annotation.pdfUrl,
        x: annotation.x,
        y: annotation.y,
        text: annotation.text,
        page: annotation.page,
      })
    )

    await Promise.all(createPromises)
    return true
  } catch (error) {
    console.error('同步注释失败:', error)
    return false
  }
}
