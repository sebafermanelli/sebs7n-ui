"use client"

import { useEffect, useState } from "react"

import { cn } from "sebs7n-ui/lib/utils"

export interface TocItem {
  id: string
  text: string
}

// La línea de lectura: un poco debajo de la barra (44) y del `scroll-mt` de los títulos (96).
const READING_LINE = 120

// El índice flotante: queda a la vista al costado y marca la sección que se está leyendo. El
// seguimiento es una mejora: sin JavaScript sigue siendo una lista de anclas que funciona.
// La sección activa es la última cuyo título ya pasó la línea de lectura; al llegar al final de la
// página, la última (una sección corta nunca llegaría a la línea, y quedaría sin marcar).
export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "")

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      let current = items[0]?.id ?? ""
      for (const item of items) {
        const heading = document.getElementById(item.id)
        if (heading && heading.getBoundingClientRect().top <= READING_LINE) current = item.id
      }
      if (atEnd && items.length > 0) current = items[items.length - 1]!.id
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [items])

  return (
    <nav aria-label="En esta página" className="sticky top-24 hidden self-start lg:block">
      <p className="mb-2 text-footnote font-semibold tracking-wide text-label-secondary uppercase">En esta página</p>
      <ol className="flex flex-col border-s border-separator-strong">
        {items.map((item) => (
          <li key={item.id}>
            <a
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ms-px block border-s-2 border-transparent py-1.5 ps-3 text-callout text-label-secondary outline-none transition-control hover:text-label focus-visible:focus-ring",
                active === item.id && "border-brand-900 font-medium text-label"
              )}
              href={`#${item.id}`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
