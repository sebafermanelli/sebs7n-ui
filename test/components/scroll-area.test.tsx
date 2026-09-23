import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { ScrollArea } from "../../src/components/scroll-area"

const viewport = () => document.querySelector("[data-slot=scroll-area-viewport]") as HTMLElement
const scrollbars = () => [...document.querySelectorAll("[data-slot=scroll-area-scrollbar]")]

/**
 * jsdom no mide nada: sin desborde, Base UI no monta ninguna barra y deja el
 * viewport fuera del orden de tabulación. Se simulan las medidas una sola vez
 * para todo el archivo, que es la situación real de una caja con scroll.
 */
const originals = new Map<string, PropertyDescriptor | undefined>()
function fakeSize(prop: string, value: number) {
  originals.set(prop, Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop))
  Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get: () => value })
}

beforeAll(() => {
  fakeSize("scrollHeight", 600)
  fakeSize("scrollWidth", 600)
  fakeSize("clientHeight", 200)
  fakeSize("clientWidth", 200)
})

afterAll(() => {
  for (const [prop, descriptor] of originals) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, prop, descriptor)
    else Reflect.deleteProperty(HTMLElement.prototype, prop)
  }
})

/** Base UI mide en un microtask: hay que dejarlo correr antes de mirar el DOM. */
async function medir() {
  await act(async () => {})
}

describe("ScrollArea", () => {
  it("el contenido vive en un viewport con scroll nativo, alcanzable con Tab", async () => {
    render(
      <ScrollArea className="h-48 w-64">
        <p>Una lista larga</p>
      </ScrollArea>
    )
    await medir()
    expect(screen.getByText("Una lista larga")).toBeInTheDocument()
    expect(viewport()).toHaveAttribute("tabindex", "0")
    await userEvent.tab()
    expect(viewport()).toHaveFocus()
  })

  it("el foco del viewport es visible, y el scroll no se escapa a la página", async () => {
    render(
      <ScrollArea className="h-48">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    expect(viewport()).toHaveClass("focus-visible:focus-ring", "overscroll-contain")
  })

  it("por defecto solo la barra vertical; `both` agrega la horizontal y la esquina", async () => {
    const { rerender } = render(
      <ScrollArea className="h-48">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    expect(scrollbars()).toHaveLength(1)
    expect(scrollbars()[0]).toHaveAttribute("data-orientation", "vertical")
    expect(document.querySelector("[data-slot=scroll-area-corner]")).toBeNull()

    rerender(
      <ScrollArea className="h-48" orientation="both">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    expect(scrollbars().map((bar) => bar.getAttribute("data-orientation"))).toEqual(["vertical", "horizontal"])
    expect(document.querySelector("[data-slot=scroll-area-corner]")).not.toBeNull()
  })

  it('orientation="horizontal" deja solo la barra de abajo', async () => {
    render(
      <ScrollArea className="w-64" orientation="horizontal">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    expect(scrollbars()).toHaveLength(1)
    expect(scrollbars()[0]).toHaveAttribute("data-orientation", "horizontal")
  })

  it("la barra es discreta: invisible y sin capturar el puntero hasta hover o scroll", async () => {
    render(
      <ScrollArea className="h-48">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    expect(scrollbars()[0]).toHaveClass(
      "opacity-0",
      "pointer-events-none",
      "data-hovering:opacity-100",
      "data-scrolling:opacity-100",
      "data-hovering:pointer-events-auto",
      "motion-reduce:transition-none"
    )
    expect(document.querySelector("[data-slot=scroll-area-thumb]")).toHaveClass("bg-gray-alpha-500", "rounded-full")
  })

  it("no rompe el scroll nativo: el viewport es el que scrollea de verdad", async () => {
    render(
      <ScrollArea className="h-48">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    viewport().scrollTop = 120
    expect(viewport().scrollTop).toBe(120)
  })

  it("el className del llamador gana, y el padding va en el contenido", async () => {
    render(
      <ScrollArea className="h-48 overflow-visible" contentClassName="p-4" viewportClassName="rounded-none">
        <p>x</p>
      </ScrollArea>
    )
    await medir()
    const root = document.querySelector("[data-slot=scroll-area]")!
    expect(root).toHaveClass("h-48", "overflow-visible")
    expect(root.className).not.toMatch(/\boverflow-hidden\b/)
    expect(viewport()).toHaveClass("rounded-none")
    expect(document.querySelector("[data-slot=scroll-area-content]")).toHaveClass("p-4")
  })
})
