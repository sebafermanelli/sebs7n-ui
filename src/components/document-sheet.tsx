import type * as React from "react"

import { LabelText } from "../internal/labels-text.js"
import type { Labels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Badge } from "./badge.js"

/**
 * Una hoja de documento —una factura, un contrato, un informe— dibujada como papel: el margen
 * rayado a la izquierda, la franja de arriba con el estado y la página, el título, las secciones con
 * citas que llevan su chip de verificación, un resumen de cifras y las versiones al pie.
 *
 * ```tsx
 * <DocumentSheet label="Factura F-0012" caption="Vista previa.">
 *   <DocumentSheetHeader><span>Borrador</span><span>Pág. 1 de 1</span></DocumentSheetHeader>
 *   <DocumentSheetTitle>Factura F-0012</DocumentSheetTitle>
 *   <DocumentSheetSection heading="Conceptos">
 *     Soporte mensual <DocumentCitation status="verified">según la orden 118</DocumentCitation>.
 *   </DocumentSheetSection>
 * </DocumentSheet>
 * ```
 *
 * Es una ilustración de un documento, no el documento: los títulos de adentro son `<p>` y no
 * `<h*>`, para no meter encabezados en el esquema de la página (un `<h1>`, un `<h2>` por sección).
 * Server Component: lo único de cliente es el texto del chip, que lee el `LabelsProvider`.
 */
type DocumentSheetProps = React.ComponentProps<"figure"> & {
  /** El nombre accesible de la figura («Factura F-0012»). */
  label?: string
  /** Una línea debajo de la hoja, fuera del papel (`<figcaption>`). */
  caption?: React.ReactNode
}

function DocumentSheet({ label, caption, className, children, ...props }: DocumentSheetProps) {
  return (
    <figure aria-label={label} data-slot="document-sheet" className={cn("m-0", className)} {...props}>
      <div className="relative rounded-surface border border-separator-strong bg-surface py-6 pr-6 pl-12 shadow-widget max-sm:py-4 max-sm:pr-4 max-sm:pl-10">
        {/* El margen de cuaderno son dos filetes de 1 px: decoración, fuera del árbol accesible. */}
        <span aria-hidden="true" className="absolute inset-y-0 left-9 w-px bg-separator-strong max-sm:left-6" />
        <span aria-hidden="true" className="absolute inset-y-0 left-10 w-px bg-separator-strong max-sm:left-7" />
        {children}
      </div>
      {caption != null && <figcaption className="mt-3 text-footnote text-label-secondary">{caption}</figcaption>}
    </figure>
  )
}

/** La franja de arriba: dos o más datos chicos repartidos a lo ancho («Borrador» · «Pág. 1 de 2»). */
function DocumentSheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="document-sheet-header"
      className={cn(
        "flex justify-between gap-3 border-b border-separator-strong pb-2.5 text-caption font-medium tracking-wide text-label-secondary uppercase",
        className
      )}
      {...props}
    />
  )
}

/** El título del documento, con la fuente de titulares. Un `<p>`: ver `DocumentSheet`. */
function DocumentSheetTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="document-sheet-title" className={cn("mt-3.5 mb-1 font-display text-title-2 text-label", className)} {...props} />
}

/** La línea debajo del título (partes, fecha, referencia). */
function DocumentSheetSubtitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="document-sheet-subtitle"
      className={cn("border-b border-separator pb-3 text-footnote text-label-secondary", className)}
      {...props}
    />
  )
}

type DocumentSheetSectionProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** El rótulo de la sección, en versalitas chicas («Conceptos», «Condiciones»). */
  heading?: React.ReactNode
}

/** Una sección: el rótulo y el texto, que puede llevar `DocumentCitation` en línea. */
function DocumentSheetSection({ heading, className, children, ...props }: DocumentSheetSectionProps) {
  return (
    <div data-slot="document-sheet-section" className={cn("mt-3.5", className)} {...props}>
      {heading != null && <p className="mb-1 text-footnote font-semibold tracking-wider text-label uppercase">{heading}</p>}
      <p className="text-callout leading-relaxed text-label">{children}</p>
    </div>
  )
}

type DocumentSheetLabels = NonNullable<Labels["documentSheet"]>

