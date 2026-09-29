import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Sidebar, SidebarHeader } from "../../src/components/sidebar"
import { SidebarToggle } from "../../src/components/sidebar-toggle"
import { SidebarInSheetContext } from "../../src/internal/shell-context"
import { LabelsProvider } from "../../src/lib/labels"

function Shell({ onChange }: { onChange?: (collapsed: boolean) => void }) {
  const [collapsed, setCollapsed] = React.useState(false)
  return (
    <Sidebar collapsed={collapsed} id="app-sidebar">
      <SidebarHeader>
        <SidebarToggle
          onCollapsedChange={(next) => {
            setCollapsed(next)
            onChange?.(next)
          }}
        />
      </SidebarHeader>
    </Sidebar>
  )
}

describe("SidebarToggle", () => {
  it("el botón de ícono plain de 28 con PanelLeft, nombre fijo y aria-expanded según el Sidebar", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Shell onChange={onChange} />)
    // El nombre no cambia con el estado: aria-expanded ya lo dice (y el lector no lee «Plegar… contraído»).
    const button = screen.getByRole("button", { name: "Barra lateral" })
    expect(button).toHaveAttribute("data-size", "icon-sm")
    expect(button).toHaveAttribute("data-slot", "sidebar-toggle")
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(button).toHaveAttribute("aria-controls", "app-sidebar")
    expect(document.getElementById("app-sidebar")).toHaveAttribute("data-slot", "sidebar")
    expect(button.querySelector("svg.lucide-panel-left")).not.toBeNull()
    await user.click(button)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(button).toHaveAccessibleName("Barra lateral")
    expect(button).toHaveAttribute("aria-expanded", "false")
    await user.click(button)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it("un Sidebar sin id: sin aria-controls (uno que apunta a nada es peor que ninguno)", () => {
    render(
      <Sidebar>
        <SidebarHeader>
          <SidebarToggle />
        </SidebarHeader>
      </Sidebar>
    )
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-controls")
  })

  it("el ref de la app llega al botón y el propio sigue leyendo el id del Sidebar", () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <Sidebar id="app-sidebar">
        <SidebarHeader>
          <SidebarToggle ref={ref} />
        </SidebarHeader>
      </Sidebar>
    )
    expect(ref.current).toBe(screen.getByRole("button"))
    expect(ref.current).toHaveAttribute("aria-controls", "app-sidebar")
  })

  it("controlado por props, afuera de un Sidebar", async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    render(<SidebarToggle aria-controls="panel" collapsed onCollapsedChange={onCollapsedChange} />)
    const button = screen.getByRole("button", { name: "Barra lateral" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).toHaveAttribute("aria-controls", "panel")
    await user.click(button)
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
  })

  it("va a la derecha del encabezado y, plegado, arriba de todo y centrado", () => {
    render(<Shell />)
    expect(screen.getByRole("button")).toHaveClass("ms-auto", "group-data-collapsed/sidebar:order-first", "group-data-collapsed/sidebar:ms-0")
  })

  it("el nombre sale de LabelsProvider (sidebar.toggle) y la prop labels gana; collapse/expand son el tooltip", async () => {
    render(
      <LabelsProvider value={{ sidebar: { toggle: "Sidebar" } }}>
        <SidebarToggle collapsed={false} />
        <SidebarToggle collapsed labels={{ toggle: "Panel" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Sidebar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Panel" })).toBeInTheDocument()
  })

  it("adentro del Sheet del teléfono no se dibuja: ahí no hay nada que plegar", () => {
    render(
      <SidebarInSheetContext.Provider value={true}>
        <Sidebar>
          <SidebarHeader>
            <SidebarToggle />
          </SidebarHeader>
        </Sidebar>
      </SidebarInSheetContext.Provider>
    )
    expect(screen.queryByRole("button")).toBeNull()
  })
})
