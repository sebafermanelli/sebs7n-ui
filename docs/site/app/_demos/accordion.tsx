"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "sebs7n-ui/accordion"
import { Badge } from "sebs7n-ui/badge"

/**
 * Preguntas frecuentes
 * Una sola abierta a la vez: abrir otra cierra la anterior. Cada trigger vive dentro de un `<h3>`, que es lo que deja saltar de sección en sección con un lector de pantalla.
 */
export function Basico() {
  return (
    <Accordion className="w-full max-w-lg" defaultValue={["facturacion"]}>
      <AccordionItem value="facturacion">
        <AccordionTrigger>¿Cuándo se emite la factura?</AccordionTrigger>
        <AccordionContent>
          El primer día hábil de cada mes, por el período vencido. Se envía al email de facturación y queda en
          Ajustes → Facturación.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="cancelar">
        <AccordionTrigger>¿Se puede cancelar en cualquier momento?</AccordionTrigger>
        <AccordionContent>
          Sí. El plan sigue activo hasta el final del período ya pagado y no se renueva. No hay costo de baja.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="datos">
        <AccordionTrigger>¿Qué pasa con mis datos si me doy de baja?</AccordionTrigger>
        <AccordionContent>
          Quedan disponibles para exportar durante 90 días. Después se borran, y eso no se puede deshacer.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem disabled value="convenio">
        <AccordionTrigger>Facturación por convenio</AccordionTrigger>
        <AccordionContent>Solo para cuentas enterprise.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

/**
 * Varias abiertas, con contenido a la derecha del título
 * `multiple` cuando comparar dos secciones es parte del uso. El trigger es un flex: lo que pongas antes del chevron se alinea solo.
 */
export function Multiple() {
  const secciones = [
    { id: "pendientes", titulo: "Pendientes", cantidad: 3, color: "amber" as const, detalle: "0012 Acme · 0014 Bruma · 0015 Cortina" },
    { id: "vencidas", titulo: "Vencidas", cantidad: 1, color: "red" as const, detalle: "0009 Delta, vencida el 12/08." },
    { id: "pagadas", titulo: "Pagadas este mes", cantidad: 8, color: "green" as const, detalle: "$ 1.284.000 acreditados." },
  ]
  return (
    <Accordion className="w-full max-w-lg" defaultValue={["pendientes", "vencidas"]} multiple>
      {secciones.map((seccion) => (
        <AccordionItem key={seccion.id} value={seccion.id}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              {seccion.titulo}
              <Badge color={seccion.color} size="sm">
                {seccion.cantidad}
              </Badge>
            </span>
          </AccordionTrigger>
          <AccordionContent>{seccion.detalle}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/**
 * Encontrable con ⌘F
 * `hiddenUntilFound` deja el contenido cerrado en el DOM y el buscador del navegador lo encuentra y abre la sección. Cuesta markup: se pone cuando ese texto es la razón por la que alguien llega a la página.
 */
export function BuscableConElNavegador() {
  return (
    <Accordion className="w-full max-w-lg">
      <AccordionItem value="cuit">
        <AccordionTrigger>Datos fiscales</AccordionTrigger>
        <AccordionContent hiddenUntilFound>CUIT 30-71234567-8 · IVA Responsable Inscripto · IIBB Santa Fe.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="domicilio">
        <AccordionTrigger>Domicilio</AccordionTrigger>
        <AccordionContent hiddenUntilFound>Av. Pellegrini 1234, Rosario, Santa Fe.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
