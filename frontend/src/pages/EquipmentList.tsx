import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { equipmentApi } from '../api/equipment'
import { Plus, Search, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function EquipmentList() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['equipment', search, department, status],
    queryFn: () => equipmentApi.list({ search, department, status, limit: 100 }),
  })

  const canCreate = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Equipment</h1>
          <p className="mt-2 text-sm text-gray-400">Manage your equipment inventory</p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              const prefix = location.pathname.startsWith('/admin') ? '/admin' : ''
              navigate(`${prefix}/equipment/new`)
            }}
            className="inline-flex items-center px-4 py-2 border border-blue-500/50 text-sm font-medium rounded-md shadow-sm text-white bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, serial, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 block w-full bg-black/20 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-gray-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Department</label>
            <input
              type="text"
              placeholder="Filter by department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2.5 block w-full bg-black/20 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 block w-full bg-black/20 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
            >
              <option value="" className="bg-gray-900 text-white">All Status</option>
              <option value="ACTIVE" className="bg-gray-900 text-white">Active</option>
              <option value="SCRAPPED" className="bg-gray-900 text-white">Scrapped</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl overflow-hidden sm:rounded-xl">
          <ul className="divide-y divide-white/10">
            {data?.items.map((equipment) => (
              <li key={equipment.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center ring-1 ring-blue-500/30">
                          <span className="text-blue-400 font-semibold">
                            {equipment.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-white">{equipment.name}</p>
                          <span
                            className={`ml-2 px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full ${equipment.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                              : 'bg-red-500/20 text-red-400 border border-red-500/20'
                              }`}
                          >
                            {equipment.status}
                          </span>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-400">
                              Serial: {equipment.serial_number || 'N/A'}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0 sm:ml-6">
                              Department: {equipment.department || 'N/A'}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-400 sm:mt-0 sm:ml-6">
                              Location: {equipment.location || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {equipment.open_requests_count !== undefined && equipment.open_requests_count > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                          {equipment.open_requests_count} Open Request{equipment.open_requests_count !== 1 ? 's' : ''}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          const prefix = location.pathname.startsWith('/admin') ? '/admin' : ''
                          navigate(`${prefix}/equipment/${equipment.id}`)
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-white/20 shadow-sm text-sm font-medium rounded-lg text-gray-200 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && data.total === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No equipment found</p>
        </div>
      )}
    </div>
  )
}
