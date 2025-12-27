import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import KanbanBoard from '../components/KanbanBoard'
import CalendarView from '../components/CalendarView'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/Tabs'

export default function MaintenanceRequests() {
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban')

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
        <p className="mt-2 text-sm text-gray-600">Manage and track maintenance requests</p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'kanban' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanBoard />
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

