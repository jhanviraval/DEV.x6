import { useDroppable } from '@dnd-kit/core'
import { MaintenanceRequest, RequestStatus } from '../api/maintenanceRequest'
import KanbanCard from './KanbanCard'

interface KanbanColumnProps {
  status: RequestStatus
  requests: MaintenanceRequest[]
  onUpdate: (data: { id: number; status: RequestStatus }) => void
}

export default function KanbanColumn({ status, requests, onUpdate }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: status })

  const statusColors = {
    NEW: 'bg-gray-100 border-gray-300',
    IN_PROGRESS: 'bg-yellow-100 border-yellow-300',
    REPAIRED: 'bg-green-100 border-green-300',
    SCRAP: 'bg-red-100 border-red-300',
  }

  const statusLabels = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    REPAIRED: 'Repaired',
    SCRAP: 'Scrap',
  }

  return (
    <div ref={setNodeRef} className={`rounded-lg border-2 p-4 ${statusColors[status]}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{statusLabels[status]}</h3>
        <span className="bg-white text-gray-700 rounded-full px-2 py-1 text-sm font-medium">
          {requests.length}
        </span>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <KanbanCard key={request.id} request={request} onUpdate={onUpdate} />
        ))}
        {requests.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm">No requests</div>
        )}
      </div>
    </div>
  )
}

