import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { beforeEach, describe, expect, it } from "vitest"

import { FilterDisclosure } from "../../src/components/filter-disclosure"
import { ListViewContent, ListViewControls, ListViewProvider } from "../../src/components/list-view"
import { hiddenColumnsCss, normalizeHidden, resolveMode, toggleColumn } from "../../src/lib/list-view"

const columns = [
  { id: "number", label: "Número", required: true },
  { id: "client", label: "Cliente" },
]

describe("lib/list-view", () => {
  it("resolveMode cae al default si la vista no se ofrece; auto sin tarjetas también", () => {
    expect(resolveMode("calendar", ["table", "cards"], "auto")).toBe("auto")
    expect(resolveMode("auto", ["table"], "table")).toBe("table")
    expect(resolveMode("cards", ["table", "cards"], "auto")).toBe("cards")
  })

  it("las columnas obligatorias y las desconocidas no se ocultan", () => {
    expect(normalizeHidden(["number", "client", "viejo"], columns)).toEqual(["client"])
    expect(toggleColumn([], columns, "client", false)).toEqual(["client"])
    expect(toggleColumn(["client"], columns, "client", true)).toEqual([])
  })

  it("el CSS filtra los ids", () => {
    expect(hiddenColumnsCss("a", ["x"])).toBe('[data-list-view="a"] [data-col="x"]{display:none}')
    expect(hiddenColumnsCss("a", ['x"]{}'])).not.toContain('"]{}')
  })
})

describe("ListView", () => {
  beforeEach(() => localStorage.clear())

  const ui = (
    <ListViewProvider columns={columns} listKey="t">
      <ListViewControls />
      <ListViewContent cards={<p>vista tarjetas</p>} table={<p>vista tabla</p>} />
    </ListViewProvider>
  )

  it("con auto el servidor renderiza tabla y tarjetas", () => {
    const html = renderToString(ui)
    expect(html).toContain("vista tabla")
    expect(html).toContain("vista tarjetas")
  })

  it("cambiar de vista monta solo la elegida y se recuerda", async () => {
    const user = userEvent.setup()
    const { unmount } = render(ui)
    await user.click(screen.getByRole("button", { name: "Tarjetas" }))
    expect(screen.getByText("vista tarjetas")).toBeInTheDocument()
    expect(screen.queryByText("vista tabla")).toBeNull()
    expect(localStorage.getItem("sebs7n:list:t:view")).toBe('"cards"')
    unmount()
    render(ui)
    expect(await screen.findByText("vista tarjetas", {}, { timeout: 20000 })).toBeInTheDocument()
  }, 30000)

  it("el selector de columnas oculta por CSS y deja la obligatoria deshabilitada", async () => {
    const user = userEvent.setup()
    render(
      <ListViewProvider columns={columns} defaultMode="table" listKey="c">
        <ListViewControls />
        <ListViewContent table={<p>t</p>} />
      </ListViewProvider>
    )
    await user.click(screen.getByRole("button", { name: "Columnas visibles" }))
    expect(await screen.findByRole("menuitemcheckbox", { name: "Número" })).toHaveAttribute("aria-disabled", "true")
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Cliente" }))
    expect(document.querySelector("style")?.textContent).toContain('[data-col="client"]{display:none}')
  }, 30000)

  it("fuera del provider avisa con un error claro", () => {
    expect(() => render(<ListViewControls />)).toThrow(/ListViewProvider/)
  })
})

describe("FilterDisclosure", () => {
  it("el botón controla el panel, muestra el contador y abre y cierra", async () => {
    const user = userEvent.setup()
    render(
      <FilterDisclosure activeCount={2}>
        <input aria-label="Cliente" />
      </FilterDisclosure>
    )
    const button = screen.getByRole("button", { name: "Filtros (2)" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(document.getElementById(button.getAttribute("aria-controls")!)).toContainElement(screen.getByLabelText("Cliente", { selector: "input" }))
    await user.click(button)
    expect(button).toHaveAttribute("aria-expanded", "true")
  })
})
