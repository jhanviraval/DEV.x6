import apiClient from './client'

export interface LoginRequest {
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: number
  email: string
  username: string
  full_name: string | null
  role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER'
  is_active: boolean
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name?: string
  role?: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'USER'
}

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post('/api/auth/login', data)
    return response.data
  },
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/api/auth/register', data)
    return response.data
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },
  listUsers: async (role?: string): Promise<User[]> => {
    const response = await apiClient.get('/api/auth/users', { params: { role } })
    return response.data
  },
}

