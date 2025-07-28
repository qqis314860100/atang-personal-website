'use server'

export async function debugEnvironmentVariables() {
  return {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRole: !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    serviceRoleLength:
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE?.length || 0,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'N/A',
    anonKeyPrefix:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'N/A',
    serviceRolePrefix:
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE?.substring(0, 20) || 'N/A',
  }
}
