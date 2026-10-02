import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { InvoicesDataTable } from "../app/templates/dashboard/_components/invoices-data-table"
import { INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"

const noop = () => {}
const render = (over: Record<string, unknown> = {}) =>
  renderToString(
    createElement(InvoicesDataTable, {
      invoices: INVOICES_MOCK,
      loading: false,
      selected: [],
      onSelectedChange: noop,
      onMarkPaid: noop,
      onOpenDetail: noop,
      onVoid: noop,
      ...over,
    })
  )

describe("tabla de facturas", () => {
  it("pagina de a 10 y trae la paginación", () => {
    const html = render()
    expect((html.match(/data-slot="table-row"/g) ?? []).length).toBeGreaterThanOrEqual(10)
    expect(html).toContain('data-slot="pagination"')
  })

  it("el número abre el detalle: es un botón, no un link", () => {
    expect(render()).toMatch(/<button[^>]*>FAC-\d{4}<\/button>/)
  })

  it("con selección aparecen las acciones masivas", () => {
    const html = render({ selected: ["FAC-1001", "FAC-1004"] })
    expect(html).toContain("2 seleccionadas")
    expect(html).toContain("Marcar cobradas")
  })

  it("cargando, filas de esqueleto", () => {
    expect(render({ loading: true })).toContain('aria-busy="true"')
  })
})
