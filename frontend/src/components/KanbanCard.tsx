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
      className={`bg-white/10 backdrop-blur-md border border-white/5 rounded-xl shadow-lg p-4 cursor-move hover:bg-white/15 hover:shadow-xl hover:border-white/10 transition-all group ${isDragging ? 'opacity-50 scale-[1.02] shadow-2xl' : ''
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors">{request.subject}</h4>
        {request.is_overdue && (
          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 animate-pulse" />
        )}
      </div>
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{request.description || 'No description'}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-300 bg-black/20 px-2 py-0.5 rounded border border-white/5">{request.equipment?.name || 'N/A'}</span>
        <span
          className={`px-2 py-0.5 rounded-full font-medium ${request.request_type === 'PREVENTIVE'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/10'
              : 'bg-orange-500/20 text-orange-300 border border-orange-500/10'
            }`}
        >
          {request.request_type}
        </span>
      </div>
      {request.assigned_technician && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center text-xs text-gray-400">
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2 text-indigo-300 border border-indigo-500/10">
            <User className="h-3 w-3" />
          </div>
          {request.assigned_technician.full_name || request.assigned_technician.username}
        </div>
      )}
      {request.scheduled_date && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <span className="text-[10px]">📅</span> {new Date(request.scheduled_date).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

