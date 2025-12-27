import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { equipmentApi } from '../api/equipment'
import { Wrench, ArrowLeft, Plus, X, Trash2, Save } from 'lucide-react'
import { maintenanceRequestApi } from '../api/maintenanceRequest'
import { useAuth } from '../contexts/AuthContext'

export default function EquipmentDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const isNew = id === 'new'
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const canDelete = user?.role === 'ADMIN'

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State for Creating Equipment
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    department: '',
    location: '',
    purchase_date: '',
    warranty_expiry: '',
    status: 'ACTIVE'
  })

  // Maintenance Request State
  const [requestData, setRequestData] = useState({
    subject: '',
    description: '',
    request_type: 'CORRECTIVE' as 'CORRECTIVE' | 'PREVENTIVE',
    scheduled_date: ''
  })

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentApi.get(Number(id)),
    enabled: !!id && !isNew,
  })

  const { data: requests } = useQuery({
    queryKey: ['equipment-requests', id],
    queryFn: () => equipmentApi.getMaintenanceRequests(Number(id!)),
    enabled: !!id && !isNew,
  })

  // Create Equipment Mutation
  const createEquipmentMutation = useMutation({
    mutationFn: (data: any) => equipmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      alert('Equipment created successfully!')
      // Navigate back to list, preserving admin context if needed
      if (location.pathname.startsWith('/admin')) {
        navigate('/admin/equipment')
      } else {
        navigate('/equipment')
      }
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to create equipment')
    }
  })

  // Delete Equipment Mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: (id: number) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] })
      alert('Equipment deleted successfully!')
      navigate(-1)
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to delete equipment')
    }
  })

  // Create Request Mutation
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

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault()
    createEquipmentMutation.mutate(formData)
  }

  const handleDeleteEquipment = () => {
    if (window.confirm('Are you sure you want to delete this equipment? This cannot be undone.')) {
      deleteEquipmentMutation.mutate(Number(id))
    }
  }

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || isNew) return

    createRequestMutation.mutate({
      ...requestData,
      equipment_id: Number(id),
      scheduled_date: requestData.scheduled_date || undefined
    })
  }

  if (isLoading) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>
  }

  // RENDER: CREATE FORM
  if (isNew) {
    if (!canManage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="bg-red-500/10 rounded-full p-4 mb-4">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            You do not have permission to add new equipment. Only Administrators and Managers can perform this action.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-white/10 rounded-lg text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      )
    }

    return (
      <div className="px-4 py-6 sm:px-0">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Add New Equipment</h1>
          <form onSubmit={handleCreateEquipment} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                  className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                  className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Warranty Expiry</label>
                <input
                  type="date"
                  value={formData.warranty_expiry}
                  onChange={e => setFormData({ ...formData, warranty_expiry: e.target.value })}
                  className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 py-2.5 px-3 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={createEquipmentMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-blue-500/50 text-sm font-medium rounded-lg text-white bg-blue-600/80 hover:bg-blue-600 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              >
                <Save className="h-4 w-4 mr-2" />
                {createEquipmentMutation.isPending ? 'Saving...' : 'Save Equipment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // RENDER: DETAIL VIEW
  if (!equipment) {
    return <div className="text-center py-12 text-gray-400">Equipment not found</div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
        {canDelete && (
          <button
            onClick={handleDeleteEquipment}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Equipment
          </button>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{equipment.name}</h1>
            <p className="mt-2 text-sm text-gray-400">Equipment Details</p>
          </div>
          <span
            className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${equipment.status === 'ACTIVE'
              ? 'bg-green-500/20 text-green-400 border border-green-500/20'
              : 'bg-red-500/20 text-red-400 border border-red-500/20'
              }`}
          >
            {equipment.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Serial Number</h3>
            <p className="text-base text-white font-medium">{equipment.serial_number || 'N/A'}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Department</h3>
            <p className="text-base text-white font-medium">{equipment.department || 'N/A'}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Location</h3>
            <p className="text-base text-white font-medium">{equipment.location || 'N/A'}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Maintenance Team</h3>
            <p className="text-base text-white font-medium">{equipment.maintenance_team?.team_name || 'N/A'}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Purchase Date</h3>
            <p className="text-base text-white font-medium">
              {equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <h3 className="text-sm font-medium text-gray-400 mb-1">Warranty Expiry</h3>
            <p className="text-base text-white font-medium">
              {equipment.warranty_expiry ? new Date(equipment.warranty_expiry).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Wrench className="h-5 w-5 mr-2 text-blue-400" />
            Maintenance Requests
            {equipment.open_requests_count !== undefined && equipment.open_requests_count > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/20">
                {equipment.open_requests_count} Open
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 border border-blue-500/50 text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] text-white bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm transition-all"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Request
          </button>
        </div>

        {requests && requests.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-black/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((request: any) => (
                  <tr key={request.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {request.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${request.request_type === 'PREVENTIVE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/20'
                          }`}
                      >
                        {request.request_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs font-medium rounded-full ${request.status === 'NEW'
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-lg border-2 border-dashed border-white/5">
            <p className="text-gray-400">No maintenance requests for this equipment</p>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-[#0f172a] border border-white/10 rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-[#0f172a] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Add Maintenance Request</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateRequest}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 text-white placeholder-gray-500"
                        placeholder="e.g. Engine making noise"
                        value={requestData.subject}
                        onChange={(e) => setRequestData({ ...requestData, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                      <textarea
                        rows={3}
                        className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 text-white placeholder-gray-500"
                        placeholder="Provide more details..."
                        value={requestData.description}
                        onChange={(e) => setRequestData({ ...requestData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Request Type</label>
                      <select
                        className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 text-white"
                        value={requestData.request_type}
                        onChange={(e) => setRequestData({ ...requestData, request_type: e.target.value as any })}
                      >
                        <option value="CORRECTIVE" className="bg-gray-900">Corrective (Repair)</option>
                        <option value="PREVENTIVE" className="bg-gray-900">Preventive (Scheduled)</option>
                      </select>
                    </div>
                    {requestData.request_type === 'PREVENTIVE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          required
                          className="block w-full bg-black/30 border border-white/10 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 text-white placeholder-gray-500"
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
                      className="inline-flex justify-center w-full rounded-lg border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:w-auto sm:text-sm transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                    >
                      {createRequestMutation.isPending ? 'Creating...' : 'Create Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="inline-flex justify-center w-full rounded-lg border border-white/10 shadow-sm px-6 py-3 bg-white/5 text-base font-medium text-gray-300 hover:bg-white/10 sm:w-auto sm:text-sm transition-all"
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
