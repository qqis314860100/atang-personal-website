import { routing } from '@/i18n/routing'
import { redirect } from 'next/navigation'

export default function LoginRootRedirect() {
  redirect(`/${routing.defaultLocale}/login`)
}
