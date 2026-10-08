import { SectionHeader } from "sebs7n-ui/section-header"

/**
 * El encabezado de una sección
 * Título en la fuente de titulares y una bajada, centrados: así abre cada sección de una landing.
 */
export function Basic() {
  return <SectionHeader description="Emití, enviá y cobrá tus facturas desde un solo lugar." title="Facturación sin planillas" />
}

/**
 * Alineado a la izquierda
 * Para una sección que es una columna de texto. `level` cambia el nivel del encabezado, no su tamaño.
 */
export function Start() {
  return <SectionHeader align="start" description="Tus clientes reciben la factura y la pagan desde el mismo email." level={3} title="Cobros" />
}
