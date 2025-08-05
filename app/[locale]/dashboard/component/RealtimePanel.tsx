import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Clock, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'

export default function RealtimePanel({
  data,
  isTracking,
  toggleTracking,
}: {
  data: any
  isTracking: boolean
  toggleTracking: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          实时监控
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {data.realTimeUsers}
            </p>
            <p className="text-sm text-gray-500">当前在线用户</p>
          </div>
          <Button
            onClick={toggleTracking}
            variant={isTracking ? 'destructive' : 'default'}
          >
            {isTracking ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                停止追踪
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                开始追踪
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