/** Los textos por defecto del chip (no están en `defaultLabels`: el componente es solo por subpath). */
const documentSheetLabels: DocumentSheetLabels = { verified: "Verificada", pending: "A verificar" }

type DocumentCitationProps = React.ComponentProps<"span"> & {
  /** `verified` (chip verde) o `pending` (ámbar). El estado también va en texto: nunca solo color. */
  status: "verified" | "pending"
  /** Cambia los textos del chip; le gana al `LabelsProvider` (`labels.documentSheet`). */
  labels?: Partial<DocumentSheetLabels>
}

/** Un tramo del texto que cita una fuente, seguido de su chip de verificación. */
function DocumentCitation({ status, labels, className, children, ...props }: DocumentCitationProps) {
  return (
    <span data-slot="document-citation" data-status={status} className={className} {...props}>
      {children}{" "}
      <Badge color={status === "verified" ? "green" : "amber"} size="sm">
        <LabelText defaults={documentSheetLabels} group="documentSheet" labels={labels} name={status} />
      </Badge>
    </span>
  )
}

type DocumentSheetSummaryProps = React.ComponentProps<"dl"> & {
  /** Las filas: rótulo a la izquierda y cifra a la derecha, en números tabulares. */
  items: { label: React.ReactNode; value: React.ReactNode }[]
  /** Una línea al pie del recuadro: de dónde salen las cifras. */
  footnote?: React.ReactNode
}

/** Un recuadro de cifras (subtotal, impuestos, total) como lista de definiciones. Nombralo con `aria-label`. */
function DocumentSheetSummary({ items, footnote, className, ...props }: DocumentSheetSummaryProps) {
  return (
    <dl
      data-slot="document-sheet-summary"
      className={cn(
        "mt-3 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 rounded-field border border-separator-strong bg-fill-1 px-3 py-2.5 text-footnote",
        className
      )}
      {...props}
    >
      {items.map((row, index) => (
        <div className="col-span-2 grid grid-cols-subgrid" key={index}>
          <dt className="text-label-secondary">{row.label}</dt>
          <dd className="text-right font-semibold text-label tabular-nums">{row.value}</dd>
        </div>
      ))}
      {footnote != null && (
        <p className="col-span-2 mt-1 border-t border-separator-strong pt-1.5 text-caption text-label-secondary">{footnote}</p>
      )}
    </dl>
  )
}

type DocumentSheetVersionsProps = Omit<React.ComponentProps<"ol">, "children"> & {
  /** Las versiones en orden; `id` es lo que se ve en negrita («v2») y `detail` la línea de abajo. */
  items: { id: string; detail?: React.ReactNode }[]
  /** El `id` de la versión actual. Por defecto, la última. */
  current?: string
}

/** La línea de versiones al pie: puntos unidos por un filete, la actual llena y con `aria-current`. */
function DocumentSheetVersions({ items, current, className, ...props }: DocumentSheetVersionsProps) {
  const currentId = current ?? items.at(-1)?.id
  return (
    <ol
      data-slot="document-sheet-versions"
      className={cn("mt-4 grid list-none border-t border-separator-strong pt-3", className)}
      style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      {...props}
    >
      {items.map((version, index) => {
        const active = version.id === currentId
        return (
          <li
            aria-current={active ? "step" : undefined}
            className="relative pt-[18px] pr-2 text-footnote text-label-secondary"
            data-active={active || undefined}
            key={version.id}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute top-1 left-0 z-10 size-[9px] rounded-full border-[1.5px]",
                active ? "border-label bg-label" : "border-label-secondary bg-surface"
              )}
            />
            {index < items.length - 1 && <span aria-hidden="true" className="absolute top-2 right-0 left-[9px] h-px bg-separator-strong" />}
            <b className="block text-callout font-semibold text-label">{version.id}</b>
            {version.detail}
          </li>
        )
      })}
    </ol>
  )
}

export {
  DocumentCitation,
  DocumentSheet,
  DocumentSheetHeader,
  documentSheetLabels,
  DocumentSheetSection,
  DocumentSheetSubtitle,
  DocumentSheetSummary,
  DocumentSheetTitle,
  DocumentSheetVersions,
  type DocumentCitationProps,
  type DocumentSheetProps,
  type DocumentSheetSectionProps,
  type DocumentSheetSummaryProps,
  type DocumentSheetVersionsProps,
}
