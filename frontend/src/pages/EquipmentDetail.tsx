import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentApi } from '../api/equipment'
import { Wrench, ArrowLeft, Plus, X } from 'lucide-react'
import { maintenanceRequestApi } from '../api/maintenanceRequest'

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [requestData, setRequestData] = useState({
    subject: '',
    description: '',
    request_type: 'CORRECTIVE' as 'CORRECTIVE' | 'PREVENTIVE',
    scheduled_date: ''
  })

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.get(Number(id)),
    enabled: !!id && id !== 'new',
  })

  const { data: requests } = useQuery({
    queryKey: ['equipment-requests', id],
    queryFn: () => equipmentApi.getMaintenanceRequests(Number(id!)),
    enabled: !!id && id !== 'new',
  })

  const createRequestMutation = useMutation({
    mutationFn: (data: any) => maintenanceRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-requests', id] })
      queryClient.invalidateQueries({ queryKey: ['equipment', id] })
      setIsModalOpen(false)
      setRequestData({
        subject: '',
        description: '',
        request_type: 'CORRECTIVE',
        scheduled_date: ''
      })
      alert('Maintenance request created successfully!')
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to create maintenance request')
    }
  })

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    createRequestMutation.mutate({
      ...requestData,
      equipment_id: Number(id),
      scheduled_date: requestData.scheduled_date || undefined
    })
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!equipment) {
    return <div className="text-center py-12">Equipment not found</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <button
        onClick={() => navigate('/equipment')}
        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Equipment
      </button>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="mt-2 text-sm text-gray-600">Equipment Details</p>
          </div>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${equipment.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}
          >
            {equipment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Serial Number</h3>
            <p className="text-sm text-gray-900">{equipment.serial_number || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Department</h3>
            <p className="text-sm text-gray-900">{equipment.department || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Location</h3>
            <p className="text-sm text-gray-900">{equipment.location || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Maintenance Team</h3>
            <p className="text-sm text-gray-900">{equipment.maintenance_team?.team_name || 'N/A'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Purchase Date</h3>
            <p className="text-sm text-gray-900">
              {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Warranty Expiry</h3>
            <p className="text-sm text-gray-900">
              {equipment.warranty_expiry ? new Date(equipment.warranty_expiry).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Maintenance Requests
            {equipment.open_requests_count !== undefined && equipment.open_requests_count > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {equipment.open_requests_count} Open
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Request
          </button>
        </div>

        {requests && requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request: any) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.request_type === 'PREVENTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                          }`}
                      >
                        {request.request_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'NEW'
                          ? 'bg-gray-100 text-gray-800'
                          : request.status === 'IN_PROGRESS'
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'REPAIRED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No maintenance requests for this equipment</p>
        )}
      </div>

      {/* Add Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-900 opacity-50 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add Maintenance Request</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateRequest}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                        placeholder="e.g. Engine making noise"
                        value={requestData.subject}
                        onChange={(e) => setRequestData({ ...requestData, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                        placeholder="Provide more details..."
                        value={requestData.description}
                        onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
                      <select
                        className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                        value={requestData.request_type}
                        onChange={(e) => setRequestData({ ...requestData, request_type: e.target.value as any })}
                      >
                        <option value="CORRECTIVE">Corrective (Repair)</option>
                        <option value="PREVENTIVE">Preventive (Scheduled)</option>
                      </select>
                    </div>
                    {requestData.request_type === 'PREVENTIVE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          required
                          className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                          value={requestData.scheduled_date}
                          onChange={(e) => setRequestData({ ...requestData, scheduled_date: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                      type="submit"
                      disabled={createRequestMutation.isPending}
                      className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:w-auto sm:text-sm transition-all disabled:opacity-50"
                    >
                      {createRequestMutation.isPending ? 'Creating...' : 'Create Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="inline-flex justify-center w-full rounded-lg border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

