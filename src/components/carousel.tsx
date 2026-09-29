"use client"

import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"

type CarouselLabels = NonNullable<Labels["carousel"]>

/**
 * Los textos por defecto. No están en `defaultLabels` porque el barrel no tenía lugar (ver el tipo
 * `Labels`).
 */
const carouselLabels: CarouselLabels = {
  label: "Carrusel",
  carousel: "carrusel",
  slide: "diapositiva",
  previous: "Diapositiva anterior",
  next: "Diapositiva siguiente",
  of: "de",
  goTo: "Ir a la página",
}

type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = Parameters<typeof useEmblaCarousel>[0]
type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1]

type CarouselProps = React.ComponentProps<"div"> & {
  /** Las opciones de Embla (`loop`, `align`, `slidesToScroll`…). */
  opts?: CarouselOptions
  /** Los plugins de Embla (autoplay, ruedita…). */
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  /** Recibe la API de Embla, para manejarlo desde afuera. */
  setApi?: (api: CarouselApi) => void
  /**
   * A sangre: la vista sin el aire para la sombra ni la máscara de los costados, y las diapositivas sin
   * separación. Para fotos de borde a borde, como la de una card de producto.
   */
  bleed?: boolean
  /**
   * `overlay`: las flechas y los puntos van encima de la foto, sobre el gris oscuro del tooltip con
   * desenfoque (contraste garantizado sobre cualquier imagen); las flechas aparecen con el puntero
   * encima o con foco, y con el dedo se desliza. Por defecto (`outside`), los de 2.0.
   */
  controls?: "outside" | "overlay"
  labels?: Partial<CarouselLabels>
}

type CarouselContextValue = {
  carouselRef: UseEmblaCarouselType[0]
  api: CarouselApi
  orientation: "horizontal" | "vertical"
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  selected: number
  snaps: number
  labels: CarouselLabels
  bleed: boolean
  overlay: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

/** El carrusel de afuera. Tira si se usa una parte suelta: sin carrusel no hay a dónde scrollear. */
function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("useCarousel: va adentro de <Carousel>")
  return context
}

/** Lo que ya usa ←/→ por su cuenta: ahí las flechas no son del carrusel. */
const ARROW_OWNERS =
  "input, textarea, select, [contenteditable]:not([contenteditable=false]), [role=slider], [role=radiogroup], [role=listbox], [role=combobox], [role=tablist], [role=menu], [role=menubar], [role=grid], [role=tree], [role=spinbutton]"

/** Con movimiento reducido, Embla salta en vez de deslizar (`jump`). Se lee al click: no hay SSR. */
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true

