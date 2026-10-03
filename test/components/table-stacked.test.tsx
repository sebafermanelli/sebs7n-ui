import { render, screen } from "@testing-library/react"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../src/components/table"

const tabla = (stacked?: boolean) =>
  render(
    <Table stacked={stacked}>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow data-state="selected">
          <TableCell stacked="full">
            <a href="/x">Acme</a>
          </TableCell>
          <TableCell stacked="corner">…</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )

describe("Table stacked", () => {
  it("sin stacked no marca el contenedor; con stacked sí (los estilos apilados cuelgan de esa marca, en base.css)", () => {
    const { container, unmount } = tabla()
    expect(container.querySelector("[data-slot=table-container]")).not.toHaveAttribute("data-stacked")
    unmount()
    const { container: c2 } = tabla(true)
    expect(c2.querySelector("[data-slot=table-container]")).toHaveAttribute("data-stacked")
  })

  it("las celdas full y corner se marcan", () => {
    tabla(true)
    const celdas = screen.getAllByRole("cell")
    expect(celdas[0]).toHaveAttribute("data-stacked", "full")
    expect(celdas[1]).toHaveAttribute("data-stacked", "corner")
  })

  it("el CSS apilado pone el fondo de selección en la fila y apaga el de las celdas", () => {
    const css = readFileSync("src/styles/base.css", "utf8")
    expect(css).toContain('[data-slot="table-container"][data-stacked]:focus-within tr[data-slot="table-row"][data-state="selected"]')
    expect(css).toMatch(/tr\[data-slot="table-row"\] > td \{[^}]*background: transparent !important/)
    expect(css).toMatch(/@media \(max-width: 39\.99rem\)/)
  })

  it("la fila elegida con foco pasa los links y los text-label* a on-selection (en base.css)", () => {
    const css = readFileSync("src/styles/base.css", "utf8")
    expect(css).toContain('tr[data-slot="table-row"][data-state="selected"] a,')
    expect(css).toContain('[data-state="selected"] [class*="text-label"] {\n    color: var(--color-on-selection);')
  })
})
