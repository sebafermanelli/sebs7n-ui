import { BellIcon, MailIcon } from "lucide-react"
import { Button } from "sebs7n-ui"
import { Timeline, TimelineGroup, TimelineItem } from "sebs7n-ui/timeline"

/**
 * Actividad de una factura
 * Título en 17, detalle en 14 gris, la hora a la derecha y el punto del color del evento, unidos por una línea. Los días van con la cabecera de grupo de Drive.
 */
export function Basico() {
  return (
    <Timeline aria-label="Actividad de la factura A-0012" className="w-full max-w-md">
      <TimelineGroup title="Hoy">
        <TimelineItem dateTime="2026-09-29T16:40" description="Transferencia de Acme S.A. · $ 128.400" dot="green" time="16:40" title="Pago recibido" />
        <TimelineItem dateTime="2026-09-29T09:05" description="Vence el 30 de septiembre" icon={<BellIcon />} time="09:05" title="Recordatorio enviado" />
      </TimelineGroup>
      <TimelineGroup title="Lunes 28 de septiembre">
        <TimelineItem
          actions={
            <Button size="sm" variant="plain">
              Reenviar
            </Button>
          }
          dateTime="2026-09-28T18:22"
          description="La casilla pagos@acme.example no existe"
          dot="red"
          time="18:22"
          title="El correo rebotó"
        />
        <TimelineItem dateTime="2026-09-28T18:20" description="A pagos@acme.example" icon={<MailIcon />} time="18:20" title="Factura enviada" />
        <TimelineItem dateTime="2026-09-28T18:12" description="A-0012 · $ 128.400" dot="brand" time="18:12" title="Factura emitida" />
      </TimelineGroup>
    </Timeline>
  )
}
