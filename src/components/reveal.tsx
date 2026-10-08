"use client"

import * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * Entrada al hacer scroll: el bloque sube unos píxeles y se asienta con una curva exponencial
 * (`cubic-bezier(0.16, 1, 0.3, 1)`), una sola vez.
 *
 * ```tsx
 * <RevealGroup step={80}>
 *   <Reveal>…</Reveal>
 * </RevealGroup>
 * ```
 *
 * - **Sin JS y en el primer render el contenido ya está a la vista**: el servidor y la primera
 *   pasada del cliente no esconden nada. Recién al montar, lo que está **debajo** de la pantalla se
 *   prepara para entrar; lo que ya se ve se queda quieto (no hay parpadeo).
 * - **`prefers-reduced-motion: reduce`**: nunca se esconde ni se mueve.
 * - **Sin `IntersectionObserver`**: se muestra todo.
 * - **Solo `transform` por defecto.** La guía del sistema no baja la opacidad del texto mientras
 *   aparece (un fade deja el texto por debajo de AA). `fade` suma opacidad: úsalo en piezas sin texto
 *   (una captura, un marco, una imagen).
 */
type RevealProps = React.ComponentProps<"div"> & {
  /** Retraso de la entrada, en ms (para escalonar a mano; `RevealGroup` lo calcula). */
  delay?: number
  /** Cuánto sube, en px. Default `16`. */
  distance?: number
  /** Suma opacidad a la entrada. Solo para piezas sin texto. Default `false`. */
  fade?: boolean
  /** Dispara al entrar en pantalla cuando asoma esta fracción (0–1). Default `0.15`. */
  threshold?: number
  /** Duración, en ms. Default `700`. */
  duration?: number
}

const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect
const REDUCE = "(prefers-reduced-motion: reduce)"

function Reveal({ delay = 0, distance = 16, fade = false, threshold = 0.15, duration = 700, className, style, children, ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  // `undefined` = visible tal cual llegó (servidor, sin JS, ya en pantalla, movimiento reducido).
  const [state, setState] = React.useState<"hidden" | "shown" | undefined>(undefined)

  useIsomorphicLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = typeof window.matchMedia === "function" && window.matchMedia(REDUCE).matches
    if (reduce || typeof IntersectionObserver !== "function") return
    const rect = node.getBoundingClientRect()
    // Ya asoma (o quedó arriba): no se esconde, así el hero no parpadea al hidratar.
    if (rect.top < window.innerHeight * (1 - threshold)) return
    setState("hidden")
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setState("shown")
        observer.disconnect()
      },
      { threshold }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      data-slot="reveal"
      data-reveal={state}
      className={cn(
        "data-[reveal=hidden]:translate-y-(--reveal-distance) data-[reveal=shown]:transition-[translate,opacity] data-[reveal=shown]:ease-out-expo",
        fade && "data-[reveal=hidden]:opacity-0",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        className
      )}
      style={
        {
          "--reveal-distance": `${distance}px`,
          transitionDuration: state === "shown" ? `${duration}ms` : undefined,
          transitionDelay: state === "shown" && delay ? `${delay}ms` : undefined,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

type RevealGroupProps = Omit<React.ComponentProps<"div">, "children"> & {
  children: React.ReactNode
  /** Cuánto se espera entre un hijo y el siguiente, en ms. Default `80`. */
  step?: number
  /** Opciones que reciben todos los `Reveal` del grupo. */
  reveal?: Pick<RevealProps, "distance" | "fade" | "threshold" | "duration" | "className">
}

/** Escalona la entrada de sus hijos: el primero entra ya, el siguiente `step` ms después, etc. */
function RevealGroup({ step = 80, reveal, children, ...props }: RevealGroupProps) {
  return (
    <div data-slot="reveal-group" {...props}>
      {React.Children.toArray(children).map((child, index) => (
        <Reveal delay={index * step} key={React.isValidElement(child) && child.key != null ? child.key : index} {...reveal}>
          {child}
        </Reveal>
      ))}
    </div>
  )
}

export { Reveal, RevealGroup, type RevealGroupProps, type RevealProps }
