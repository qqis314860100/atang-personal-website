import Link from 'next/link'
import { useI18n } from '@/app/hooks/use-i18n'

const NotFound = () => {
  const t = useI18n()

  return (
    <main className="grid min-h-full place-items-center px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-neutral">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary sm:text-5xl">
          {t.common('没有找到页面')}
        </h1>
        <p className="mt-6 text-base leading-7 text-neutral">
          {t.common('抱歉，我们找不到您正在寻找的页面。')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/" className="btn btn-primary transition">
            {t.common('返回首页')}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFound
