import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { DropdownMenuItem } from "../../src/components/dropdown-menu"
import { MetricChart } from "../../src/components/metric-chart"
import { StatGrid, type StatGridItem } from "../../src/components/stat-grid"

const item = (n: number): StatGridItem => ({ label: `Indicador ${n}`, value: `${n}00`, hint: "este mes" })
const items = (n: number) => Array.from({ length: n }, (_, i) => item(i + 1))
const grid = () => document.querySelector("[data-slot=stat-grid]")!

describe("StatGrid", () => {
  it("un Stat dentro de una Card por indicador, con delta, hint, aside y badge", () => {
    render(
      <StatGrid
        items={[
          { label: "Cobrado", value: "US$ 100", delta: "+12 %", trend: "up", hint: "vs. mes anterior" },
          { label: "Vencidas", value: "3", aside: "US$ 50", badge: { text: "Al día", color: "green" } },
        ]}
      />
    )
    expect(document.querySelectorAll("[data-slot=stat]")).toHaveLength(2)
    expect(screen.getByText("+12 %")).toBeInTheDocument()
    expect(screen.getByText("vs. mes anterior")).toBeInTheDocument()
    expect(screen.getByText("US$ 50")).toBeInTheDocument()
    expect(screen.getByText("Al día")).toBeInTheDocument()
  })

  it("1 columna en el teléfono; 3 indicadores, 3 en una fila (sin huérfano); 4, 2 en tablet y 4 en escritorio", () => {
    const { rerender } = render(<StatGrid items={items(3)} />)
    expect(grid()).toHaveClass("grid-cols-1", "@3xl:grid-cols-3")
    rerender(<StatGrid items={items(4)} />)
    expect(grid()).toHaveClass("grid-cols-1", "@lg:grid-cols-2", "@4xl:grid-cols-4")
    rerender(<StatGrid items={items(6)} />)
    expect(grid()).toHaveClass("@lg:grid-cols-2", "@4xl:grid-cols-3")
    rerender(<StatGrid items={items(2)} />)
    expect(grid()).toHaveClass("@lg:grid-cols-2")
    expect(grid()).not.toHaveClass("@4xl:grid-cols-4")
  })

  it("responde al ancho de su caja: la grilla va dentro de un @container y sin breakpoints de ventana", () => {
    render(<StatGrid items={items(4)} />)
    expect(grid().parentElement).toHaveAttribute("data-slot", "stat-grid-container")
    expect(grid().parentElement).toHaveClass("@container", "w-full")
    expect(grid().className).not.toMatch(/(^|\s)(sm|md|lg|xl):/)
  })

  it("columns fija el máximo", () => {
    render(<StatGrid columns={2} items={items(4)} />)
    expect(grid()).toHaveClass("@lg:grid-cols-2")
    expect(grid()).not.toHaveClass("@4xl:grid-cols-4")
  })

  it("loading: los rótulos quedan, las cifras son esqueleto y la región está ocupada", () => {
    render(<StatGrid items={items(3)} loading />)
    expect(screen.getByText("Indicador 1")).toBeInTheDocument()
    expect(screen.queryByText("100")).toBeNull()
    expect(document.querySelectorAll("[data-slot=skeleton]")).toHaveLength(3)
    expect(grid()).toHaveAttribute("aria-busy", "true")
  })

  it("sin loading no hay aria-busy ni esqueleto", () => {
    render(<StatGrid items={items(3)} />)
    expect(grid()).not.toHaveAttribute("aria-busy")
    expect(document.querySelector("[data-slot=skeleton]")).toBeNull()
  })

  it("renderiza en el servidor y no es un Client Component", async () => {
    expect(renderToString(<StatGrid items={items(2)} />)).toContain("Indicador 2")
    const { readFileSync } = await import("node:fs")
    expect(readFileSync(`${import.meta.dirname}/../../src/components/stat-grid.tsx`, "utf8")).not.toMatch(/^"use client"/)
  })
})

