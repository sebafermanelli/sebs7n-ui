import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { DataTable, type DataTableColumn } from "../../src/components/data-table"
import { SortableTableHead, nextSortDirection } from "../../src/components/sortable-table-head"
import { Table, TableHeader, TableRow } from "../../src/components/table"

const href = (next: "asc" | "desc" | null) => (next ? `/facturas?sort=amount&dir=${next}` : "/facturas")
const tabla = (head: React.ReactNode) => render(<Table><TableHeader><TableRow>{head}</TableRow></TableHeader></Table>)

describe("SortableTableHead", () => {
  it("el ciclo: sin orden → asc → desc → sin orden", () => {
    expect(nextSortDirection(null)).toBe("asc")
    expect(nextSortDirection("asc")).toBe("desc")
    expect(nextSortDirection("desc")).toBeNull()
  })

  it("por href: un <a> real con el siguiente estado y aria-sort en el <th>", () => {
    const { rerender } = tabla(<SortableTableHead href={href}>Importe</SortableTableHead>)
    expect(screen.getByRole("link", { name: "Importe" })).toHaveAttribute("href", "/facturas?sort=amount&dir=asc")
    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort")
    rerender(<Table><TableHeader><TableRow><SortableTableHead direction="asc" href={href}>Importe</SortableTableHead></TableRow></TableHeader></Table>)
    expect(screen.getByRole("link", { name: "Importe" })).toHaveAttribute("href", "/facturas?sort=amount&dir=desc")
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending")
    rerender(<Table><TableHeader><TableRow><SortableTableHead direction="desc" href={href}>Importe</SortableTableHead></TableRow></TableHeader></Table>)
    expect(screen.getByRole("link", { name: "Importe" })).toHaveAttribute("href", "/facturas")
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending")
  })

  it("por onSort: un botón que avisa el siguiente estado", async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    tabla(<SortableTableHead direction="asc" onSort={onSort}>Cliente</SortableTableHead>)
    await user.click(screen.getByRole("button", { name: "Cliente" }))
    expect(onSort).toHaveBeenCalledWith("desc")
  })

  it("renderLink: el link de la app (next/link) recibe href y clases", () => {
    tabla(<SortableTableHead href={href} renderLink={(props) => <a data-app-link="" {...props} />}>Importe</SortableTableHead>)
    const link = screen.getByRole("link", { name: "Importe" })
    expect(link).toHaveAttribute("data-app-link")
    expect(link.className).toContain("h-7")
  })

  it("sirve en un Server Component: renderiza a HTML con el <a> y sin JS", () => {
    const html = renderToString(<Table><TableHeader><TableRow><SortableTableHead direction="desc" href={href} numeric>Importe</SortableTableHead></TableRow></TableHeader></Table>)
    expect(html).toContain('aria-sort="descending"')
    expect(html).toContain('<a class="')
    expect(html).toContain("flex-row-reverse")
  })

  it("el mismo aspecto que el encabezado sortable de DataTable (comparten clases)", () => {
    type Fila = { a: number }
    const columns: DataTableColumn<Fila>[] = [{ id: "a", header: "Importe", sortable: true, value: (r) => r.a, numeric: true }]
    const { container } = render(<DataTable aria-label="t" columns={columns} data={[{ a: 1 }]} getRowId={(r) => String(r.a)} />)
    const del = container.querySelector("[data-slot=data-table-sort]")!.className
    tabla(<SortableTableHead direction={null} href={href} numeric>Importe</SortableTableHead>)
    expect(screen.getByRole("link", { name: "Importe" }).className).toBe(del)
  })
})
