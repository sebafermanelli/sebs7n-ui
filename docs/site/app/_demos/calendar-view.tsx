"use client"

import { useMemo } from "react"
import { CalendarView, type CalendarEvent } from "sebs7n-ui/calendar-view"

/** Eventos de ejemplo alrededor de hoy, para que la demo siempre tenga algo que mostrar. */
function useEventos(): CalendarEvent[] {
  return useMemo(() => {
    const hoy = new Date()
    const dia = (offset: number, hora?: number, minuto = 0) =>
      new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offset, hora ?? 0, minuto)
    return [
      { id: "cierre", title: "Cierre de mes", start: dia(2), allDay: true, color: "blue" },
      { id: "iva", title: "Vence IVA", start: dia(-3), allDay: true, color: "red" },
      { id: "acme", title: "Reunión con Acme", start: dia(0, 10), end: dia(0, 11, 30), color: "amber" },
      { id: "cobro", title: "Cobro Nube Digital", start: dia(1, 15), end: dia(1, 16), color: "green" },
      { id: "ruiz", title: "Llamada Estudio Ruiz", start: dia(1, 15, 30), end: dia(1, 16, 30), color: "purple" },
      { id: "0014", title: "Vence factura 0014", start: dia(-1, 9), end: dia(-1, 9, 30), color: "red" },
      { id: "arqueo", title: "Arqueo de caja", start: dia(3, 18), end: dia(3, 19), color: "teal" },
    ]
  }, [])
}

/**
 * Mes
 * La vista de mes de iCloud: hoy en el círculo del acento, los eventos de todo el día como chips y los que tienen hora con su punto. Hacé foco en un día y probá las flechas, Home/End y PageUp/PageDown.
 */
export function Mes() {
  const eventos = useEventos()
  return (
    <div className="h-[640px] w-full overflow-hidden rounded-surface border border-separator">
      <CalendarView events={eventos} hour12={false} />
    </div>
  )
}

/**
 * Semana
 * Filas de una hora de 61, bloques con el borde izquierdo del color del calendario, la fila «Todo el día» arriba y la línea roja de ahora. Los eventos que se pisan se reparten el ancho.
 */
export function Semana() {
  const eventos = useEventos()
  return (
    <div className="h-[560px] w-full overflow-hidden rounded-surface border border-separator">
      <CalendarView defaultView="week" events={eventos} hour12={false} />
    </div>
  )
}
