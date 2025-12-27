import apiClient from './client'

export type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'REPAIRED' | 'SCRAP'
export type RequestType = 'CORRECTIVE' | 'PREVENTIVE'

export interface MaintenanceRequest {
  id: number
  subject: string
  description: string | null
  equipment_id: number
  auto_filled_team_id: number | null
  assigned_technician_id: number | null
  request_type: RequestType
  scheduled_date: string | null
  duration_hours: number | null
  status: RequestStatus
  scrap_reason: string | null
  created_at: string
  updated_at: string | null
  equipment?: any
  maintenance_team?: any
  assigned_technician?: any
  is_overdue?: boolean
}

export const maintenanceRequestApi = {
  list: async (params?: {
    skip?: number
    limit?: number
    status?: string
    request_type?: string
    equipment_id?: number
    team_id?: number
  }): Promise<MaintenanceRequest[]> => {
    const response = await apiClient.get('/api/maintenance-requests', { params })
    return response.data
  },
  get: async (id: number): Promise<MaintenanceRequest> => {
    const response = await apiClient.get(`/api/maintenance-requests/${id}`)
    return response.data
  },
  create: async (data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    const response = await apiClient.post('/api/maintenance-requests', data)
    return response.data
  },
  update: async (id: number, data: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> => {
    const response = await apiClient.put(`/api/maintenance-requests/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/maintenance-requests/${id}`)
  },
  getCalendarEvents: async (params?: {
    start_date?: string
    end_date?: string
  }) => {
    const response = await apiClient.get('/api/maintenance-requests/calendar/preventive', { params })
    return response.data
  },
}

