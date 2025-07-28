import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 定义用户信息的类型
export type TUser = {
  id: string
  username: string | null
  email: string | null
  avatar: string | null
  gender?: string | null
  signature?: string | null
  school?: string | null
  date?: string | null
  techStack?: string[] | null
  bio?: string | null
  resume_url?: string | null
  resume_filename?: string | null
  resume_size?: number | null
  updatedAt?: string | null
}

// 定义 Store 的状态和 Actions 的类型
type UserState = {
  user: TUser | null
  isLoggedIn: boolean
  isLoading: boolean
  setUser: (user: TUser | null) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

// 创建 Store，添加persist中间件实现持久化
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      isLoggedIn:
        typeof window !== 'undefined' && !localStorage.getItem('user-storage')
          ? true // 只有在没有缓存数据时才显示加载状态
          : false,
      isLoading: true, // 默认为加载中

      // Actions
      setUser: (user) =>
        set({ user: user, isLoggedIn: !!user, isLoading: false }),
      logout: () => {
        set({ user: null, isLoggedIn: false })
        localStorage.removeItem('user-storage')
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'user-storage', // 存储在localStorage中的键名
      storage: createJSONStorage(() => localStorage), // 使用localStorage作为存储
      onRehydrateStorage: () => (state) => {
        // 数据恢复完成时调用
        if (state) {
          state.setLoading(false)
        }
      },
    }
  )
)
