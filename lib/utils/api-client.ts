import { supabase } from './supabase/client'

// 自定义 API 客户端
export class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // 获取当前 session token
  private async getAuthHeader(): Promise<Record<string, string>> {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    return headers
  }

  // GET 请求
  async get(endpoint: string) {
    const headers = await this.getAuthHeader()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    })

    return response.json()
  }

  // POST 请求
  async post(endpoint: string, data: any) {
    const headers = await this.getAuthHeader()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })

    return response.json()
  }

  // PUT 请求
  async put(endpoint: string, data: any) {
    const headers = await this.getAuthHeader()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    })

    return response.json()
  }

  // DELETE 请求
  async delete(endpoint: string) {
    const headers = await this.getAuthHeader()

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    return response.json()
  }
}

// 创建实例
export const apiClient = new ApiClient('/api')
