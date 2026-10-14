import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Tabs, TabsList, TabsTrigger } from "../../src/components/tabs"

describe("TabsList line: pestañas que no entran", () => {
  it("sin desborde no marca bordes ni se sale de su caja", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Una</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const list = screen.getByRole("tablist")
    expect(list).not.toHaveAttribute("data-overflow-end")
    expect(list).not.toHaveAttribute("data-overflow-start")
    expect(list).toHaveClass("w-full", "overflow-x-auto")
  })

  it("con más pestañas de las que entran, marca el borde derecho para desvanecerlo", () => {
    const proto = HTMLElement.prototype
    const sw = Object.getOwnPropertyDescriptor(proto, "scrollWidth")
    const cw = Object.getOwnPropertyDescriptor(proto, "clientWidth")
    Object.defineProperty(proto, "scrollWidth", { configurable: true, get: () => 500 })
    Object.defineProperty(proto, "clientWidth", { configurable: true, get: () => 300 })
    try {
      render(
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Una</TabsTrigger>
            <TabsTrigger value="b">Notificaciones</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      const list = screen.getByRole("tablist")
      expect(list).toHaveAttribute("data-overflow-end")
      expect(list).not.toHaveAttribute("data-overflow-start")
    } finally {
      if (sw) Object.defineProperty(proto, "scrollWidth", sw)
      else delete (proto as unknown as Record<string, unknown>).scrollWidth
      if (cw) Object.defineProperty(proto, "clientWidth", cw)
      else delete (proto as unknown as Record<string, unknown>).clientWidth
    }
  })

  // 4.0.1: dentro de un flex/grid la raíz y la tira se quedaban en el ancho de todas las pestañas, nunca
  // desbordaban y la última quedaba cortada sin desvanecido.
  it("la raíz y la tira pueden achicarse (min-w-0) para desbordar y mostrar el aviso", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="t">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole("tablist")).toHaveClass("min-w-0", "max-w-full")
    expect(screen.getByRole("tablist").parentElement).toHaveClass("min-w-0")
  })
})
