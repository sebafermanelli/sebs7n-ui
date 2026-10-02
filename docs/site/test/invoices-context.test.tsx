import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { useInvoicesStore } from "../app/templates/dashboard/_state/invoices-context"
import { renderWithInvoices } from "./dashboard-render"

function Probe() {
  const { invoices, loading, metrics } = useInvoicesStore()
  return createElement("p", null, `${loading ? "cargando" : "listo"} ${invoices.length} ${metrics.pendingCount}`)
}

describe("InvoicesProvider", () => {
  it("arranca cargando cuando simula el fetch", () => {
    expect(renderWithInvoices(createElement(Probe), true)).toContain("cargando 24")
  })

  it("sin simular, entrega las 24 facturas y sus métricas", () => {
    expect(renderWithInvoices(createElement(Probe))).toMatch(/listo 24 \d+/)
  })

  it("fuera del provider avisa con un error claro", () => {
    expect(() => renderToString(createElement(Probe))).toThrow("useInvoicesStore necesita <InvoicesProvider>")
  })
})
