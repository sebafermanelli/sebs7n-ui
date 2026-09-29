import type * as React from "react"
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react"

import { renderElement, type RenderElement } from "../lib/render.js"
import { cn } from "../lib/utils.js"
import { linkVariants } from "../variants/link.js"

type TextLinkProps = Omit<React.ComponentProps<"a">, "className"> & {
  className?: string
  /** El aspecto: `accent` (el default) es el link de iCloud; los otros son los de `linkVariants`. */
  variant?: "accent" | "inline" | "subtle" | "row"
  /**
   * El adorno del final: `chevron` (›) para ir a otra pantalla de la app, `external` (↗) para salir
   * del sitio. `external` abre en otra pestaña (`target="_blank"`, `rel="noopener noreferrer"`,
   * salvo que la app ponga los suyos) y lo avisa al lector de pantalla.
   */
  trailing?: "chevron" | "external"
  /** El aviso del ↗ para el lector de pantalla. Por defecto «(se abre en otra pestaña)». */
  externalLabel?: string
  /** El elemento que se renderiza en lugar del `<a>`: `render={<Link href="/planes" />}`. */
  render?: RenderElement
}

/**
 * Un link suelto con el adorno de iCloud: «Find Devices ›», «account.apple.com ↗».
 *
 * Sin `"use client"`: no tiene estado, así que vive en un Server Component y emite un `<a>` real en
 * el HTML. Por eso el aviso de ↗ es una prop y no sale de `LabelsProvider` (que es un contexto de
 * cliente).
 *
 * El adorno va como en iCloud: un espacio duro y el glifo adentro de un span que no corta, así la
 * flecha nunca queda sola en el renglón de abajo. El glifo es decorativo (`aria-hidden`): lo que
 * dice «se abre en otra pestaña» es el texto `sr-only`, que forma parte del nombre del link.
 *
 * No se llama `Link` para no chocar con el de `next/link`, que es justo el que va en `render`.
 */
function TextLink({
  className,
  variant = "accent",
  trailing,
  externalLabel = "(se abre en otra pestaña)",
  render,
  children,
  ...props
}: TextLinkProps) {
  const external = trailing === "external"
  const Icono = external ? ArrowUpRightIcon : ChevronRightIcon
  // El aviso solo si de verdad abre otra pestaña: con `target="_self"` el ↗ sigue diciendo «sale
  // del sitio», pero «se abre en otra pestaña» sería mentira.
  const pestanaNueva = external && (props.target ?? "_blank") === "_blank"
  return renderElement(render, "a", {
    "data-slot": "text-link",
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
    ...props,
    className: cn(linkVariants({ variant }), className),
    children: (
      <>
        {children}
        {trailing && (
          <span data-slot="text-link-trailing" className="whitespace-nowrap">
            {" "}
            <Icono aria-hidden="true" className={cn("inline size-3 align-baseline", external ? "stroke-[2.5]" : "stroke-3")} />
            {pestanaNueva && <span className="sr-only"> {externalLabel}</span>}
          </span>
        )}
      </>
    ),
  })
}

export { TextLink, type TextLinkProps }
