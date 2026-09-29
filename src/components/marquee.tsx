"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"

type MarqueeItem = {
  /** La clave del ítem. */
  id: string
  /** Lo que se ve: un logo (SVG, `<img>` con `alt`) o un texto. */
  node: React.ReactNode
  /** Si lleva a algún lado, el ítem es un link que abre en otra pestaña. */
  href?: string
}

type MarqueeProps = Omit<React.ComponentProps<"div">, "children" | "aria-label"> & {
  /** Los ítems de la fila, en orden. */
  items: MarqueeItem[]
  /** El nombre de la lista, que no se ve: «Clientes». */
  "aria-label": string
  /** La velocidad del bucle, en píxeles por segundo. Por defecto, 40: la misma sensación con 4 logos que con 10. */
  speed?: number
}

type Mode = "static" | "loop"

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true

/**
 * Una fila de logos o nombres que se desplaza sola en bucle cuando no entra en el ancho: la de
 * clientes de una home. Si entra, queda quieta y centrada.
 *
 * El bucle duplica la tanda y corre la pista exactamente una tanda (-50 %), así el final empalma con
 * el principio. La copia es decorativa (`aria-hidden` e `inert`): el lector y Tab recorren los ítems
 * una sola vez. Se pausa con el puntero encima, con foco adentro y fuera de pantalla. Con
 * `prefers-reduced-motion` no se mueve: si desborda, se scrollea a mano. Sin JS (y en el HTML del
 * servidor) es la fila quieta, con todos los links.
 */
function Marquee({ items, "aria-label": label, speed = 40, className, ...props }: MarqueeProps) {
  const viewport = React.useRef<HTMLDivElement>(null)
  const set = React.useRef<HTMLUListElement>(null)
  // El servidor no sabe medir: el primer render es siempre la fila quieta, y se mide al montar.
  const [mode, setMode] = React.useState<Mode>("static")
  const [width, setWidth] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  useIsoLayoutEffect(() => {
    const view = viewport.current
    const list = set.current
    if (!view || !list) return
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    const measure = () => {
      const measured = list.scrollWidth
      setWidth(measured)
      setMode(measured > view.clientWidth && !reducedMotion() ? "loop" : "static")
    }
    measure()
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure)
    observer?.observe(view)
    reduce?.addEventListener?.("change", measure)
    return () => {
      observer?.disconnect()
      reduce?.removeEventListener?.("change", measure)
    }
  }, [items])

  // Fuera de pantalla no hay nadie mirando: la animación se pausa y el navegador deja de pintarla.
  React.useEffect(() => {
    const view = viewport.current
    if (!view || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(([entry]) => setPaused(!entry!.isIntersecting), { rootMargin: "120px 0px" })
    observer.observe(view)
    return () => observer.disconnect()
  }, [])

  const loop = mode === "loop"
  const list = (copy: boolean) => (
    <ul
      ref={copy ? undefined : set}
      aria-label={copy ? undefined : label}
      aria-hidden={copy || undefined}
      inert={copy || undefined}
      data-slot="marquee-set"
      // El aire de los costados de cada tanda suma lo mismo que el `gap`: entre la última de una tanda y
      // la primera de la siguiente queda la misma distancia que entre dos ítems.
      className="flex shrink-0 items-center gap-x-12 px-6"
    >
      {items.map((item) => (
        <li key={item.id} className="shrink-0">
          {item.href ? (
            <a
              href={item.href}
              rel="noreferrer"
              target="_blank"
              className="flex h-11 items-center rounded-control text-label-secondary outline-none transition-control hover:text-label focus-visible:focus-ring"
            >
              {item.node}
            </a>
          ) : (
            <span className="flex h-11 items-center text-label-secondary">{item.node}</span>
          )}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      ref={viewport}
      data-slot="marquee"
      data-mode={mode}
      data-paused={paused ? "" : undefined}
      className={cn(
        "flex w-full",
        // Quieta: centrada si entra y con scroll a mano si no (movimiento reducido o sin JS). En bucle, los
        // bordes se funden: los ítems entran y salen, no aparecen cortados.
        loop
          ? "overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_4rem,#000_calc(100%-4rem),transparent)]"
          : "justify-center-safe overflow-x-auto",
        className
      )}
      {...props}
    >
      <div
        data-slot="marquee-track"
        className={cn("flex w-max", loop && "animate-marquee")}
        style={loop ? ({ "--sf-marquee-duration": `${Math.max(1, Math.round(width / speed))}s` } as React.CSSProperties) : undefined}
      >
        {list(false)}
        {loop && list(true)}
      </div>
    </div>
  )
}

export { Marquee, type MarqueeItem, type MarqueeProps }
