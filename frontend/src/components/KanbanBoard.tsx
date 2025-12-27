import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core'
import { maintenanceRequestApi, MaintenanceRequest } from '../api/maintenanceRequest'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import { RequestStatus } from '../api/maintenanceRequest'
import { useState } from 'react'

const statuses: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP']

export default function KanbanBoard() {
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)

  const { data: requests, isLoading } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: () => maintenanceRequestApi.list({ limit: 1000 }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: RequestStatus }) =>
      maintenanceRequestApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] })
    },
  })

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    
    if (!over) return

    const requestId = Number(active.id)
    const newStatus = over.id as RequestStatus

    const request = requests?.find((r) => r.id === requestId)
    if (request && request.status !== newStatus) {
      updateMutation.mutate({ id: requestId, status: newStatus })
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const requestsByStatus = statuses.reduce((acc, status) => {
    acc[status] = requests?.filter((r) => r.status === status) || []
    return acc
  }, {} as Record<RequestStatus, MaintenanceRequest[]>)

  const activeRequest = activeId ? requests?.find((r) => r.id.toString() === activeId) : null

  return (
    <div className="px-4 py-6">
      <DndContext 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              requests={requestsByStatus[status]}
              onUpdate={updateMutation.mutate}
            />
          ))}
        </div>
        <DragOverlay>
          {activeRequest ? (
            <div className="bg-white rounded-lg shadow-lg p-4 w-64">
              <h4 className="font-medium text-gray-900 text-sm">{activeRequest.subject}</h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

