import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { maintenanceRequestApi } from '../api/maintenanceRequest'
import { DateSelectArg } from '@fullcalendar/core'

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const { data: events } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => maintenanceRequestApi.getCalendarEvents(),
  })

  const calendarEvents = events?.map((event: any) => ({
    id: event.id.toString(),
    title: event.title,
    start: event.start,
    backgroundColor: event.is_overdue ? '#ef4444' : event.status === 'REPAIRED' ? '#10b981' : '#3b82f6',
    borderColor: event.is_overdue ? '#dc2626' : event.status === 'REPAIRED' ? '#059669' : '#2563eb',
    extendedProps: {
      equipment: event.equipment,
      status: event.status,
      is_overdue: event.is_overdue,
    },
  })) || []

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.start)
    // You can open a modal here to create a new maintenance request
    alert(`Create new maintenance request for ${selectInfo.start.toLocaleDateString()}`)
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl rounded-xl p-6">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={calendarEvents}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        select={handleDateSelect}
        height="auto"
        eventClick={(info) => {
          alert(`Request: ${info.event.title}\nEquipment: ${info.event.extendedProps.equipment}\nStatus: ${info.event.extendedProps.status}`)
        }}
      />
    </div>
  )
}

