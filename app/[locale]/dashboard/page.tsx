// app/[locale]/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useStableUser } from '@/lib/query-hook/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertCircle,
  Play,
  Square,
  Clock,
  Users,
  UserPlus,
  FileText,
  Laptop,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { AnimatedCard, AnimatedButton } from '@/components/ui/animated-card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  getDashboardStats,
  getWorkTimeData,
  getOnboardingTasks,
  getCalendarEvents,
  getCurrentWorkTime,
  updateTaskStatus,
  type DashboardStats,
  type WorkTimeData,
  type OnboardingTask,
  type CalendarEvent,
} from '@/lib/services/dashboard-data'

export default function DashboardPage() {
  const { user, isLoading } = useStableUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectFrom = searchParams.get('redirectFrom')
  const locale = useLocale()

  // 状态管理
  const [authState, setAuthState] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [workTimeData, setWorkTimeData] = useState<WorkTimeData[]>([])
  const [tasks, setTasks] = useState<OnboardingTask[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentWorkTime, setCurrentWorkTime] = useState('00:00')
  const [isTracking, setIsTracking] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  )

  // 用户登录状态
  useEffect(() => {
    if (!isLoading) {
      setAuthState(user ? 'authenticated' : 'unauthenticated')
    }
  }, [user, isLoading])

  // 加载数据
  useEffect(() => {
    if (authState === 'authenticated') {
      loadDashboardData()
    }
  }, [authState])

  const loadDashboardData = async () => {
    try {
      const [statsData, workTimeData, tasksData, eventsData, workTime] =
        await Promise.all([
          getDashboardStats(),
          getWorkTimeData(),
          getOnboardingTasks(),
          getCalendarEvents(),
          getCurrentWorkTime(),
        ])

      setStats(statsData)
      setWorkTimeData(workTimeData)
      setTasks(tasksData)
      setEvents(eventsData)
      setCurrentWorkTime(workTime)
    } catch (error) {
      console.error('加载仪表盘数据失败:', error)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpandedSections = new Set(expandedSections)
    if (newExpandedSections.has(sectionId)) {
      newExpandedSections.delete(sectionId)
    } else {
      newExpandedSections.add(sectionId)
    }
    setExpandedSections(newExpandedSections)
  }

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskStatus(taskId, completed)
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed } : task
        )
      )
    } catch (error) {
      console.error('更新任务状态失败:', error)
    }
  }

  const toggleTimeTracking = () => {
    setIsTracking(!isTracking)
  }

  if (isLoading || authState === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  // 如果已登录，显示仪表盘内容
  if (authState === 'authenticated') {
    return (
      <div className="h-full px-6 pb-6 overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-200">
        {/* 欢迎横幅 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome back, {user?.username || 'Nixtio'}
          </h1>

          {/* 进度条概览 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Interviews</span>
                <span className="font-bold text-gray-800">
                  {stats?.interviews || 0}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-700 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.interviews || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Hired</span>
                <span className="font-bold text-gray-800">
                  {stats?.hired || 0}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.hired || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Project time</span>
                <span className="font-bold text-gray-800">
                  {stats?.projectTime || 0}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.projectTime || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Output</span>
                <span className="font-bold text-gray-800">
                  {stats?.output || 0}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats?.output || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 - 三列布局 */}
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)] overflow-hidden">
          {/* 左侧列 - 用户资料和可折叠列表 */}
          <div className="col-span-2 space-y-4 overflow-y-auto">
            {/* 用户资料卡片 */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 ring-4 ring-amber-100 mb-4">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                      {user?.username?.charAt(0) || 'L'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {user?.username || 'Lora Piterson'}
                  </h3>
                  <p className="text-gray-500 mb-4 text-sm">
                    {user?.bio || 'UX/UI Designer'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 可折叠列表 */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    {
                      id: 'pension',
                      title: 'Pension contributions',
                      icon: null,
                    },
                    {
                      id: 'devices',
                      title: 'Devices',
                      icon: <Laptop className="w-5 h-5 text-gray-400" />,
                      content: ['MacBook Air', 'Version M1'],
                    },
                    {
                      id: 'compensation',
                      title: 'Compensation Summary',
                      icon: null,
                    },
                    {
                      id: 'benefits',
                      title: 'Employee Benefits',
                      icon: null,
                    },
                  ].map((section) => (
                    <Collapsible
                      key={section.id}
                      open={expandedSections.has(section.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-200"
                          title={`点击${
                            expandedSections.has(section.id) ? '收起' : '展开'
                          } ${section.title}`}
                        >
                          <div className="flex items-center gap-3">
                            {section.icon}
                            <span className="text-gray-700 font-medium text-sm">
                              {section.title}
                            </span>
                          </div>
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 transition-transform" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      {section.content && (
                        <CollapsibleContent className="ml-8 space-y-2 mt-2">
                          {section.content.map((item, index) => (
                            <div
                              key={index}
                              className="text-gray-600 text-xs pl-2"
                            >
                              {item}
                            </div>
                          ))}
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间列 - 进度、时间追踪、日历 */}
          <div className="col-span-8 space-y-4 overflow-y-auto">
            {/* 上半部分：Progress 和 Time tracker 并排 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 进度卡片 */}
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-gray-800 mb-2">
                      {workTimeData
                        .reduce((sum, day) => sum + day.hours, 0)
                        .toFixed(1)}{' '}
                      h
                    </p>
                    <p className="text-gray-500 text-sm">Work Time this week</p>
                  </div>
                  {/* 柱状图 */}
                  <div className="flex items-end justify-between h-24">
                    {workTimeData.map((day, index) => (
                      <div key={day.day} className="flex flex-col items-center">
                        <div
                          className={`w-6 rounded-t-xl transition-all duration-300 cursor-pointer ${
                            day.isHighlighted
                              ? 'bg-amber-500 shadow-lg'
                              : 'bg-gray-300 hover:bg-gray-400'
                          } mb-2 hover:scale-110`}
                          style={{ height: `${(day.hours / 10) * 100}%` }}
                          title={`${day.day}: ${day.hours}小时`}
                        ></div>
                        <span className="text-xs text-gray-600 font-medium">
                          {day.day}
                        </span>
                        {day.isHighlighted && (
                          <span className="text-xs text-amber-600 mt-1 font-bold">
                            {day.hours}h
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 时间追踪器卡片 */}
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-gray-800">
                    Time tracker
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-200 flex items-center justify-center bg-white shadow-sm">
                      <span className="text-xl font-bold text-gray-800">
                        {currentWorkTime}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-3 text-sm font-medium">
                      Work Time
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <AnimatedButton
                      size="sm"
                      onClick={toggleTimeTracking}
                      className={
                        isTracking
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }
                      title={isTracking ? '停止计时' : '开始计时'}
                    >
                      {isTracking ? (
                        <Square className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </AnimatedButton>
                    <AnimatedButton
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-gray-300"
                      title="重置计时器"
                    >
                      <Clock className="w-4 h-4" />
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 下半部分：Calendar 占据底部 */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Calendar
                </CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  September 2024
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      title={`${event.title} - ${event.time}`}
                    >
                      <div className="text-center min-w-[40px]">
                        <p className="text-sm font-bold text-gray-800">
                          {event.date.split(' ')[1]}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.date.split(' ')[0]}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                      <div className="flex -space-x-1">
                        {Array.from({ length: event.participants }, (_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧列 - 关键指标、入职进度、任务列表 */}
          <div className="col-span-2 space-y-4 overflow-y-auto">
            {/* 关键指标卡片 - 垂直排列 */}
            <div className="space-y-3">
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-gray-100 rounded-xl mb-3">
                      <Users className="w-5 h-5 text-gray-700" />
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {stats?.employees || 0}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">
                      Employees
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-green-100 rounded-xl mb-3">
                      <UserPlus className="w-5 h-5 text-green-700" />
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {stats?.hirings || 0}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">Hirings</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="p-3 bg-amber-100 rounded-xl mb-3">
                      <FileText className="w-5 h-5 text-amber-700" />
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {stats?.projects || 0}
                    </p>
                    <p className="text-gray-500 text-xs font-medium">
                      Projects
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 入职进度卡片 */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(
                      (tasks.filter((t) => t.completed).length / tasks.length) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-gray-500 text-sm font-medium">
                    Total Progress
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium text-gray-600">Task</span>
                      <span className="font-bold text-gray-800">30%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[30%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium text-gray-600">
                        Documentation
                      </span>
                      <span className="font-bold text-gray-800">25%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full w-[25%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium text-gray-600">
                        Training
                      </span>
                      <span className="font-bold text-gray-800">0%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full w-[0%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 入职任务列表卡片 */}
            <Card className="bg-gray-800 border border-gray-700 shadow-sm rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-white">
                  Onboarding Task
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  {tasks.filter((t) => t.completed).length}/{tasks.length}{' '}
                  completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleTaskToggle(task.id, !task.completed)
                        }
                        className={`w-4 h-4 rounded-full border border-white flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                          task.completed
                            ? 'bg-amber-500 border-amber-500 hover:bg-amber-600'
                            : 'hover:border-gray-300'
                        }`}
                        title={task.completed ? '标记为未完成' : '标记为已完成'}
                      >
                        {task.completed && (
                          <svg
                            className="w-2 h-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            task.completed
                              ? 'line-through text-gray-500'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {task.date} • {task.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // 如果未登录，显示登录提示
  return (
    <div className="h-full flex items-center justify-center px-6">
      <AnimatedCard>
        <Card className="rounded-3xl max-w-md w-full">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>您需要登录才能访问完整功能</CardDescription>
          </CardHeader>
          <CardContent>
            {redirectFrom && (
              <Alert className="mb-4 rounded-2xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>访问受限</AlertTitle>
                <AlertDescription>
                  您尝试访问的页面需要登录才能查看
                </AlertDescription>
              </Alert>
            )}
            <p className="text-muted-foreground mb-4">
              请登录您的账号以访问所有功能，或者注册一个新账号。
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AnimatedButton
              className="flex-1 rounded-2xl"
              onClick={() => {
                const loginPath = `/${locale}/login`
                const url = new URL(loginPath, window.location.origin)
                if (redirectFrom) {
                  url.searchParams.set('redirectTo', redirectFrom)
                }
                router.push(url.toString())
              }}
            >
              登录
            </AnimatedButton>
            <AnimatedButton
              className="flex-1 rounded-2xl"
              variant="outline"
              onClick={() => router.push(`/${locale}`)}
            >
              返回首页
            </AnimatedButton>
          </CardFooter>
        </Card>
      </AnimatedCard>
    </div>
  )
}
