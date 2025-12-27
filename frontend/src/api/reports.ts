import apiClient from './client'

export interface ReportResponse {
  requests_per_team: Record<string, number>
  requests_per_equipment: Record<string, number>
  preventive_vs_corrective: {
    preventive: number
    corrective: number
    preventive_percentage: number
    corrective_percentage: number
  }
}

export const reportsApi = {
  getReports: async (): Promise<ReportResponse> => {
    const response = await apiClient.get('/api/reports')
    return response.data
  },
}