/**
 * Un carrusel sobre Embla, con la API de shadcn: `CarouselContent` con sus `CarouselItem`, las
 * flechas (`CarouselPrevious`, `CarouselNext`: botón de ícono de 28 y radio 8 sobre el material
 * translúcido) y los puntos (`CarouselDots`).
 *
 * Es una región con `aria-roledescription` «carrusel» (y nombre `labels.label` si no trae
 * `aria-label` ni `aria-labelledby`) y cada diapositiva un grupo «2 de 5». ←/→ (↑/↓ vertical) pasan
 * de a una parada, salvo dentro de un control que ya usa las flechas. Usa `embla-carousel-react`,
 * peer opcional: lo instala la app.
 */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  labels: labelsProp,
  bleed = false,
  controls = "outside",
  className,
  children,
  onKeyDown,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: CarouselProps) {
  const labels = { ...carouselLabels, ...useLabels().carousel, ...defined(labelsProp) }
  const overlay = controls === "overlay"
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins)
  const [state, setState] = React.useState({ canScrollPrev: false, canScrollNext: false, selected: 0, snaps: 0 })

  React.useEffect(() => {
    if (!api) return
    setApi?.(api)
    const sync = () =>
      setState({ canScrollPrev: api.canScrollPrev(), canScrollNext: api.canScrollNext(), selected: api.selectedScrollSnap(), snaps: api.scrollSnapList().length })
    sync()
    api.on("reInit", sync).on("select", sync)
    return () => {
      api.off("reInit", sync).off("select", sync)
    }
  }, [api, setApi])

  const scrollPrev = React.useCallback(() => api?.scrollPrev(reducedMotion()), [api])
  const scrollNext = React.useCallback(() => api?.scrollNext(reducedMotion()), [api])
  const scrollTo = React.useCallback((index: number) => api?.scrollTo(index, reducedMotion()), [api])

  // En burbujeo y no en captura: el control enfocado adentro recibe la flecha primero y, si la usó
  // (`preventDefault`) o es de los que viven de las flechas (slider, radios, listas, campos), el
  // carrusel no se mueve.
  const keyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    const target = event.target as HTMLElement
    if (event.defaultPrevented || target.closest(ARROW_OWNERS)) return
    const back = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
    const forward = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"
    if (event.key === back) {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === forward) {
      event.preventDefault()
      scrollNext()
    }
  }

  return (
    <CarouselContext.Provider value={{ carouselRef, api, orientation, scrollPrev, scrollNext, scrollTo, labels, bleed, overlay, ...state }}>
      <div
        aria-roledescription={labels.carousel}
        data-bleed={bleed ? "" : undefined}
        data-controls={overlay ? "overlay" : undefined}
        data-orientation={orientation}
        data-slot="carousel"
        role="region"
        aria-label={ariaLabel ?? (ariaLabelledby ? undefined : labels.label)}
        aria-labelledby={ariaLabelledby}
        onKeyDown={keyDown}
        className={cn("relative", overlay && "group/carousel", className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

/** La posición de cada diapositiva, contada al renderizar (así «2 de 5» ya viene del servidor). */
const SlideContext = React.createContext<{ index: number; count: number } | null>(null)

function CarouselContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation, bleed } = useCarousel()
  const slides = React.Children.toArray(children).filter(React.isValidElement)
  return (
    // La vista recorta (si no, se verían las otras diapositivas), pero con aire para la sombra de las
    // cards. Al costado, un margen negativo de 16 (el espacio entre diapositivas, así la vecina no
    // asoma) que la máscara funde a transparente: sin corte duro. Arriba y abajo el aire es lugar
    // reservado, sin margen negativo: la máscara arma un contexto de apilamiento y una vista que se
    // metiera debajo del carrusel se quedaría con los clicks de lo que haya ahí. Embla mide el
    // contenedor de adentro, no la vista: el padding no le cambia las paradas.
    // A sangre (`bleed`) no hay sombra que cuidar ni vecina que tapar: la vista recorta justo en su borde.
    <div
      ref={carouselRef}
      data-slot="carousel-content"
      className={bleed ? "overflow-hidden" : "-mx-4 overflow-hidden px-4 pt-4 pb-10 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-16px),transparent)]"}
    >
      <div className={cn("flex", !bleed && (orientation === "horizontal" ? "-ms-4" : "-mt-4"), orientation === "vertical" && "flex-col", className)} {...props}>
        {slides.map((slide, index) => (
          <SlideContext.Provider key={slide.key ?? index} value={{ index, count: slides.length }}>
            {slide}
          </SlideContext.Provider>
        ))}
      </div>
    </div>
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation, labels, bleed } = useCarousel()
  const slide = React.useContext(SlideContext)
  return (
    <div
      aria-label={slide ? `${slide.index + 1} ${labels.of} ${slide.count}` : undefined}
      aria-roledescription={labels.slide}
      data-slot="carousel-item"
      role="group"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", !bleed && (orientation === "horizontal" ? "ps-4" : "pt-4"), className)}
      {...props}
    />
  )
}

type CarouselArrowProps = Omit<React.ComponentProps<typeof Button>, "size" | "children" | "loading"> & { "aria-label"?: string }

// Las flechas: el botón de ícono de 28 (radio 8) sobre el material translúcido, adentro del carrusel
// y centradas en el eje. Deshabilitadas en la punta, salvo con `loop`.
const arrowClassName =
  "absolute z-10 material-translucent text-label shadow-menu hover:bg-fill-2 disabled:opacity-0 data-disabled:opacity-0 motion-safe:transition-opacity"

// Encima de una foto el material translúcido no garantiza el contraste del ícono: el gris oscuro del
// tooltip, casi opaco. Con puntero fino aparecen al pasar por el carrusel o con foco; con el dedo no
// están (se desliza, y los puntos siguen). En la punta, `invisible` y no `opacity-0`: el hover del
// grupo le ganaría.
const overlayArrowClassName =
  "absolute z-10 bg-tooltip/90 text-on-tooltip backdrop-blur-md shadow-menu hover:bg-tooltip disabled:invisible data-disabled:invisible pointer-coarse:hidden pointer-fine:opacity-0 pointer-fine:group-hover/carousel:opacity-100 focus-visible:opacity-100 motion-safe:transition-opacity"

function CarouselPrevious({ className, variant = "ghost", ...props }: CarouselArrowProps) {
  const { orientation, scrollPrev, canScrollPrev, labels, overlay } = useCarousel()
  return (
    <Button
      aria-label={labels.previous}
      data-slot="carousel-previous"
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      size="icon-sm"
      type="button"
      variant={variant}
      className={cn(overlay ? overlayArrowClassName : arrowClassName, orientation === "horizontal" ? "start-2 top-1/2 -translate-y-1/2" : "top-2 left-1/2 -translate-x-1/2 rotate-90", className)}
      {...props}
    >
      <ChevronLeftIcon />
    </Button>
  )
}

function CarouselNext({ className, variant = "ghost", ...props }: CarouselArrowProps) {
  const { orientation, scrollNext, canScrollNext, labels, overlay } = useCarousel()
  return (
    <Button
      aria-label={labels.next}
      data-slot="carousel-next"
      disabled={!canScrollNext}
      onClick={scrollNext}
      size="icon-sm"
      type="button"
      variant={variant}
      className={cn(overlay ? overlayArrowClassName : arrowClassName, orientation === "horizontal" ? "end-2 top-1/2 -translate-y-1/2" : "bottom-2 left-1/2 -translate-x-1/2 rotate-90", className)}
      {...props}
    >
      <ChevronRightIcon />
    </Button>
  )
}

/**
 * Un punto por cada parada (página); el actual lleva `aria-current`. Con `slidesToScroll` > 1 una
 * parada tiene varias diapositivas, por eso el nombre es «Ir a la página 2 de 3» y no habla de
 * diapositivas. Con una sola parada no se dibuja.
 */
function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { snaps, selected, scrollTo, labels, overlay } = useCarousel()
  if (snaps < 2) return null
  return (
    // `relative` y hacia arriba: los puntos suben al aire de la sombra y quedan encima de la vista. Con
    // `overlay`, encima de la foto, abajo al centro, en una pastilla del gris del tooltip.
    <div
      data-slot="carousel-dots"
      className={cn(
        overlay
          ? "absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center rounded-control bg-tooltip/90 px-0.5 backdrop-blur-md"
          : "relative -mt-9 flex items-center justify-center pt-2",
        className
      )}
      {...props}
    >
      {Array.from({ length: snaps }, (_, index) => (
        <button
          aria-current={index === selected ? "true" : undefined}
          aria-label={`${labels.goTo} ${index + 1} ${labels.of} ${snaps}`}
          data-slot="carousel-dot"
          key={index}
          onClick={() => scrollTo(index)}
          type="button"
          // El botón mide 24 (el área táctil mínima, WCAG 2.5.8) y el punto de adentro 8.
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-full outline-none before:size-2 before:rounded-full before:bg-label-tertiary before:transition-control hover:before:bg-label-secondary focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-(color:--sf-focus) aria-current:before:bg-label",
            overlay && "before:size-1.5 before:bg-white/50 hover:before:bg-white/80 aria-current:before:bg-white"
          )}
        />
      ))}
    </div>
  )
}

export { Carousel, CarouselContent, CarouselDots, CarouselItem, carouselLabels, CarouselNext, CarouselPrevious, useCarousel, type CarouselApi, type CarouselArrowProps, type CarouselLabels, type CarouselProps }
