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
    NEW: 'bg-gray-500/10 border-gray-500/20 shadow-inner',
    IN_PROGRESS: 'bg-yellow-500/10 border-yellow-500/20 shadow-inner',
    REPAIRED: 'bg-green-500/10 border-green-500/20 shadow-inner',
    SCRAP: 'bg-red-500/10 border-red-500/20 shadow-inner',
  }

  const statusLabels = {
    NEW: 'New',
    IN_PROGRESS: 'In Progress',
    REPAIRED: 'Repaired',
    SCRAP: 'Scrap',
  }

  return (
    <div ref={setNodeRef} className={`rounded-xl border p-4 backdrop-blur-sm ${statusColors[status]}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-white tracking-wide">{statusLabels[status]}</h3>
        <span className="bg-white/10 text-white rounded-lg px-2.5 py-1 text-xs font-semibold border border-white/5">
          {requests.length}
        </span>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <KanbanCard key={request.id} request={request} onUpdate={onUpdate} />
        ))}
        {requests.length === 0 && (
          <div className="text-center text-gray-500 py-8 text-sm italic border-2 border-dashed border-white/5 rounded-lg">No requests</div>
        )}
      </div>
    </div>
  )
}

