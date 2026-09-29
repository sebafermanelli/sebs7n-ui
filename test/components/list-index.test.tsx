import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { ListIndex, listIndexLabels } from "../../src/components/list-index"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

const CON_SECCION = ["A", "C", "F", "M"]

/** Secciones de clientes con los ids que busca el índice (`#A`, `#C`…). */
function Clientes() {
  return (
    <>
      {CON_SECCION.map((letter) => (
        <section key={letter} id={letter}>
          <h3>{letter}</h3>
        </section>
      ))}
      <ListIndex available={CON_SECCION} />
    </>
  )
}

describe("ListIndex", () => {
  // jsdom no tiene `elementFromPoint` ni `scrollIntoView`: cada test que los necesita los pone, y acá
  // se sacan para que no le queden al siguiente.
  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(document, "elementFromPoint")
    Reflect.deleteProperty(Element.prototype, "scrollIntoView")
  })

  it("es un nav nombrado con una lista ordenada de las 26 letras", () => {
    render(<ListIndex available={CON_SECCION} />)
    const nav = screen.getByRole("navigation", { name: "Índice alfabético" })
    expect(within(nav).getAllByRole("listitem")).toHaveLength(26)
    expect(within(nav).getAllByRole("link").map((link) => link.textContent).join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
  })

  it("las letras con sección son links a su id; las vacías, links apagados sin href y fuera del orden de Tab", async () => {
    render(<ListIndex available={CON_SECCION} />)
    const a = screen.getByRole("link", { name: "A" })
    expect(a).toHaveAttribute("href", "#A")
    expect(a).not.toHaveAttribute("aria-disabled")
    expect(a).toHaveClass("text-brand-ink", "focus-visible:focus-ring")
    const b = screen.getByRole("link", { name: "B" })
    expect(b).toHaveAttribute("aria-disabled", "true")
    expect(b).not.toHaveAttribute("href")
    expect(b).toHaveClass("text-label-tertiary")
    await userEvent.tab()
    expect(a).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole("link", { name: "C" })).toHaveFocus()
  })

  it("letters y getHref cambian la tira y los destinos", () => {
    render(<ListIndex available={["#", "Ñ"]} getHref={(letter) => `#clientes-${encodeURIComponent(letter)}`} letters={["#", "N", "Ñ"]} />)
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["#", "N", "Ñ"])
    expect(screen.getByRole("link", { name: "Ñ" })).toHaveAttribute("href", "#clientes-%C3%91")
  })

  it("con el dedo se desliza: cada letra bajo el dedo lleva a su sección, sin tocar el historial", () => {
    render(<Clientes />)
    const nav = screen.getByRole("navigation")
    const bajoElDedo = vi.fn<(x: number, y: number) => Element | null>()
    document.elementFromPoint = bajoElDedo
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    const push = vi.spyOn(history, "pushState")

    bajoElDedo.mockReturnValue(screen.getByRole("link", { name: "A" }))
    fireEvent.pointerDown(nav, { pointerType: "touch", pointerId: 1, clientX: 5, clientY: 10 })
    expect(nav).toHaveAttribute("data-scrubbing", "true")
    expect(screen.getByRole("link", { name: "A" })).toHaveAttribute("data-active", "true")
    // Una apagada no mueve nada.
    bajoElDedo.mockReturnValue(screen.getByRole("link", { name: "B" }))
    fireEvent.pointerMove(nav, { pointerType: "touch", pointerId: 1, clientX: 5, clientY: 26 })
    bajoElDedo.mockReturnValue(screen.getByRole("link", { name: "M" }))
    fireEvent.pointerMove(nav, { pointerType: "touch", pointerId: 1, clientX: 5, clientY: 200 })
    expect(scroll.mock.contexts.map((section) => (section as HTMLElement).id)).toEqual(["A", "M"])
    expect(push).not.toHaveBeenCalled()
    fireEvent.pointerUp(nav, { pointerType: "touch", pointerId: 1 })
    expect(nav).not.toHaveAttribute("data-scrubbing")
  })

  it("si la lista scrollea en su caja, el link mueve solo esa caja (la página no salta)", () => {
    render(
      <>
        <div data-testid="caja" style={{ overflowY: "auto" }}>
          {CON_SECCION.map((letter) => (
            <section key={letter} id={letter} style={{ scrollMarginTop: "8px" }}>
              <h3>{letter}</h3>
            </section>
          ))}
        </div>
        <ListIndex available={CON_SECCION} />
      </>
    )
    const caja = screen.getByTestId("caja")
    caja.scrollTop = 100
    const scrollTo = vi.fn()
    caja.scrollTo = scrollTo as typeof caja.scrollTo
    const scroll = vi.fn()
    Element.prototype.scrollIntoView = scroll
    vi.spyOn(caja, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect({ y: 50, height: 400 }))
    vi.spyOn(document.getElementById("M")!, "getBoundingClientRect").mockReturnValue(DOMRect.fromRect({ y: 650, height: 80 }))
    // `false`: el ancla nativa no corre (movía todos los scrolls, también el de la página).
    expect(fireEvent.click(screen.getByRole("link", { name: "M" }))).toBe(false)
    expect(scrollTo).toHaveBeenCalledWith({ top: 100 + 650 - 50 - 8 })
    expect(scroll).not.toHaveBeenCalled()
  })

  it("si la sección está en la página (sin caja que scrollee), el link es el ancla de siempre", () => {
    render(<Clientes />)
    expect(fireEvent.click(screen.getByRole("link", { name: "M" }))).toBe(true)
  })

  it("con el mouse no desliza: el click es el del link", () => {
    render(<Clientes />)
    const bajoElDedo = vi.fn(() => screen.getByRole("link", { name: "C" }))
    document.elementFromPoint = bajoElDedo
    fireEvent.pointerDown(screen.getByRole("navigation"), { pointerType: "mouse", clientX: 5, clientY: 30 })
    expect(bajoElDedo).not.toHaveBeenCalled()
    expect(screen.getByRole("navigation")).not.toHaveAttribute("data-scrubbing")
  })

  it("el nombre sale de labels: provider y prop, sin estar en defaultLabels", () => {
    expect(listIndexLabels).toEqual({ label: "Índice alfabético" })
    const { rerender } = render(
      <LabelsProvider value={{ listIndex: { label: "Index" } }}>
        <ListIndex available={[]} />
      </LabelsProvider>
    )
    expect(screen.getByRole("navigation", { name: "Index" })).toBeInTheDocument()
    rerender(
      <LabelsProvider value={{ listIndex: { label: "Index" } }}>
        <ListIndex available={[]} labels={{ label: "Clientes de la A a la Z" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("navigation", { name: "Clientes de la A a la Z" })).toBeInTheDocument()
  })

  it("objetivo de 24 de ancho y tira que se reparte el alto; el dedo no scrollea la página al deslizar", () => {
    render(<ListIndex available={CON_SECCION} />)
    const nav = screen.getByRole("navigation")
    expect(nav).toHaveClass("w-6", "pointer-coarse:touch-none")
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("min-h-4", "flex-1")
  })

  it("hidrata sin mismatch", async () => {
    const ui = <ListIndex available={CON_SECCION} />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })
})
