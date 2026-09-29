import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "../../src/components/carousel"
import { LabelsProvider } from "../../src/lib/labels"
import { hidratar } from "../hidratar"

const PLANS = ["Básico", "Estándar", "Pro", "Empresa", "A medida"]

function Plans(props: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel aria-label="Planes" {...props}>
      <CarouselContent>
        {PLANS.map((plan) => (
          <CarouselItem key={plan}>
            <p>{plan}</p>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  )
}

// jsdom no mide ni observa: Embla pide ResizeObserver, IntersectionObserver y matchMedia (aunque no
// haya breakpoints). Cada diapositiva mide 300 px, una al lado de la otra, en una vista de 300.
const media = (reduce: boolean) => (query: string) => ({ matches: reduce && query.includes("reduce"), media: query, addEventListener() {}, removeEventListener() {} })

beforeEach(() => {
  vi.stubGlobal("matchMedia", media(false))
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  )
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    }
  )
  const slide = (node: HTMLElement) => (node.dataset.slot === "carousel-item" ? node : null)
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(300)
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(200)
  vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
    const item = slide(this)
    return item ? [...item.parentElement!.children].indexOf(item) * 300 : 0
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const slides = () => screen.getAllByRole("group")
const dots = () => screen.getAllByRole("button", { name: /Ir a la diapositiva/ })

describe("Carousel", () => {
  it("región «carrusel» y cada diapositiva un grupo «2 de 5»", () => {
    render(<Plans />)
    const region = screen.getByRole("region", { name: "Planes" })
    expect(region).toHaveAttribute("aria-roledescription", "carrusel")
    expect(slides()).toHaveLength(5)
    expect(slides()[1]).toHaveAttribute("aria-roledescription", "diapositiva")
    expect(slides()[1]).toHaveAccessibleName("2 de 5")
  })

  it("las flechas: botón de ícono de 28 y radio 8 sobre el material translúcido; al principio no hay anterior", async () => {
    render(<Plans />)
    const next = await screen.findByRole("button", { name: "Diapositiva siguiente" })
    expect(next).toHaveClass("size-7", "rounded-control", "material-translucent")
    expect(next).not.toBeDisabled()
    expect(screen.getByRole("button", { name: "Diapositiva anterior" })).toBeDisabled()
  })

  it("siguiente, anterior y los puntos mueven la parada; el punto actual lleva aria-current", async () => {
    const user = userEvent.setup()
    let api: CarouselApi
    render(<Plans setApi={(value) => (api = value)} />)
    expect(await screen.findAllByRole("button", { name: /Ir a la diapositiva/ })).toHaveLength(5)
    expect(dots()[0]).toHaveAttribute("aria-current", "true")
    await user.click(screen.getByRole("button", { name: "Diapositiva siguiente" }))
    expect(api!.selectedScrollSnap()).toBe(1)
    expect(dots()[1]).toHaveAttribute("aria-current", "true")
    await user.click(dots()[4]!)
    expect(api!.selectedScrollSnap()).toBe(4)
    expect(screen.getByRole("button", { name: "Diapositiva siguiente" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Diapositiva anterior" }))
    expect(api!.selectedScrollSnap()).toBe(3)
  })

  it("← y → pasan de a una desde cualquier cosa enfocada adentro", async () => {
    const user = userEvent.setup()
    let api: CarouselApi
    render(<Plans setApi={(value) => (api = value)} />)
    await screen.findAllByRole("button", { name: /Ir a la diapositiva/ })
    dots()[0]!.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(api!.selectedScrollSnap()).toBe(2)
    await user.keyboard("{ArrowLeft}")
    expect(api!.selectedScrollSnap()).toBe(1)
  })

  it("con movimiento reducido salta en vez de deslizar", async () => {
    const user = userEvent.setup()
    vi.stubGlobal("matchMedia", media(true))
    let api: CarouselApi
    render(<Plans setApi={(value) => (api = value)} />)
    await screen.findAllByRole("button", { name: /Ir a la diapositiva/ })
    const scrollNext = vi.spyOn(api!, "scrollNext")
    await user.click(screen.getByRole("button", { name: "Diapositiva siguiente" }))
    expect(scrollNext).toHaveBeenCalledWith(true)
  })

  it("los textos salen de LabelsProvider y la prop labels le gana", async () => {
    render(
      <LabelsProvider value={{ carousel: { carousel: "carousel", slide: "slide", of: "of", next: "Next slide" } }}>
        <Plans labels={{ next: "Siguiente plan" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("region")).toHaveAttribute("aria-roledescription", "carousel")
    expect(slides()[0]).toHaveAccessibleName("1 of 5")
    expect(await screen.findByRole("button", { name: "Siguiente plan" })).toBeInTheDocument()
  })

  it("hidrata sin mismatch", async () => {
    const ui = <Plans />
    const container = document.createElement("div")
    container.innerHTML = renderToString(ui)
    document.body.append(container)
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await hidratar(container, ui, { onRecoverableError: recoverable })
    await act(async () => {})
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
  })
})
