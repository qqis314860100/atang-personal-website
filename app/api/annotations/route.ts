import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

// 获取用户的所有注释
export const GET = async (req: NextRequest) => {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 获取查询参数
    const { searchParams } = new URL(req.url)
    const pdfUrl = searchParams.get('pdfUrl')

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
      return NextResponse.json({ error: '获取注释失败' }, { status: 500 })
    }

    return NextResponse.json({ annotations })
  } catch (error) {
    console.error('获取注释异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 创建新注释
export const POST = async (req: NextRequest) => {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await req.json()
    const { pdfUrl, x, y, text, page } = body

    // 验证必填字段
    if (!pdfUrl || x === undefined || y === undefined || !text || !page) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    // 创建注释
    const { data: annotation, error } = await supabase
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
      return NextResponse.json({ error: '创建注释失败' }, { status: 500 })
    }

    return NextResponse.json({ annotation })
  } catch (error) {
    console.error('创建注释异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 更新注释
export const PUT = async (req: NextRequest) => {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await req.json()
    const { id, text, x, y, page } = body

    if (!id) {
      return NextResponse.json({ error: '缺少注释ID' }, { status: 400 })
    }

    // 验证注释所有权
    const { data: existingAnnotation, error: checkError } = await supabase
      .from('PDFAnnotation')
      .select('id')
      .eq('id', id)
      .eq('userId', user.id)
      .single()

    if (checkError || !existingAnnotation) {
      return NextResponse.json({ error: '注释不存在或无权限' }, { status: 404 })
    }

    // 更新注释
    const updateData: any = {}
    if (text !== undefined) updateData.text = text
    if (x !== undefined) updateData.x = x
    if (y !== undefined) updateData.y = y
    if (page !== undefined) updateData.page = page

    const { data: annotation, error } = await supabase
      .from('PDFAnnotation')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新注释失败:', error)
      return NextResponse.json({ error: '更新注释失败' }, { status: 500 })
    }

    return NextResponse.json({ annotation })
  } catch (error) {
    console.error('更新注释异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 删除注释
export const DELETE = async (req: NextRequest) => {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少注释ID' }, { status: 400 })
    }

    // 验证注释所有权并删除
    const { error } = await supabase
      .from('PDFAnnotation')
      .delete()
      .eq('id', id)
      .eq('userId', user.id)

    if (error) {
      console.error('删除注释失败:', error)
      return NextResponse.json({ error: '删除注释失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除注释异常:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
