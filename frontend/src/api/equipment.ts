import apiClient from './client'

export interface Equipment {
  id: number
  name: string
  serial_number: string | null
  department: string | null
  assigned_employee_id: number | null
  purchase_date: string | null
  warranty_expiry: string | null
  location: string | null
  maintenance_team_id: number | null
  default_technician_id: number | null
  status: 'ACTIVE' | 'SCRAPPED'
  created_at: string
  updated_at: string | null
  assigned_employee?: User
  maintenance_team?: MaintenanceTeam
  default_technician?: User
  open_requests_count?: number
}

export interface User {
  id: number
  username: string
  full_name: string | null
}

export interface MaintenanceTeam {
  id: number
  team_name: string
}

export interface EquipmentListResponse {
  items: Equipment[]
  total: number
}

export const equipmentApi = {
  list: async (params?: {
    skip?: number
    limit?: number
    search?: string
    department?: string
    status?: string
  }): Promise<EquipmentListResponse> => {
    const response = await apiClient.get('/api/equipment', { params })
    return response.data
  },
  get: async (id: number): Promise<Equipment> => {
    const response = await apiClient.get(`/api/equipment/${id}`)
    return response.data
  },
  create: async (data: Partial<Equipment>): Promise<Equipment> => {
    const response = await apiClient.post('/api/equipment', data)
    return response.data
  },
  update: async (id: number, data: Partial<Equipment>): Promise<Equipment> => {
    const response = await apiClient.put(`/api/equipment/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/equipment/${id}`)
  },
  getMaintenanceRequests: async (id: number) => {
    const response = await apiClient.get(`/api/equipment/${id}/maintenance-requests`)
    return response.data
  },
}

