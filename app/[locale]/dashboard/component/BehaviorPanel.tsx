import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MousePointer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import React from 'react'

export default function BehaviorPanel({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="w-5 h-5" />
          用户交互分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.userInteractions.map((interaction: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  {interaction.action}
                </span>
              </div>
              <Badge variant="outline">
                {interaction.count.toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
