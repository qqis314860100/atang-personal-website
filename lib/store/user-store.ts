import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 只保留 UI 状态相关的 store，移除 user 相关内容
// 定义 Store 的状态和 Actions 的类型
type UserState = {
  isLoggedIn: boolean
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

// 创建 Store，添加persist中间件实现持久化,用户在其他地方登出后，本地状态仍然显示已登录
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isLoggedIn: false,
      isLoading: true,

      // Actions
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
