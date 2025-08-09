'use client'

import React from 'react'
import { useStableUser } from '@/lib/query-hook/use-auth'

// 用户角色枚举
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

// 权限枚举
export enum Permission {
  READ_BLOG = 'read_blog',
  CREATE_BLOG = 'create_blog',
  EDIT_BLOG = 'edit_blog',
  DELETE_BLOG = 'delete_blog',
  MANAGE_USERS = 'manage_users',
  MANAGE_SYSTEM = 'manage_system',
}

// 角色权限映射
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [Permission.READ_BLOG],

  [UserRole.ADMIN]: [
    Permission.READ_BLOG,
    Permission.CREATE_BLOG,
    Permission.EDIT_BLOG,
    Permission.DELETE_BLOG,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SYSTEM,
  ],
}

// 权限管理 Hook
export function usePermissions() {
  const { user, isLoading } = useStableUser()

  // 获取用户角色（默认为普通用户）
  const getUserRole = (): UserRole => {
    if (!user) return UserRole.USER

    // 从用户数据中获取角色，默认为普通用户
    return user.isAdmin ? UserRole.ADMIN : UserRole.USER
  }

  // 检查用户是否有特定权限
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false

    const userRole = getUserRole()
    const permissions = rolePermissions[userRole]

    return permissions.includes(permission)
  }

  // 检查用户是否为管理员
  const isAdmin = (): boolean => {
    return getUserRole() === UserRole.ADMIN
  }

  // 博客相关权限检查
  const canReadBlog = (): boolean => hasPermission(Permission.READ_BLOG)
  const canCreateBlog = (): boolean => hasPermission(Permission.CREATE_BLOG)
  const canEditBlog = (): boolean => hasPermission(Permission.EDIT_BLOG)
  const canDeleteBlog = (): boolean => hasPermission(Permission.DELETE_BLOG)
  const canManageCategory = (): boolean =>
    hasPermission(Permission.MANAGE_SYSTEM)

  return {
    user,
    isLoading,
    getUserRole,
    hasPermission,
    isAdmin,
    canReadBlog,
    canCreateBlog,
    canEditBlog,
    canDeleteBlog,
    canManageCategory,
    UserRole,
    Permission,
  }
}

// 权限保护组件 Props
export interface PermissionGuardProps {
  children: React.ReactNode
  permission: Permission
  fallback?: React.ReactNode
}

// 权限保护组件
export function PermissionGuard({
  children,
  permission,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return fallback || null
  }

  return <>{children}</>
}

// 角色保护组件 Props
export interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
  fallback?: React.ReactNode
}

// 角色保护组件
export function RoleGuard({ children, roles, fallback }: RoleGuardProps) {
  const { getUserRole } = usePermissions()
  const userRole = getUserRole()

  if (!roles.includes(userRole)) {
    return fallback || null
  }

  return <>{children}</>
}
