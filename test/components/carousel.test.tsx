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
const dots = () => screen.getAllByRole("button", { name: /Ir a la página/ })

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
    expect(await screen.findAllByRole("button", { name: /Ir a la página/ })).toHaveLength(5)
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
    await screen.findAllByRole("button", { name: /Ir a la página/ })
    dots()[0]!.focus()
    await user.keyboard("{ArrowRight}{ArrowRight}")
    expect(api!.selectedScrollSnap()).toBe(2)
    await user.keyboard("{ArrowLeft}")
    expect(api!.selectedScrollSnap()).toBe(1)
  })

  it("las flechas dentro de un control que las usa (slider, radiogroup, listbox, combobox, campo) no mueven el carrusel", async () => {
    const user = userEvent.setup()
    let api: CarouselApi
    const onSliderKey = vi.fn()
    render(
      <Carousel aria-label="Planes" setApi={(value) => (api = value)}>
        <CarouselContent>
          <CarouselItem>
            <div aria-label="Cantidad" aria-valuenow={1} onKeyDown={onSliderKey} role="slider" tabIndex={0} />
            <div aria-label="Plan" role="radiogroup">
              <button role="radio" aria-checked="true" type="button">Mensual</button>
            </div>
            <input aria-label="Nota" />
          </CarouselItem>
          <CarouselItem>Dos</CarouselItem>
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    )
    await screen.findAllByRole("button", { name: /Ir a la página/ })
    screen.getByRole("slider").focus()
    await user.keyboard("{ArrowRight}")
    expect(onSliderKey).toHaveBeenCalled()
    screen.getByRole("radio").focus()
    await user.keyboard("{ArrowRight}")
    screen.getByRole("textbox").focus()
    await user.keyboard("{ArrowRight}")
    expect(api!.selectedScrollSnap()).toBe(0)
  })

  it("si un control de adentro ya usó la flecha (preventDefault), el carrusel no se mueve", async () => {
    const user = userEvent.setup()
    let api: CarouselApi
    render(
      <Carousel aria-label="Planes" setApi={(value) => (api = value)}>
        <CarouselContent>
          <CarouselItem>
            <button onKeyDown={(event) => event.preventDefault()} type="button">
              Propio
            </button>
          </CarouselItem>
          <CarouselItem>Dos</CarouselItem>
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    )
    await screen.findAllByRole("button", { name: /Ir a la página/ })
    screen.getByRole("button", { name: "Propio" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(api!.selectedScrollSnap()).toBe(0)
  })

  it("sin aria-label la región se llama «Carrusel»; aria-label y aria-labelledby le ganan", () => {
    const { rerender } = render(<Plans aria-label={undefined} />)
    expect(screen.getByRole("region", { name: "Carrusel" })).toBeInTheDocument()
    rerender(
      <>
        <h2 id="titulo-planes">Nuestros planes</h2>
        <Plans aria-label={undefined} aria-labelledby="titulo-planes" />
      </>
    )
    expect(screen.getByRole("region", { name: "Nuestros planes" })).toBeInTheDocument()
  })

  it("los puntos son páginas: «Ir a la página 2 de 3» cuenta paradas, no diapositivas", async () => {
    render(<Plans opts={{ slidesToScroll: 2 }} />)
    const pages = await screen.findAllByRole("button", { name: /Ir a la página/ })
    expect(pages).toHaveLength(3)
    expect(pages[1]).toHaveAccessibleName("Ir a la página 2 de 3")
  })

  it("con movimiento reducido salta en vez de deslizar", async () => {
    const user = userEvent.setup()
    vi.stubGlobal("matchMedia", media(true))
    let api: CarouselApi
    render(<Plans setApi={(value) => (api = value)} />)
    await screen.findAllByRole("button", { name: /Ir a la página/ })
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

describe("Carousel bleed", () => {
  it("la vista sin aire ni máscara y las diapositivas sin separación, para fotos de borde a borde", () => {
    render(<Plans bleed />)
    const viewport = document.querySelector("[data-slot=carousel-content]")!
    expect(viewport.className).toBe("overflow-hidden")
    expect(viewport.firstElementChild).toHaveClass("flex")
    expect(viewport.firstElementChild).not.toHaveClass("-ms-4")
    for (const item of document.querySelectorAll("[data-slot=carousel-item]")) expect(item).not.toHaveClass("ps-4")
    expect(document.querySelector("[data-slot=carousel]")).toHaveAttribute("data-bleed", "")
  })

  it("sin bleed, la vista de 2.0: aire para la sombra y la máscara de los costados", () => {
    render(<Plans />)
    const viewport = document.querySelector("[data-slot=carousel-content]")!
    expect(viewport).toHaveClass("-mx-4", "px-4", "pt-6", "pb-16")
    expect(document.querySelector("[data-slot=carousel-item]")).toHaveClass("ps-4")
  })
})

describe("Carousel controls=overlay", () => {
  it("flechas opacas oscuras con blur, a la vista con el puntero encima o con foco", () => {
    render(<Plans bleed controls="overlay" />)
    const previous = screen.getByRole("button", { name: "Diapositiva anterior" })
    expect(previous).toHaveClass("bg-tooltip", "ring-1", "ring-white/50", "text-on-tooltip")
    expect(previous).not.toHaveClass("material-translucent")
    expect(previous).toHaveClass("opacity-0", "pointer-fine:group-hover/carousel:opacity-100", "focus-visible:opacity-100")
    // Con el dedo no tapan la foto ni se tocan sin querer, pero con un teclado (un iPad) aparecen al enfocarlas.
    expect(previous).not.toHaveClass("pointer-coarse:hidden")
    expect(previous).toHaveClass("pointer-coarse:pointer-events-none")
    expect(document.querySelector("[data-slot=carousel]")).toHaveClass("group/carousel")
    expect(document.querySelector("[data-slot=carousel]")).toHaveAttribute("data-controls", "overlay")
  })

  it("los puntos encima de la foto, abajo al centro, en una pastilla oscura", () => {
    render(<Plans bleed controls="overlay" />)
    const dots = document.querySelector("[data-slot=carousel-dots]")!
    // Opaca con filo blanco: contraste de 3:1 sobre una foto blanca (el gris) y sobre una negra (el filo).
    expect(dots).toHaveClass("absolute", "bottom-2", "left-1/2", "-translate-x-1/2", "bg-tooltip", "ring-1", "ring-white/50")
    expect(dots).not.toHaveClass("-mt-9")
    const dot = document.querySelector("[data-slot=carousel-dot]")!
    expect(dot).toHaveClass("before:bg-white/60", "aria-current:before:bg-white")
    // El foco, blanco y adentro del punto: queda sobre la pastilla, no sobre la foto.
    expect(dot).toHaveClass("focus-visible:outline-white", "focus-visible:-outline-offset-2")
  })

  it("sin controls, las flechas y los puntos de 2.0", () => {
    render(<Plans />)
    expect(screen.getByRole("button", { name: "Diapositiva anterior" })).toHaveClass("material-translucent")
    expect(document.querySelector("[data-slot=carousel-dots]")).toHaveClass("-mt-9")
  })
})
