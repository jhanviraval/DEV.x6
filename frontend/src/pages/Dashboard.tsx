import { useQuery } from '@tanstack/react-query'
import { maintenanceRequestApi } from '../api/maintenanceRequest'
import { equipmentApi } from '../api/equipment'
import { BarChart3, Package, Wrench, AlertCircle } from 'lucide-react'

export default function Dashboard() {
  const { data: requests } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => maintenanceRequestApi.list({ limit: 1000 }),
  })

  const { data: equipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentApi.list({ limit: 1000 }),
  })

  const stats = {
    totalEquipment: equipment?.total || 0,
    activeEquipment: equipment?.items.filter((e) => e.status === 'ACTIVE').length || 0,
    totalRequests: requests?.length || 0,
    openRequests: requests?.filter((r) => r.status === 'NEW' || r.status === 'IN_PROGRESS').length || 0,
    overdueRequests: requests?.filter((r) => r.is_overdue).length || 0,
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-400">Overview of your maintenance operations</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden shadow-xl rounded-xl transition-transform hover:scale-[1.02]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-white/5 rounded-lg">
                <Package className="h-6 w-6 text-gray-300" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Total Equipment</dt>
                  <dd className="text-2xl font-bold text-white mt-1">{stats.totalEquipment}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden shadow-xl rounded-xl transition-transform hover:scale-[1.02]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-500/10 rounded-lg">
                <Package className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Active Equipment</dt>
                  <dd className="text-2xl font-bold text-white mt-1">{stats.activeEquipment}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden shadow-xl rounded-xl transition-transform hover:scale-[1.02]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-500/10 rounded-lg">
                <Wrench className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Open Requests</dt>
                  <dd className="text-2xl font-bold text-white mt-1">{stats.openRequests}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden shadow-xl rounded-xl transition-transform hover:scale-[1.02]">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">Overdue Requests</dt>
                  <dd className="text-2xl font-bold text-red-400 mt-1">{stats.overdueRequests}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6 text-white">Recent Maintenance Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-black/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-tl-lg">
                  Subject
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Equipment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider rounded-tr-lg">
                  Scheduled
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests?.slice(0, 10).map((request) => (
                <tr key={request.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {request.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {request.equipment?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${request.request_type === 'PREVENTIVE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/20'
                        }`}
                    >
                      {request.request_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${request.status === 'NEW'
                          ? 'bg-gray-500/20 text-gray-300 border border-gray-500/20'
                          : request.status === 'IN_PROGRESS'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20'
                            : request.status === 'REPAIRED'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/20'
                              : 'bg-red-500/20 text-red-300 border border-red-500/20'
                        }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {request.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString() : 'N/A'}
                    {request.is_overdue && (
                      <span className="ml-2 text-red-400 font-semibold text-xs border border-red-500/30 px-1.5 py-0.5 rounded bg-red-500/10">Overdue</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
