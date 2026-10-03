import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { DataTable, type DataTableColumn, type DataTableSort } from "../../src/components/data-table"

type Factura = { id: string; cliente: string; importe: number; estado: string }

const FACTURAS: Factura[] = [
  { id: "0012", cliente: "Nube Digital", importe: 96000, estado: "Pagada" },
  { id: "0013", cliente: "Acme S.A.", importe: 128400, estado: "Pendiente" },
  { id: "0014", cliente: "Óptica Sur", importe: 41200, estado: "Pagada" },
  { id: "0015", cliente: "Estudio Ruiz", importe: 7500, estado: "Vencida" },
]

const COLUMNAS: DataTableColumn<Factura>[] = [
  { id: "cliente", header: "Cliente", value: (row) => row.cliente, sortable: true },
  { id: "estado", header: "Estado", value: (row) => row.estado },
  { id: "importe", header: "Importe", value: (row) => row.importe, cell: (row) => `$ ${row.importe}`, numeric: true, sortable: true },
]

const clientes = () =>
  screen
    .getAllByRole("row")
    .filter((fila) => fila.dataset.slot === "table-row" && fila.closest("tbody"))
    .map((fila) => within(fila).getAllByRole("cell")[0]!.textContent)

function Tabla(props: Partial<React.ComponentProps<typeof DataTable<Factura>>>) {
  return <DataTable aria-label="Facturas" columns={COLUMNAS} data={FACTURAS} getRowId={(row) => row.id} {...props} />
}

