import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EnvelopeClosedIcon, ReloadIcon } from '@radix-ui/react-icons'

interface ForgotPasswordFormProps {
  isDialog?: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
  onLogin?: () => void
  onBackToLogin?: () => void
  t: any
}

export default function ForgotPasswordForm({
  isDialog = false,
  onSubmit,
  isPending,
  onLogin,
  onBackToLogin,
  t,
}: ForgotPasswordFormProps) {
  const btnCls =
    'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="reset-email"
          className={isDialog ? 'flex items-center gap-2' : ''}
        >
          {isDialog && <EnvelopeClosedIcon className="h-4 w-4" />}
          {t.auth('电子邮箱')}
        </Label>
        <Input
          id="reset-email"
          name="email"
          type="email"
          placeholder="请输入邮箱"
          autoComplete="email"
          required
          className={
            isDialog
              ? 'transition-all duration-200 focus:ring-2 focus:ring-orange-500'
              : ''
          }
        />
      </div>

      {isDialog ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onLogin}
            className="flex-1"
          >
            {t.auth('返回登录')}
          </Button>
          <Button type="submit" disabled={isPending} className={btnCls}>
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                {t.auth('处理中...')}
              </>
            ) : (
              <>
                <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                {t.auth('发送重置链接')}
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                处理中...
              </>
            ) : (
              '发送重置链接'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBackToLogin}
          >
            返回登录
          </Button>
        </div>
      )}
    </form>
  )
}
