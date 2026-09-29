"use client"

import { useMemo } from "react"
import { CalendarView, type CalendarEvent } from "sebs7n-ui/calendar-view"
import { LabelsProvider } from "sebs7n-ui/labels"

/** Eventos de ejemplo alrededor de hoy, para que la demo siempre tenga algo que mostrar. */
function useSampleEvents(): CalendarEvent[] {
  return useMemo(() => {
    const today = new Date()
    const at = (offset: number, hour?: number, minute = 0) =>
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, hour ?? 0, minute)
    return [
      { id: "cierre", title: "Cierre de mes", start: at(2), allDay: true, color: "blue" },
      { id: "iva", title: "Vence IVA", start: at(-3), allDay: true, color: "red" },
      { id: "acme", title: "Reunión con Acme", start: at(0, 10), end: at(0, 11, 30), color: "amber" },
      { id: "cobro", title: "Cobro Nube Digital", start: at(1, 15), end: at(1, 16), color: "green" },
      { id: "ruiz", title: "Llamada Estudio Ruiz", start: at(1, 15, 30), end: at(1, 16, 30), color: "purple" },
      { id: "0014", title: "Vence factura 0014", start: at(-1, 9), end: at(-1, 9, 30), color: "red" },
      { id: "arqueo", title: "Arqueo de caja", start: at(3, 18), end: at(3, 19), color: "teal" },
      // Hoy, para que la vista Día nunca abra vacía.
      { id: "due-0015", title: "Vence factura 0015", start: at(0), allDay: true, color: "red" },
      { id: "issue-invoices", title: "Emitir facturas del mes", start: at(0, 9), end: at(0, 9, 45), color: "blue" },
      { id: "bank-reconciliation", title: "Conciliación bancaria", start: at(0, 13), end: at(0, 14), color: "teal" },
      { id: "payment-reminder", title: "Recordatorio de cobro a clientes", start: at(0, 15, 30), end: at(0, 16), color: "green" },
      { id: "quote-0231", title: "Enviar presupuesto 0231", start: at(0, 17), end: at(0, 17, 30), color: "purple" },
    ]
  }, [])
}

/**
 * Mes
 * La vista de mes de iCloud: hoy en el círculo del acento, los eventos de todo el día como chips y los que tienen hora con su punto. Hacé foco en un día y probá las flechas, Home/End y PageUp/PageDown.
 */
export function Mes() {
  const events = useSampleEvents()
  return (
    <div className="h-[640px] w-full overflow-hidden rounded-surface border border-separator">
      <CalendarView events={events} hour12={false} locale="es-AR" />
    </div>
  )
}

/**
 * Semana
 * Filas de una hora de 61, bloques con el borde izquierdo del color del calendario, la fila «Todo el día» arriba y la línea roja de ahora. Los eventos que se pisan se reparten el ancho.
 */
export function Semana() {
  const events = useSampleEvents()
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-surface border border-separator">
      <CalendarView defaultView="week" events={events} hour12={false} locale="es-AR" />
    </div>
  )
}

/**
 * Día
 * La semana con una sola columna: la fila «Todo el día», las horas de 61, los eventos con su borde de color y la línea de ahora. ‹ › pasan de a un día y el teclado es el mismo.
 */
export function Dia() {
  const events = useSampleEvents()
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-surface border border-separator">
      <CalendarView defaultView="day" events={events} hour12={false} locale="es-AR" />
    </div>
  )
}

/**
 * Idioma global
 * Con `LabelsProvider` `dates` (`en-US`, semana del domingo) no hace falta pasarle `locale` ni `weekStartsOn`.
 */
export function IdiomaGlobal() {
  const events = useSampleEvents()
  return (
    <LabelsProvider value={{ dates: { locale: "en-US", weekStartsOn: 0 } }}>
      <div className="h-[34rem] w-full">
        <CalendarView className="h-full" events={events} />
      </div>
    </LabelsProvider>
  )
}
