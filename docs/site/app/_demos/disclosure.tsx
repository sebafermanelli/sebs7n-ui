import { Tag } from "sebs7n-ui"
import { Disclosure, DisclosureContent, DisclosureGroup, DisclosureTrigger } from "sebs7n-ui/disclosure"

const FAQ = [
  { q: "¿Puedo anular una factura ya emitida?", a: "No se borra: se emite una nota de crédito por el mismo importe, que la deja en cero." },
  { q: "¿Cuándo vence el CAE?", a: "A los diez días corridos de emitido. Pasado ese plazo, la factura hay que volver a pedirla." },
  { q: "¿Puedo facturar en dólares?", a: "Sí: la moneda se elige por factura y el tipo de cambio queda guardado con ella." },
]

/**
 * Preguntas frecuentes
 * Sin JavaScript: `<details>` y `<summary>` con las filas del `Accordion`. Con el mismo `name`, abrir una cierra la otra.
 */
export function Faq() {
  return (
    <DisclosureGroup className="max-w-lg">
      {FAQ.map((item) => (
        <Disclosure key={item.q} name="billing-faq">
          <DisclosureTrigger>{item.q}</DisclosureTrigger>
          <DisclosureContent>{item.a}</DisclosureContent>
        </Disclosure>
      ))}
    </DisclosureGroup>
  )
}

const TAGS = ["Servicios", "Productos", "Exportación", "Monotributo", "Responsable inscripto", "Notas de crédito"]

/**
 * Filtro plegado
 * `variant="inline"`: el disparador en línea, 14 y gris, arriba de una lista. Las etiquetas están en el HTML aunque esté cerrado.
 */
export function InlineFilter() {
  return (
    <Disclosure variant="inline">
      <DisclosureTrigger>
        Etiquetas <span className="tabular-nums">({TAGS.length})</span>
      </DisclosureTrigger>
      <DisclosureContent className="flex flex-wrap gap-1.5">
        {TAGS.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </DisclosureContent>
    </Disclosure>
  )
}
