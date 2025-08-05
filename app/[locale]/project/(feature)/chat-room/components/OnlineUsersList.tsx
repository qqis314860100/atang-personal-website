'use client'

import { Users, User } from 'lucide-react'

interface OnlineUser {
  id: string
  username: string
  timestamp: Date
}

interface OnlineUsersListProps {
  users: OnlineUser[]
}

export function OnlineUsersList({ users }: OnlineUsersListProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Users className="h-4 w-4" />
        在线用户 ({users.length})
      </div>
      {users.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-4">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>暂无在线用户</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {user.username}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(user.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