describe("DataTable", () => {
  it("es una tabla con nombre, las cabeceras de las columnas y una fila por dato", () => {
    render(<Tabla />)
    const tabla = screen.getByRole("table", { name: "Facturas" })
    expect(within(tabla).getAllByRole("columnheader").map((th) => th.textContent)).toEqual(["Cliente", "Estado", "Importe"])
    expect(clientes()).toEqual(["Nube Digital", "Acme S.A.", "Óptica Sur", "Estudio Ruiz"])
    // `cell` dibuja la celda; `numeric` la alinea a la derecha con cifras tabulares.
    expect(screen.getByText("$ 96000")).toHaveClass("text-right", "tabular-nums")
  })

  it("ordena con el botón de la cabecera: ascendente, descendente y sin orden, con aria-sort", async () => {
    const onSortChange = vi.fn()
    render(<Tabla onSortChange={onSortChange} />)
    const cabecera = screen.getByRole("columnheader", { name: /Cliente/ })
    expect(cabecera).not.toHaveAttribute("aria-sort")
    await userEvent.click(within(cabecera).getByRole("button", { name: "Cliente" }))
    expect(cabecera).toHaveAttribute("aria-sort", "ascending")
    // Sin tildes que desordenen: «Óptica» va después de «Nube».
    expect(clientes()).toEqual(["Acme S.A.", "Estudio Ruiz", "Nube Digital", "Óptica Sur"])
    expect(onSortChange).toHaveBeenLastCalledWith({ id: "cliente", direction: "asc" })
    await userEvent.click(within(cabecera).getByRole("button"))
    expect(cabecera).toHaveAttribute("aria-sort", "descending")
    expect(clientes()).toEqual(["Óptica Sur", "Nube Digital", "Estudio Ruiz", "Acme S.A."])
    await userEvent.click(within(cabecera).getByRole("button"))
    expect(cabecera).not.toHaveAttribute("aria-sort")
    expect(clientes()).toEqual(["Nube Digital", "Acme S.A.", "Óptica Sur", "Estudio Ruiz"])
    expect(onSortChange).toHaveBeenLastCalledWith(null)
  })

  it("con el teclado: Tab llega al botón de la cabecera y Enter ordena", async () => {
    render(<Tabla />)
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cliente" }))
    await userEvent.keyboard("{Enter}")
    expect(screen.getByRole("columnheader", { name: /Cliente/ })).toHaveAttribute("aria-sort", "ascending")
  })

  it("los números se ordenan como números y las columnas sin sortable no tienen botón", async () => {
    render(<Tabla defaultSort={{ id: "importe", direction: "desc" }} />)
    expect(clientes()).toEqual(["Acme S.A.", "Nube Digital", "Óptica Sur", "Estudio Ruiz"])
    expect(within(screen.getByRole("columnheader", { name: "Estado" })).queryByRole("button")).toBeNull()
  })

  it("el orden se puede controlar", async () => {
    function Controlada() {
      const [sort, setSort] = React.useState<DataTableSort>({ id: "importe", direction: "asc" })
      return <Tabla onSortChange={setSort} sort={sort} />
    }
    render(<Controlada />)
    expect(clientes()[0]).toBe("Estudio Ruiz")
    await userEvent.click(screen.getByRole("button", { name: "Importe" }))
    expect(clientes()[0]).toBe("Acme S.A.")
  })

  it("filtro: la búsqueda de iCloud, sin tildes ni mayúsculas, y el total en una región viva", async () => {
    render(<Tabla filter />)
    // La búsqueda de la barra es `sm` (28), como los botones y selectores de la barra.
    expect(screen.getByRole("searchbox")).toHaveAttribute("data-size", "sm")
    const buscar = screen.getByRole("searchbox", { name: "Buscar" })
    await userEvent.type(buscar, "optica")
    expect(clientes()).toEqual(["Óptica Sur"])
    // Se anuncia cuando se deja de tipear, no con cada tecla.
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("1 resultado"))
    await userEvent.clear(buscar)
    await userEvent.type(buscar, "pagada")
    expect(clientes()).toEqual(["Nube Digital", "Óptica Sur"])
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 resultados"))
  })

  it("vacío: una fila que lo dice, con el texto propio si viene", async () => {
    render(<Tabla empty="No hay facturas con ese criterio." filter />)
    await userEvent.type(screen.getByRole("searchbox"), "zzz")
    const celda = screen.getByRole("cell", { name: "No hay facturas con ese criterio." })
    expect(celda).toHaveAttribute("colspan", "3")
  })

  it("páginas: pageSize corta y Pagination cambia de página; filtrar vuelve a la primera", async () => {
    render(<Tabla filter pageSize={2} />)
    expect(clientes()).toEqual(["Nube Digital", "Acme S.A."])
    await userEvent.click(screen.getByRole("button", { name: "Página 2" }))
    expect(clientes()).toEqual(["Óptica Sur", "Estudio Ruiz"])
    expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page")
    await userEvent.type(screen.getByRole("searchbox"), "a")
    expect(screen.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page")
  })

  it("«Cargar más»: suma una página abajo y desaparece al final", async () => {
    render(<Tabla pageSize={3} paging="more" />)
    expect(clientes()).toHaveLength(3)
    expect(screen.queryByRole("navigation")).toBeNull()
    await userEvent.click(screen.getByRole("button", { name: "Cargar más" }))
    expect(clientes()).toHaveLength(4)
    expect(screen.queryByRole("button", { name: "Cargar más" })).toBeNull()
  })

  it("selección: casilla por fila con nombre, todas, indeterminada, y la fila elegida", async () => {
    const onSelectedChange = vi.fn()
    render(<Tabla onSelectedChange={onSelectedChange} selectable />)
    const todas = screen.getByRole("checkbox", { name: "Seleccionar todas" })
    await userEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Acme S.A." }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(["0013"])
    expect(todas).toHaveAttribute("aria-checked", "mixed")
    expect(screen.getByRole("checkbox", { name: "Seleccionar Acme S.A." }).closest("tr")).toHaveAttribute("data-state", "selected")
    await userEvent.click(todas)
    expect(onSelectedChange).toHaveBeenLastCalledWith(["0012", "0013", "0014", "0015"])
    expect(todas).toHaveAttribute("aria-checked", "true")
    await userEvent.click(todas)
    expect(onSelectedChange).toHaveBeenLastCalledWith([])
  })

  it("«todas» son las que se ven: con páginas, las de la página", async () => {
    const onSelectedChange = vi.fn()
    render(<Tabla onSelectedChange={onSelectedChange} pageSize={2} selectable />)
    await userEvent.click(screen.getByRole("checkbox", { name: "Seleccionar todas" }))
    expect(onSelectedChange).toHaveBeenLastCalledWith(["0012", "0013"])
  })

  it("cargando: aria-busy y filas de esqueleto en lugar de los datos", () => {
    render(<Tabla loading loadingRows={3} />)
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true")
    expect(document.querySelectorAll("tbody [data-slot=skeleton]").length).toBe(9)
    expect(screen.queryByText("Acme S.A.")).toBeNull()
  })

  it("grupos: un TableBody por grupo con su título y el contador", () => {
    render(<Tabla groupBy={(row) => row.estado} />)
    const titulos = screen.getAllByRole("rowheader")
    expect(titulos.map((th) => th.textContent)).toEqual(["Pagada 2 ítems", "Pendiente 1 ítem", "Vencida 1 ítem"])
    expect(titulos[0]).toHaveAttribute("scope", "rowgroup")
    expect(document.querySelectorAll("tbody")).toHaveLength(3)
  })

  it("una fecha sin `cell` se escribe con el locale de la tabla", () => {
    type Pago = { id: string; fecha: Date }
    const columnas: DataTableColumn<Pago>[] = [{ id: "fecha", header: "Fecha", value: (row) => row.fecha }]
    render(<DataTable aria-label="Pagos" columns={columnas} data={[{ id: "1", fecha: new Date(2026, 0, 5) }]} getRowId={(row) => row.id} locale="en-US" />)
    expect(screen.getByRole("cell")).toHaveTextContent("1/5/2026")
  })

  it("la selección que no se ve (otra página, filtrada) se anuncia con el total", async () => {
    render(<Tabla defaultSelected={["0013", "0015"]} filter pageSize={2} selectable />)
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("2 seleccionadas"))
  })

  it("una página controlada que ya no existe se corrige con onPageChange", () => {
    const onPageChange = vi.fn()
    render(<Tabla onPageChange={onPageChange} page={3} pageSize={2} />)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it("«Cargar más» vuelve a una página cuando cambian los datos", async () => {
    const { rerender } = render(<Tabla pageSize={2} paging="more" />)
    await userEvent.click(screen.getByRole("button", { name: "Cargar más" }))
    expect(clientes()).toHaveLength(4)
    rerender(<Tabla data={[...FACTURAS].reverse()} pageSize={2} paging="more" />)
    expect(clientes()).toHaveLength(2)
  })

  it("cargando: los esqueletos no se leen y la región dice «Cargando…»", async () => {
    render(<Tabla filter loading />)
    for (const fila of document.querySelectorAll("tbody tr")) expect(fila).toHaveAttribute("aria-hidden", "true")
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Cargando…"))
  })

  it("grupos: el contador es el del grupo entero, no el de la página", () => {
    render(<Tabla groupBy={(row) => row.estado} pageSize={2} />)
    // Página 1: Nube Digital (Pagada) y Acme (Pendiente); Pagada tiene 2 en total.
    expect(screen.getAllByRole("rowheader").map((th) => th.textContent)).toEqual(["Pagada 2 ítems", "Pendiente 1 ítem"])
  })
})
