"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { useLabels, type Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * El índice A–Z de Contactos (iOS y la lista de iCloud): una tira de letras al costado de una lista
 * agrupada, cada una un link a su sección, las que no tienen sección apagadas. Es un `nav` con links,
 * así el lector la ofrece en su lista de regiones y cada letra se sigue con Enter.
 *
 * Con el dedo (`pointer: coarse`) se desliza: apoyar y arrastrar recorre las letras y lleva la lista a
 * cada sección al pasar, sin sumar una entrada al historial por letra.
 */
type ListIndexProps = Omit<React.ComponentProps<"nav">, "children"> & {
  /** Las letras que tienen sección: las demás se ven apagadas y no son links. */
  available: readonly string[]
  /** Todas las letras de la tira, en orden. Por defecto, A–Z. */
  letters?: readonly string[]
  /**
   * El destino de cada letra. Por defecto `#${letter}`: la sección lleva `id="A"`. Deslizar con el
   * dedo, mover solo la caja que scrollea y pasarle el foco a la sección con Enter necesitan un
   * `#…` que apunte a un id de la página; con otro destino, la letra es un link común.
   */
  getHref?: (letter: string) => string
  labels?: Partial<NonNullable<Labels["listIndex"]>>
}

/** El texto por defecto; no está en `defaultLabels` porque el barrel está en su tope (ver `Labels`). */
const listIndexLabels: NonNullable<Labels["listIndex"]> = { label: "Índice alfabético" }

const ALPHABET = Object.freeze([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"])
const defaultHref = (letter: string) => `#${letter}`

const sectionOf = (href: string | null) => (href?.startsWith("#") ? document.getElementById(decodeURIComponent(href.slice(1))) : null)

/** La caja que scrollea a la sección (la lista con `overflow-y` `auto`, `scroll` u `overlay`), si no es la página. */
function scrollBox(section: HTMLElement) {
  for (let box = section.parentElement; box && box !== document.body && box !== document.documentElement; box = box.parentElement) {
    if (/^(auto|scroll|overlay)$/.test(getComputedStyle(box).overflowY)) return box
  }
  return null
}

/**
 * Lleva la sección arriba de su caja moviendo **solo esa caja**: el ancla nativa y `scrollIntoView`
 * mueven todos los scrolls hasta ella, también el de la página. Respeta `scroll-margin-top` y el
 * `scroll-behavior` de la caja. Sin caja propia, `false`: la sección está en la página.
 */
function reveal(section: HTMLElement) {
  const box = scrollBox(section)
  if (!box) return false
  const margin = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0
  box.scrollTo({ top: box.scrollTop + section.getBoundingClientRect().top - box.getBoundingClientRect().top - margin })
  return true
}

function ListIndex({
  className,
  available,
  letters = ALPHABET,
  getHref = defaultHref,
  labels: labelsProp,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: ListIndexProps) {
  const labels = { ...listIndexLabels, ...useLabels().listIndex, ...defined(labelsProp) }
  const enabled = new Set(available)
  const [scrubbing, setScrubbing] = React.useState<string | null>(null)

  // Lleva la lista a la sección de la letra que está bajo el dedo. Con `scrollIntoView` y no con el
  // link: seguir un link por letra llenaba el historial.
  const scrubTo = (x: number, y: number) => {
    const link = document.elementFromPoint(x, y)?.closest<HTMLAnchorElement>("a[data-slot=list-index-letter][href]")
    const letter = link?.dataset.letter
    if (!link || !letter || letter === scrubbing) return
    setScrubbing(letter)
    const section = sectionOf(link.getAttribute("href"))
    if (section && !reveal(section)) section.scrollIntoView({ block: "start" })
  }

  // El click (o Enter) en una letra: si la lista scrollea en su propia caja, se mueve solo esa caja
  // en vez de seguir el ancla, que hacía saltar la página. Con Enter (`detail` 0: no hubo puntero)
  // el foco pasa a la sección, así Tab sigue desde ahí y el lector lee lo que se ve; el ancla sola
  // no lo mueve, y con `preventDefault` tampoco el punto de partida de Tab.
  const onLetterClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const section = sectionOf(event.currentTarget.getAttribute("href"))
    if (!section) return
    if (reveal(section)) event.preventDefault()
    if (event.detail !== 0) return
    if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1")
    section.focus({ preventScroll: true })
  }

  return (
    <nav
      data-slot="list-index"
      aria-label={labels.label}
      data-scrubbing={scrubbing != null || undefined}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (event.defaultPrevented || event.pointerType !== "touch") return
        event.currentTarget.setPointerCapture?.(event.pointerId)
        scrubTo(event.clientX, event.clientY)
      }}
      // Los de la app se suman a los nuestros (antes, por venir en `...props` después, los
      // reemplazaban y el deslizamiento nunca terminaba).
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (scrubbing == null || event.defaultPrevented) return
        scrubTo(event.clientX, event.clientY)
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        setScrubbing(null)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        setScrubbing(null)
      }}
      className={cn("flex w-6 flex-col select-none pointer-coarse:touch-none", className)}
      {...props}
    >
      <ol className="flex flex-1 flex-col justify-center">
        {letters.map((letter) => (
          <li key={letter} className="flex min-h-4 flex-1">
            {enabled.has(letter) ? (
              <a
                data-slot="list-index-letter"
                data-letter={letter}
                data-active={scrubbing === letter || undefined}
                href={getHref(letter)}
                onClick={onLetterClick}
                className="flex w-full items-center justify-center rounded-tag text-caption font-semibold text-brand-ink outline-none hover:bg-fill-1 focus-visible:focus-ring data-active:bg-fill-2"
              >
                {letter}
              </a>
            ) : (
              // Sin sección: una letra apagada que no se puede seguir. `role="link"` +
              // `aria-disabled`, para que el lector la diga «atenuada» en vez de saltearla.
              <a
                data-slot="list-index-letter"
                role="link"
                aria-disabled="true"
                className="flex w-full items-center justify-center text-caption font-semibold text-label-tertiary"
              >
                {letter}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export { ListIndex, listIndexLabels, type ListIndexProps }
