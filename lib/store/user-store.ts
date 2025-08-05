import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 定义用户信息的类型
export type TUser = {
  id: string
  username: string | null
  email: string
  avatar: string | null
  gender?: string | null
  signature?: string | null
  school?: string | null
  date?: string | null
  isAdmin?: boolean | null
  techStack?: string | null
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
  // 添加与 React Query 同步的方法
  syncWithReactQuery: (user: TUser | null) => void
}

// 创建 Store，添加persist中间件实现持久化,用户在其他地方登出后，本地状态仍然显示已登录
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isLoggedIn: false,
      isLoading: true,

      // Actions
      setUser: (user) => {
        set({ user: user, isLoggedIn: !!user, isLoading: false })
      },
      logout: () => {
        set({ user: null, isLoggedIn: false, isLoading: false })
      },
      setLoading: (loading) => set({ isLoading: loading }),
      // 与 React Query 同步的方法
      syncWithReactQuery: (user) => {
        const currentUser = get().user
        if (user && (!currentUser || currentUser.id !== user.id)) {
          get().setUser(user)
        } else if (!user && currentUser) {
          get().logout()
        }
      },
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
