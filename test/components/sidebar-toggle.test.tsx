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
  it("el botón de ícono plain de 28 con PanelLeft, nombre y aria-expanded según el Sidebar", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Shell onChange={onChange} />)
    const button = screen.getByRole("button", { name: "Plegar barra lateral" })
    expect(button).toHaveAttribute("data-size", "icon-sm")
    expect(button).toHaveAttribute("data-slot", "sidebar-toggle")
    expect(button).toHaveAttribute("aria-expanded", "true")
    expect(button).toHaveAttribute("aria-controls", "app-sidebar")
    expect(button.querySelector("svg.lucide-panel-left")).not.toBeNull()
    await user.click(button)
    expect(onChange).toHaveBeenCalledWith(true)
    const expand = screen.getByRole("button", { name: "Desplegar barra lateral" })
    expect(expand).toHaveAttribute("aria-expanded", "false")
    await user.click(expand)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it("controlado por props, afuera de un Sidebar", async () => {
    const user = userEvent.setup()
    const onCollapsedChange = vi.fn()
    render(<SidebarToggle aria-controls="panel" collapsed onCollapsedChange={onCollapsedChange} />)
    const button = screen.getByRole("button", { name: "Desplegar barra lateral" })
    expect(button).toHaveAttribute("aria-expanded", "false")
    expect(button).toHaveAttribute("aria-controls", "panel")
    await user.click(button)
    expect(onCollapsedChange).toHaveBeenCalledWith(false)
  })

  it("va a la derecha del encabezado y, plegado, arriba de todo y centrado", () => {
    render(<Shell />)
    expect(screen.getByRole("button")).toHaveClass("ms-auto", "group-data-collapsed/sidebar:order-first", "group-data-collapsed/sidebar:ms-0")
  })

  it("los textos salen de LabelsProvider (sidebar.collapse / expand) y la prop labels gana", () => {
    render(
      <LabelsProvider value={{ sidebar: { collapse: "Collapse sidebar" } }}>
        <SidebarToggle collapsed={false} labels={{ expand: "Show sidebar" }} />
        <SidebarToggle collapsed labels={{ expand: "Show sidebar" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Collapse sidebar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Show sidebar" })).toBeInTheDocument()
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
