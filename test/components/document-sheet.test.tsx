import { render, screen, within } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  DocumentCitation,
  DocumentSheet,
  DocumentSheetHeader,
  DocumentSheetSection,
  DocumentSheetSummary,
  DocumentSheetTitle,
  DocumentSheetVersions,
} from "../../src/components/document-sheet"
import { LabelsProvider } from "../../src/lib/labels"

function Invoice() {
  return (
    <DocumentSheet caption="Vista previa de la factura." label="Factura F-0012">
      <DocumentSheetHeader>
        <span>Borrador</span>
        <span>Pág. 1 de 1</span>
      </DocumentSheetHeader>
      <DocumentSheetTitle>Factura F-0012</DocumentSheetTitle>
      <DocumentSheetSection heading="Conceptos">
        Servicio de soporte mensual <DocumentCitation status="verified">según la orden de compra 118</DocumentCitation> y horas
        extra <DocumentCitation status="pending">según el parte del equipo</DocumentCitation>.
      </DocumentSheetSection>
      <DocumentSheetSummary
        aria-label="Totales"
        footnote="Importes en pesos."
        items={[
          { label: "Subtotal", value: "$ 120.000" },
          { label: "IVA 21 %", value: "$ 25.200" },
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

describe("DocumentSheet", () => {
  it("es una figura con nombre y su epígrafe", () => {
    render(<Invoice />)
    const figure = screen.getByRole("figure", { name: "Factura F-0012" })
    expect(within(figure).getByText("Vista previa de la factura.").tagName).toBe("FIGCAPTION")
  })

  it("los títulos internos no son encabezados: no ensucian el esquema de la página", () => {
    render(<Invoice />)
    expect(screen.queryAllByRole("heading")).toHaveLength(0)
    expect(screen.getByText("Factura F-0012", { selector: "p" })).toHaveClass("font-display")
  })

  it("cada cita lleva su chip con el estado en texto, no solo en color", () => {
    render(<Invoice />)
    const verified = screen.getByText("según la orden de compra 118").closest("[data-slot=document-citation]")!
    expect(verified).toHaveAttribute("data-status", "verified")
    expect(within(verified as HTMLElement).getByText("Verificada")).toBeInTheDocument()
    const pending = screen.getByText("según el parte del equipo").closest("[data-slot=document-citation]")!
    expect(within(pending as HTMLElement).getByText("A verificar")).toBeInTheDocument()
  })

  it("los textos del chip se cambian por prop o por LabelsProvider", () => {
    render(
      <LabelsProvider value={{ documentSheet: { verified: "Checked" } }}>
        <DocumentCitation status="verified">x</DocumentCitation>
        <DocumentCitation labels={{ pending: "To check" }} status="pending">
          y
        </DocumentCitation>
      </LabelsProvider>
    )
    expect(screen.getByText("Checked")).toBeInTheDocument()
    expect(screen.getByText("To check")).toBeInTheDocument()
  })

  it("el resumen es una lista de definiciones y las versiones una lista ordenada con la actual marcada", () => {
    render(<Invoice />)
    const totals = screen.getByLabelText("Totales")
    expect(totals.tagName).toBe("DL")
    expect(within(totals).getByText("$ 25.200").tagName).toBe("DD")
    const versions = screen.getByRole("list", { name: "Versiones" })
    expect(versions.tagName).toBe("OL")
    const items = within(versions).getAllByRole("listitem")
    expect(items).toHaveLength(3)
    expect(items[2]).toHaveAttribute("aria-current", "step")
    expect(items[0]).not.toHaveAttribute("aria-current")
  })

  it("current elige la versión actual", () => {
    render(<DocumentSheetVersions aria-label="Versiones" current="v1" items={[{ id: "v1" }, { id: "v2" }]} />)
    expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("aria-current", "step")
  })

  it("se renderiza en el servidor", () => {
    expect(renderToString(<Invoice />)).toContain("<figure")
  })
})