describe("chart", () => {
  it("va al pie de la card, decorativo, y las cards de una fila lo alinean abajo", () => {
    const { container } = render(<StatGrid items={[{ ...item(1), chart: <svg data-testid="curve" /> }, item(2)]} />)
    const slot = container.querySelector("[data-slot=stat-grid-chart]")!
    // El slot ya no es `aria-hidden`: un `MetricChart` es interactivo. Un `Sparkline` se oculta solo.
    expect(slot.getAttribute("aria-hidden")).toBeNull()
    expect(slot.className).toContain("mt-auto")
    expect(slot.querySelector("[data-testid=curve]")).not.toBeNull()
    expect(container.querySelectorAll("[data-slot=stat-grid-chart]")).toHaveLength(1)
  })

  it("cargando, el gráfico pasa a esqueleto del mismo alto", () => {
    const { container } = render(<StatGrid items={[{ ...item(1), chart: <svg data-testid="curve" /> }]} loading />)
    expect(container.querySelector("[data-testid=curve]")).toBeNull()
    expect(container.querySelector("[data-slot=stat-grid-chart] [data-slot=skeleton]")).not.toBeNull()
  })
})

describe("chartLayout", () => {
  const withChart = [{ ...item(1), chart: <svg /> }]

  it("por defecto el gráfico va pegado a los bordes de la card (la card lo recorta)", () => {
    const { container } = render(<StatGrid items={withChart} />)
    const slot = container.querySelector("[data-slot=stat-grid-chart]")!
    expect(slot.className).toContain("-mx-(--card-spacing)")
    expect(slot.className).toContain("-mb-(--card-spacing)")
  })

  it("con `inset` queda adentro del padding", () => {
    const { container } = render(<StatGrid chartLayout="inset" items={withChart} />)
    expect(container.querySelector("[data-slot=stat-grid-chart]")!.className).not.toContain("-mx-")
  })
})

describe("StatGrid: acciones y gráfico", () => {
  it("actions dibuja el botón «…» con nombre «Opciones de {label}» y abre el menú", async () => {
    // El menú llega con `import()`: se precarga antes de medir, así en CI lento no vence el plazo del `findBy`.
    await import("../../src/internal/stat-actions-menu")
    const user = userEvent.setup()
    render(
      <StatGrid
        items={[
          {
            label: "Cobrado",
            value: "1",
            actions: <DropdownMenuItem>Ver detalle</DropdownMenuItem>,
          },
          { label: "Sin menú", value: "2" },
        ]}
      />
    )
    expect(screen.getAllByRole("button")).toHaveLength(1)
    await user.click(screen.getByRole("button", { name: "Opciones de Cobrado" }))
    expect(await screen.findByRole("menuitem", { name: "Ver detalle" }, { timeout: 15000 })).toBeInTheDocument()
  }, 20000)

  it("labels.actions cambia el nombre del botón", () => {
    render(<StatGrid items={[{ label: "Paid", value: "1", actions: <DropdownMenuItem>x</DropdownMenuItem> }]} labels={{ actions: "{label} options" }} />)
    expect(screen.getByRole("button", { name: "Paid options" })).toBeInTheDocument()
  })

  it("con chart, la variación va junto a la cifra y el gráfico no queda oculto al lector", () => {
    render(<StatGrid items={[{ label: "Cobrado", value: "US$ 1", delta: "↘ 7,1 %", trend: "down", chart: <MetricChart aria-label="Cobros" data={[{ label: "a", value: 1 }, { label: "b", value: 2 }]} /> }]} />)
    expect(screen.getByText("↘ 7,1 %").parentElement).toContainElement(screen.getByText("US$ 1"))
    expect(screen.getByRole("img", { name: "Cobros" })).toBeInTheDocument()
  })

  it("cargando, el botón «…» queda deshabilitado y el gráfico es esqueleto", () => {
    render(<StatGrid items={[{ label: "Cobrado", value: "1", chart: <div />, actions: <DropdownMenuItem>x</DropdownMenuItem> }]} loading />)
    expect(screen.getByRole("button", { name: "Opciones de Cobrado" })).toBeDisabled()
    expect(document.querySelectorAll("[data-slot=skeleton]")).toHaveLength(2)
  })
})
