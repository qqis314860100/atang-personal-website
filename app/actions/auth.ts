'use server'

import { registerSchema, type TRegisterSchema } from '@/schemas/registerSchema'
import { signInSchema, TSignInSchema } from '@/schemas/signInSchema'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const register = async (credentials: TRegisterSchema) => {
  // 检查环境变量
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log(
    'SERVICE_ROLE:',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE ? '存在' : '不存在'
  )

  const supabase = await createAdminClient()

  const validatedFields = registerSchema.safeParse(credentials)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    }
  }
  const { username, email, password, confirmPassword } = credentials

  // 1. 检查邮箱是否已存在
  const userList = (await supabase.auth.admin.listUsers()).data.users.find(
    (user) => user.email === email
  )
  if (userList) {
    return {
      status: 'error',
      message: '邮箱已存在,请确认~',
    }
  }

  // 2. 检查用户名是否已存在
  const { data: existingUsers, error: usernameError } = await supabase
    .from('UserProfile')
    .select('id')
    .eq('username', username)
    .limit(1)

  if (usernameError) {
    console.log('existingEmailError', usernameError)
    return {
      status: 'error',
      message: usernameError.message || '用户名不合法~',
    }
  }
  if (existingUsers && existingUsers.length > 0) {
    return {
      status: 'error',
      message: ' ',
    }
  }

  // 在supabase的私有auth.user表中创建一个新的认证用户，它不会自动在UserProfile表中创建对应的用户资料
  // auth.users表的结构固定了，主要包含id,email,encrypted_password等核心认证信息,Supabase 提供了 raw_user_meta_data 这个“杂物间”存储额外信息（如用户名、头像url等）
  const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      // 存储非核心信息
      data: {
        username: username,
      },
    },
  })

  if (signUpError) {
    return { status: 'error', message: signUpError.message }
  } else if (!signUpData.user || signUpData.user.identities?.length === 0) {
    return { status: 'error', message: '创建账号失败,请稍后重试~' }
  }

  // 注册成功后，在 UserProfile 表中手动创建对应的用户资料
  const { error: profileError } = await supabase.from('UserProfile').insert({
    id: signUpData.user.id,
    username: username,
    email: email,
    updatedAt: new Date().toISOString(), // 添加当前时间
  })

  if (profileError) {
    // 注意：这里认证用户已创建，但资料创建失败。
    // 在生产环境中可能需要更复杂的处理，比如删除已创建的认证用户。
    // 此处为简单起见，仅返回错误。
    return {
      status: 'error',
      message: '创建用户资料失败: ' + profileError.message,
    }
  }

  return {
    status: 'success',
    message: '请查看您的电子邮件以获取确认信息~',
    user: signUpData.user,
  }
}

export async function signIn(credentials: TSignInSchema, locale: string) {
  const supabase = await createAdminClient()

  const validation = signInSchema.safeParse(credentials)
  if (!validation.success) {
    return {
      status: 'error',
      message: validation.error.issues[0]?.message ?? '请求不合法',
      user: null,
    }
  }

  const { error, data } = await supabase.auth.signInWithPassword(credentials)

  if (error) {
    return { status: 'error', message: error.message, error, user: null }
  }

  const username = data?.user?.user_metadata?.username

  console.log('error -----1', username, error)

  if (!username || typeof username !== 'string') {
    return { status: 'error', message: '认证失败,用户名非法', error }
  }

  // 检查用户资料是否存在
  const { data: userData, error: userError } = await supabase
    .from('UserProfile')
    .select('id')
    .eq('id', data.user.id)
    .limit(1)
    .single()

  console.log('userError -----2', userError)

  // 如果用户资料不存在，创建它
  if (!userData) {
    const { error: insertError } = await supabase.from('UserProfile').insert({
      id: data.user.id,
      username: username,
      email: data.user.email,
    })

    if (insertError) {
      return { status: 'error', message: insertError?.message, user: null }
    }
  }

  const { data: userProfile, error: profileError } = await supabase
    .from('UserProfile')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (profileError || !userProfile) {
    return { status: 'error', message: 'User profile not found.' }
  }

  revalidatePath(`/${locale}`)
  return {
    status: 'success',
    message: '登录成功~',
    user: userProfile,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  }
}

export async function resendVerificationEmail(email: string) {
  'use server'

  if (!email) {
    return { status: 'error', message: 'Email is required.' }
  }

  const supabase = await createAdminClient()

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  })

  if (error) {
    return { status: 'error', message: error.message }
  }

  return {
    status: 'success',
    message: 'Verification email sent. Please check your inbox.',
  }
}
