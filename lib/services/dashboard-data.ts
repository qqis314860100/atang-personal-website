// Dashboard 数据服务
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  interviews: number
  hired: number
  projectTime: number
  output: number
  employees: number
  hirings: number
  projects: number
}

export interface WorkTimeData {
  day: string
  hours: number
  isHighlighted?: boolean
}

export interface OnboardingTask {
  id: string
  title: string
  completed: boolean
  date: string
  time: string
  category: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  participants: number
  type: 'meeting' | 'session' | 'review'
}

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar?: string
  role: string
  salary: number
  department: string
  joinDate: string
}

// 获取 Dashboard 统计数据
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()

  try {
    // 这里可以替换为真实的数据库查询
    // 目前返回模拟数据
    return {
      interviews: 15,
      hired: 15,
      projectTime: 60,
      output: 10,
      employees: 78,
      hirings: 56,
      projects: 203,
    }
  } catch (error) {
    console.error('获取 Dashboard 统计数据失败:', error)
    return {
      interviews: 0,
      hired: 0,
      projectTime: 0,
      output: 0,
      employees: 0,
      hirings: 0,
      projects: 0,
    }
  }
}

// 获取工作时间数据
export async function getWorkTimeData(): Promise<WorkTimeData[]> {
  try {
    return [
      { day: 'Mon', hours: 8.5 },
      { day: 'Tue', hours: 7.2 },
      { day: 'Wed', hours: 6.8 },
      { day: 'Thu', hours: 8.1 },
      { day: 'Fri', hours: 5.23, isHighlighted: true },
      { day: 'Sat', hours: 3.5 },
      { day: 'Sun', hours: 2.1 },
    ]
  } catch (error) {
    console.error('获取工作时间数据失败:', error)
    return []
  }
}

// 获取入职任务列表
export async function getOnboardingTasks(): Promise<OnboardingTask[]> {
  try {
    return [
      {
        id: '1',
        title: 'Interview',
        completed: true,
        date: 'Sep 22',
        time: '10:00 AM',
        category: 'hr',
      },
      {
        id: '2',
        title: 'Team Meeting',
        completed: true,
        date: 'Sep 23',
        time: '2:00 PM',
        category: 'team',
      },
      {
        id: '3',
        title: 'Project Update',
        completed: false,
        date: 'Sep 24',
        time: '9:00 AM',
        category: 'project',
      },
      {
        id: '4',
        title: 'Discuss Q3 Goals',
        completed: false,
        date: 'Sep 25',
        time: '11:00 AM',
        category: 'planning',
      },
      {
        id: '5',
        title: 'HR Policy Review',
        completed: false,
        date: 'Sep 26',
        time: '3:00 PM',
        category: 'hr',
      },
    ]
  } catch (error) {
    console.error('获取入职任务失败:', error)
    return []
  }
}

// 获取日历事件
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    return [
      {
        id: '1',
        title: 'Weekly Team Sync',
        date: 'Sep 24',
        time: '9:00 AM',
        participants: 3,
        type: 'meeting',
      },
      {
        id: '2',
        title: 'Onboarding Session',
        date: 'Sep 25',
        time: '11:00 AM',
        participants: 2,
        type: 'session',
      },
    ]
  } catch (error) {
    console.error('获取日历事件失败:', error)
    return []
  }
}

// 获取用户资料
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createClient()

  try {
    const { data: profile, error } = await supabase
      .from('UserProfile')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    return profile
  } catch (error) {
    console.error('获取用户资料失败:', error)
    return null
  }
}

// 更新任务状态
export async function updateTaskStatus(
  taskId: string,
  completed: boolean
): Promise<boolean> {
  try {
    // 这里可以替换为真实的数据库更新
    console.log(`更新任务 ${taskId} 状态为: ${completed}`)
    return true
  } catch (error) {
    console.error('更新任务状态失败:', error)
    return false
  }
}

// 获取当前工作时间
export async function getCurrentWorkTime(): Promise<string> {
  try {
    // 这里可以替换为真实的时间追踪逻辑
    return '02:35'
  } catch (error) {
    console.error('获取当前工作时间失败:', error)
    return '00:00'
  }
}
