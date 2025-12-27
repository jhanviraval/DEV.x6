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
        <h1 className="text-3xl font-bold text-white flex items-center tracking-tight">
          <BarChart3 className="h-8 w-8 mr-2 text-blue-400" />
          Reports
        </h1>
        <p className="mt-2 text-sm text-gray-400">Maintenance analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Requests per Team</h2>
          {reports?.requests_per_team && Object.keys(reports.requests_per_team).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(reports.requests_per_team).map(([team, count]) => (
                <div key={team} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                  <span className="text-sm font-medium text-gray-300">{team}</span>
                  <span className="text-sm font-bold text-white bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-500/20">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No data available</p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-6 text-white">Preventive vs Corrective</h2>
          {reports?.preventive_vs_corrective ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Preventive</span>
                  <span className="text-sm font-bold text-blue-400">
                    {reports.preventive_vs_corrective.preventive} ({reports.preventive_vs_corrective.preventive_percentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${reports.preventive_vs_corrective.preventive_percentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">Corrective</span>
                  <span className="text-sm font-bold text-orange-400">
                    {reports.preventive_vs_corrective.corrective} ({reports.preventive_vs_corrective.corrective_percentage}%)
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                    style={{ width: `${reports.preventive_vs_corrective.corrective_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No data available</p>
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 text-white">Top Equipment by Requests</h2>
        {reports?.requests_per_equipment && Object.keys(reports.requests_per_equipment).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider rounded-tl-lg">Equipment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider rounded-tr-lg">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(reports.requests_per_equipment)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([equipment, count]) => (
                    <tr key={equipment} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{equipment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{count as number}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No data available</p>
        )}
      </div>
    </div>
  )
}

