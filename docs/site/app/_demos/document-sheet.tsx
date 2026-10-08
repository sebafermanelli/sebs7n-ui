import {
  DocumentCitation,
  DocumentSheet,
  DocumentSheetHeader,
  DocumentSheetSection,
  DocumentSheetSubtitle,
  DocumentSheetSummary,
  DocumentSheetTitle,
  DocumentSheetVersions,
} from "sebs7n-ui/document-sheet"

/**
 * Una factura en papel
 * La hoja con el margen rayado, las citas con su chip de verificación, el recuadro de cifras y las versiones al pie.
 */
export function Basic() {
  return (
    <DocumentSheet caption="Vista previa: la factura todavía no se envió." className="w-full max-w-lg" label="Factura F-0012">
      <DocumentSheetHeader>
        <span>Borrador</span>
        <span>Pág. 1 de 1</span>
      </DocumentSheetHeader>
      <DocumentSheetTitle>Factura F-0012</DocumentSheetTitle>
      <DocumentSheetSubtitle>Cliente: Estudio Norte · Vence el 30 de octubre</DocumentSheetSubtitle>
      <DocumentSheetSection heading="Conceptos">
        Soporte mensual del equipo <DocumentCitation status="verified">según la orden de compra 118</DocumentCitation> y doce horas
        extra <DocumentCitation status="pending">según el parte del equipo</DocumentCitation>.
      </DocumentSheetSection>
      <DocumentSheetSummary
        aria-label="Totales"
        footnote="Importes en pesos, IVA incluido."
        items={[
          { label: "Subtotal", value: "$ 120.000" },
          { label: "IVA 21 %", value: "$ 25.200" },
          { label: "Total", value: "$ 145.200" },
        ]}
      />
      <DocumentSheetVersions
        aria-label="Versiones"
        items={[
          { id: "v1", detail: "Borrador" },
          { id: "v2", detail: "Revisada" },
          { id: "v3", detail: "Emitida" },
        ]}
      />
    </DocumentSheet>
  )
}
