'use client'

import { useI18n } from '@/app/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function I18nExample() {
  const t = useI18n()
  console.log('t', t)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t.dashboard('个人信息')}</CardTitle>
          <CardDescription>
            {t.dashboard('请使用您可以接收邮件的永久地址。')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 使用嵌套键 */}
          <div className="space-y-2">
            <Label>{t.dashboard('名字')}</Label>
            <Input placeholder={t.dashboard('请输入您的名字')} />
          </div>

          <div className="space-y-2">
            <Label>{t.dashboard('姓氏')}</Label>
            <Input placeholder={t.dashboard('请输入您的姓氏')} />
          </div>

          <div className="space-y-2">
            <Label>{t.dashboard('电子邮件地址')}</Label>
            <Input placeholder={t.dashboard('请输入您的电子邮件')} />
          </div>

          {/* 使用上下文避免冲突 */}
          <div className="flex gap-2">
            <Button variant="outline">{t.dashboard('保存账户信息')}</Button>
            <Button variant="destructive">{t.dashboard('删除账户')}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.common('文件管理')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 通用操作按钮 */}
          <div className="flex gap-2">
            <Button>{t.common('上传文件')}</Button>
            <Button variant="outline">{t.common('预览')}</Button>
            <Button variant="outline">{t.common('下载')}</Button>
            <Button variant="outline">{t.common('编辑')}</Button>
            <Button variant="destructive">{t.common('删除')}</Button>
          </div>

          {/* 使用fallback */}
          <div className="text-sm text-gray-600">
            {t.common('这是一个不存在的key', { fallback: '这是fallback文本' })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>性能指标</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t.performance('首次内容绘制')}</Label>
              <div className="text-2xl font-bold text-green-600">优秀</div>
            </div>
            <div>
              <Label>{t.performance('最大内容绘制')}</Label>
              <div className="text-2xl font-bold text-yellow-600">良好</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>错误日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>{t.errorLogs('搜索错误类型、消息或页面...')}</span>
              <Button variant="outline" size="sm">
                {t.errorLogs('重试')}
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {t.errorLogs('加载中...')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
