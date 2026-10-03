import type { CalendarEvent } from "sebs7n-ui/calendar-view"

import type { MaintenanceWindow, ScheduledDeploy } from "../_state/mutations"

/** Los eventos del calendario: las ventanas de mantenimiento en ámbar y los despliegues programados en azul. */
export function calendarEvents(maintenance: MaintenanceWindow[], scheduled: ScheduledDeploy[]): CalendarEvent[] {
  return [
    ...maintenance.map<CalendarEvent>((w) => ({ id: w.id, title: w.title, start: new Date(w.start), end: new Date(w.end), color: "amber" })),
    ...scheduled.map<CalendarEvent>((d) => ({ id: d.id, title: `Despliegue de ${d.service}`, start: new Date(d.at), color: "blue" })),
  ]
}
