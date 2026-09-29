import type * as React from "react"

import { cn } from "../lib/utils.js"

type TableProps = React.ComponentProps<"table"> & { density?: "default" | "compact" }

function Table({ className, density = "default", ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      className="group/table relative w-full overflow-x-auto rounded-surface border border-separator bg-surface"
    >
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse text-body", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-fill-1 [&_tr]:h-10 [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-separator bg-fill-1 text-callout [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/table-row group/selectable h-12 border-b border-separator transition-control group-data-[density=compact]/table:h-10",
        // El hover es `fill-1`, como en Drive. La elegida es la de iCloud (2.0): acento sólido con
        // el texto y los íconos en el color de contraste **mientras la tabla tiene el foco**
        // (`group-focus-within/table`), y el gris de `selection-inactive` cuando el foco se va a
        // otro lado, como una lista de Drive que pierde el foco. `TableCell` cuelga de
        // `group/table-row` para lo mismo. El anillo de foco sobre el acento no se vería en brand:
        // en la fila elegida va el inverso.
        "hover:bg-fill-1 data-[state=selected]:bg-selection-inactive data-[state=selected]:group-focus-within/table:bg-selection data-[state=selected]:group-focus-within/table:text-on-selection data-[state=selected]:group-focus-within/table:[&_svg]:text-on-selection",
        "[&[tabindex]]:cursor-pointer focus-visible:focus-ring data-[state=selected]:focus-visible:focus-ring-inverse",
        className
      )}
      {...props}
    />
  )
}

/** Alineación numérica: a la derecha y con cifras tabulares. El `<th>` y el `<td>` la declaran igual. */
type TableHeadProps = React.ComponentProps<"th"> & { numeric?: boolean }

function TableHead({ className, numeric = false, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "px-4 text-left align-middle text-callout whitespace-nowrap text-label-secondary",
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
      className={cn("px-4 align-middle whitespace-nowrap text-label group-data-[state=selected]/table-row:group-focus-within/table:text-on-selection", numeric && "text-right tabular-nums", className)}
      {...props}
    />
  )
}

// Aire arriba y abajo, no solo arriba: el pie vive ADENTRO del contorno de la tabla. Con
// `mt-4` a secas el texto quedaba apoyado en el borde de abajo, y con el radio de 20px la
// esquina le pasaba por encima.
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("px-4 py-3 text-callout text-label-secondary", className)} {...props} />
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableCellProps,
  type TableHeadProps,
  type TableProps,
}
