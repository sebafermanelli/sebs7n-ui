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
})
