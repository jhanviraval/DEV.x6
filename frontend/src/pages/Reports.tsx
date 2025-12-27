import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reports'
import { BarChart3 } from 'lucide-react'

export default function Reports() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.getReports(),
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-8 w-8 mr-2" />
          Reports
        </h1>
        <p className="mt-2 text-sm text-gray-600">Maintenance analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Requests per Team</h2>
          {reports?.requests_per_team && Object.keys(reports.requests_per_team).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(reports.requests_per_team).map(([team, count]) => (
                <div key={team} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{team}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preventive vs Corrective</h2>
          {reports?.preventive_vs_corrective ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Preventive</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {reports.preventive_vs_corrective.preventive} (
                    {reports.preventive_vs_corrective.preventive_percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${reports.preventive_vs_corrective.preventive_percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Corrective</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {reports.preventive_vs_corrective.corrective} (
                    {reports.preventive_vs_corrective.corrective_percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{ width: `${reports.preventive_vs_corrective.corrective_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Top Equipment by Requests</h2>
        {reports?.requests_per_equipment && Object.keys(reports.requests_per_equipment).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requests</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(reports.requests_per_equipment)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([equipment, count]) => (
                    <tr key={equipment}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{count as number}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No data available</p>
        )}
      </div>
    </div>
  )
}

