import apiClient from './client'

export interface TeamMember {
  id: number
  user_id: number
  display_name: string | null
  user: User
}

export interface MaintenanceTeam {
  id: number
  team_name: string
  created_at: string
  team_members?: TeamMember[]
}

export interface User {
  id: number
  username: string
  full_name: string | null
  email: string
  role: string
}

export const maintenanceTeamApi = {
  list: async (): Promise<MaintenanceTeam[]> => {
    const response = await apiClient.get('/api/maintenance-teams')
    return response.data
  },
  get: async (id: number): Promise<MaintenanceTeam> => {
    const response = await apiClient.get(`/api/maintenance-teams/${id}`)
    return response.data
  },
  create: async (data: { team_name: string }): Promise<MaintenanceTeam> => {
    const response = await apiClient.post('/api/maintenance-teams', data)
    return response.data
  },
  update: async (id: number, data: { team_name: string }): Promise<MaintenanceTeam> => {
    const response = await apiClient.put(`/api/maintenance-teams/${id}`, data)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/maintenance-teams/${id}`)
  },
  addMember: async (teamId: number, userId: number, displayName?: string): Promise<MaintenanceTeam> => {
    const response = await apiClient.post(`/api/maintenance-teams/${teamId}/members`, {
      user_id: userId,
      display_name: displayName
    })
    return response.data
  },
  removeMember: async (teamId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/api/maintenance-teams/${teamId}/members/${userId}`)
  },
  updateMember: async (teamId: number, userId: number, displayName: string): Promise<MaintenanceTeam> => {
    const response = await apiClient.put(`/api/maintenance-teams/${teamId}/members/${userId}`, {
      display_name: displayName
    })
    return response.data
  },
}

