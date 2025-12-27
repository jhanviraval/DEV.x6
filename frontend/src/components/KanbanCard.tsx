import { useDraggable } from '@dnd-kit/core'
import { MaintenanceRequest, RequestStatus } from '../api/maintenanceRequest'
import { AlertCircle, User } from 'lucide-react'

interface KanbanCardProps {
  request: MaintenanceRequest
  onUpdate: (data: { id: number; status: RequestStatus }) => void
}

export default function KanbanCard({ request }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id.toString(),
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg shadow p-4 cursor-move hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{request.subject}</h4>
        {request.is_overdue && (
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{request.description || 'No description'}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{request.equipment?.name || 'N/A'}</span>
        <span
          className={`px-2 py-0.5 rounded-full ${
            request.request_type === 'PREVENTIVE'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {request.request_type}
        </span>
      </div>
      {request.assigned_technician && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <User className="h-3 w-3 mr-1" />
          {request.assigned_technician.full_name || request.assigned_technician.username}
        </div>
      )}
      {request.scheduled_date && (
        <div className="mt-1 text-xs text-gray-500">
          📅 {new Date(request.scheduled_date).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

