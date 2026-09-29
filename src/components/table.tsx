import type * as React from "react"

import { cn } from "../lib/utils.js"

/**
 * La tabla es la vista de lista de iCloud Drive (catálogo §2.5): sin caja alrededor, cabecera de
 * 14 sin fondo con una línea abajo, filas de 41 con separadores interiores, y la fila elegida en el
 * acento sólido con radio 10 mientras la tabla tiene el foco (gris sin foco). Los grupos («Últimos 7
 * días · 6 ítems») van con `TableGroupHeader`.
 *
 * La primera celda de cada fila es el nombre —17, texto principal—; el resto son metadatos en 14
 * secundario, como las columnas de Drive. Una columna de casillas primero se ajusta con `className`.
 */
type TableProps = React.ComponentProps<"table"> & { density?: "default" | "compact" }

function Table({ className, density = "default", ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      // La fila elegida va en acento solo con el foco adentro (`group-focus-within/table`). Un
      // click en una celda común no enfocaba nada —y en Safari un click no enfoca botones—, así
      // que la fila parpadeaba a gris. Con `tabIndex={-1}` el contenedor toma el foco del click:
      // no entra en el orden de Tab y no muestra anillo (un click no es `focus-visible`).
      tabIndex={-1}
      className="group/table relative w-full overflow-x-auto outline-none"
    >
      {/* `border-separate`: con `collapse` el radio de las celdas de los extremos no se dibuja. */}
      <table data-slot="table" className={cn("w-full caption-bottom border-separate border-spacing-0 text-callout", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  // Sin fondo: las filas de la cabecera son de `<th>`, y el hover y el separador solo miran `<td>`.
  return <thead data-slot="table-header" className={className} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={className} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("text-callout [&_td]:shadow-[inset_0_1px_0_var(--color-separator)] [&_tr]:hover:[&>*]:bg-transparent", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/table-row group/selectable h-[41px] group-data-[density=compact]/table:h-8 [&>*]:transition-control",
        // Radio 10 en los extremos: la fila elegida (o con el puntero) es una píldora de Drive. El
        // fondo va en las celdas porque un `<tr>` no dibuja radio.
        "[&>:first-child]:rounded-s-item [&>:last-child]:rounded-e-item",
        // El separador: 1 px arriba de cada celda, que en la primera arranca a 10 del borde (donde
        // empieza el texto). No va en la primera fila, ni al lado de la fila con el puntero o la
        // elegida, ni después de un título de grupo, como en Drive.
        "[&>td]:bg-[linear-gradient(var(--color-separator),var(--color-separator))] [&>td]:bg-no-repeat [&>td]:bg-[length:100%_1px] [&>td]:bg-top",
        "[&>td:first-child]:bg-[length:calc(100%-10px)_1px] [&>td:first-child]:bg-right-top",
        "first:[&>td]:bg-none hover:[&>td]:bg-none [tr:hover+&]:[&>td]:bg-none data-[state=selected]:[&>td]:bg-none [[data-state=selected]+&]:[&>td]:bg-none [[data-slot=table-group-header]+&]:[&>td]:bg-none",
        // El hover es `fill-1`, como en Drive. La elegida es la de iCloud: acento sólido con el texto
        // y los íconos en el color de contraste **mientras la tabla tiene el foco**
        // (`group-focus-within/table`), y el gris de `selection-inactive` con el texto principal
        // cuando el foco se va a otro lado. `TableCell` cuelga de `group/table-row` para lo mismo.
        // El anillo de foco sobre el acento no se vería en brand: en la fila elegida va el inverso.
        "hover:[&>td]:bg-fill-1 data-[state=selected]:[&>td]:bg-selection-inactive data-[state=selected]:[&>td]:text-label",
        "data-[state=selected]:group-focus-within/table:[&>td]:bg-selection data-[state=selected]:group-focus-within/table:text-on-selection data-[state=selected]:group-focus-within/table:[&_svg]:text-on-selection",
        "[&[tabindex]]:cursor-pointer focus-visible:focus-ring data-[state=selected]:focus-visible:focus-ring-inverse",
        className
      )}
      {...props}
    />
  )
}

/** Alineación numérica: a la derecha y con cifras tabulares. El `<th>` y el `<td>` la declaran igual. */
type TableHeadProps = React.ComponentProps<"th"> & { numeric?: boolean }

// La cabecera de Drive: 44, 14 sin negrita y sin fondo, con la línea de toda la tabla abajo. iCloud la
// pinta en terciario; acá va en secundario, porque el terciario en 14 no llega a 4,5:1.
function TableHead({ className, numeric = false, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 px-2.5 text-left align-middle text-callout font-normal whitespace-nowrap text-label-secondary shadow-[inset_0_-1px_0_var(--color-separator)]",
        numeric && "text-right tabular-nums",
        className
      )}
      {...props}
    />
  )
}

type TableCellProps = React.ComponentProps<"td"> & { numeric?: boolean }

function TableCell({ className, numeric = false, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-2.5 align-middle whitespace-nowrap text-callout text-label-secondary first:text-body first:text-label group-data-[state=selected]/table-row:group-focus-within/table:text-on-selection",
        numeric && "text-right tabular-nums",
        className
      )}
      {...props}
    />
  )
}

type TableGroupHeaderProps = Omit<React.ComponentProps<"tr">, "children"> & {
  /** El título del grupo («Últimos 7 días»). */
  children: React.ReactNode
  /** El contador que va pegado al título («6 ítems»), en 15 secundario. */
  count?: React.ReactNode
  /** Cuántas columnas ocupa. Por defecto, todas (100 alcanza para cualquier tabla). */
  colSpan?: number
}

// El título de un grupo de filas de Drive: 58 de alto, 19/600 y el contador en 15 sin negrita al
// lado. Es un `<th scope="colgroup">`: el lector lo anuncia como encabezado de las filas que siguen.
function TableGroupHeader({ className, children, count, colSpan = 100, ...props }: TableGroupHeaderProps) {
  return (
    <tr data-slot="table-group-header" className={className} {...props}>
      <th scope="colgroup" colSpan={colSpan} className="h-[58px] px-0.5 pt-3 text-left align-middle text-title-3 whitespace-nowrap text-label">
        {children}
        {count != null && (
          <>
            {" "}
            <span className="text-subheadline font-normal text-label-secondary">{count}</span>
          </>
        )}
      </th>
    </tr>
  )
}

// Aire arriba y abajo: el caption va debajo de la tabla, como una nota.
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("px-2.5 py-3 text-callout text-label-secondary", className)} {...props} />
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableGroupHeader,
  TableHead,
  TableHeader,
  TableRow,
  type TableCellProps,
  type TableGroupHeaderProps,
  type TableHeadProps,
  type TableProps,
}
