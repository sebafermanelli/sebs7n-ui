// El sitio corre en entorno `node` sin jsdom. Usamos `renderToString` igual que showcase.test.ts.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { InvoiceTable } from "../app/templates/dashboard/_components/invoice-table"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"

describe("invoice table & dialogs", () => {
  it("renderiza las columnas de tabla para las facturas", () => {
    const html = renderToString(
      createElement(InvoiceTable, {
        invoices: INVOICES_MOCK,
        onMarkAsPaid: () => {},
        onOpenVoidDialog: () => {},
      })
    )
    expect(html).toContain("FAC-1001")
    expect(html).toContain("Acme Corporation")
  })

  it("renderiza mensaje vacío cuando no hay facturas", () => {
    const html = renderToString(
      createElement(InvoiceTable, {
        invoices: [],
        onMarkAsPaid: () => {},
        onOpenVoidDialog: () => {},
      })
    )
    expect(html).toContain("No se encontraron facturas")
  })

  it("muestra todas las columnas en la cabecera de la tabla", () => {
    const html = renderToString(
      createElement(InvoiceTable, {
        invoices: INVOICES_MOCK,
        onMarkAsPaid: () => {},
        onOpenVoidDialog: () => {},
      })
    )
    expect(html).toContain("Número")
    expect(html).toContain("Cliente")
    expect(html).toContain("Monto")
    expect(html).toContain("Estado")
  })
})
