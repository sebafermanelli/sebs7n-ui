"use client"

import type * as React from "react"

import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"

/**
 * El `<nav>` de las migas de `PageHeader`.
 *
 * Existe como archivo aparte —y con `"use client"`— por una razón sola: leer el
 * `LabelsProvider` pide un contexto de React, y la directiva contagia al archivo
 * entero. Con el `<nav>` acá, `PageHeader` se queda sin directiva y se sigue
 * pudiendo renderizar desde un Server Component; un Server Component puede
 * renderizar un componente de cliente, que es justo este caso.
 *
 * Vive en `internal/` y no en `components/` porque no es un componente del
 * sistema: nadie lo escribe. Lo pone `PageHeader` cuando le pasan `breadcrumb`,
 * y el `exports` del paquete no tiene patrón que alcance a `./internal/*`.
 */

/**
 * `process.env.NODE_ENV` escrito literal es lo que los bundlers reemplazan por una constante, y por
 * eso en producción el bloque entero se cae del bundle. La declaración local es porque el tsconfig
 * del build no trae los tipos de Node.
 */
declare const process: { env: { NODE_ENV?: string } } | undefined

const esDesarrollo = () => typeof process !== "undefined" && process.env.NODE_ENV !== "production"

let yaAviso = false

/**
 * Aviso de desarrollo: migas que traen su propio `<nav>` adentro del `<nav>` que ya pone
 * `PageHeader`, que es lo que pasa si uno escribe `breadcrumb={<Breadcrumb>…</Breadcrumb>}`.
 *
 * Dos landmarks de navegación anidados le dan al lector de pantalla dos entradas para la misma
 * lista. El tipo de `breadcrumb` es `ReactNode` y no hay forma de exigir por TypeScript que no
 * sea un `<nav>`, así que la verificación es en runtime y solo en desarrollo — el mismo criterio
 * que el aviso de los diálogos sin nombre.
 */
function avisarSiHayNavAnidado(el: HTMLElement | null) {
  if (!el || yaAviso || !esDesarrollo()) return
  if (!el.querySelector("nav")) return
  yaAviso = true
  console.warn(
    "[sebs7n-ui] <PageHeader breadcrumb> recibió un <nav> adentro del <nav> que pone PageHeader: " +
      "son dos landmarks de navegación anidados para la misma lista. Pasá `<BreadcrumbList>` suelto, " +
      "sin envolverlo en `<Breadcrumb>`."
  )
}

export function PageHeaderBreadcrumb({
  label,
  className,
  children,
}: {
  /** Nombre del `<nav>`. Sin esto, el del `LabelsProvider`. */
  label?: string
  className?: string
  children?: React.ReactNode
}) {
  const textos = useLabels().pageHeader
  return (
    <nav
      data-slot="page-header-breadcrumb"
      ref={avisarSiHayNavAnidado}
      aria-label={label ?? textos.breadcrumb}
      className={cn("text-label-13 text-gray-900", className)}
    >
      {children}
    </nav>
  )
}
