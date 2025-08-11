import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2 } from 'lucide-react'

interface PasswordChangedAlertProps {
  reason?: string
}

export default function PasswordChangedAlert({
  reason,
}: PasswordChangedAlertProps) {
  if (reason !== 'password_changed') {
    return null
  }

  return (
    <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertTitle>密码已更新</AlertTitle>
      <AlertDescription>
        您的密码已成功更新，请使用新密码登录。
      </AlertDescription>
    </Alert>
  )
}
