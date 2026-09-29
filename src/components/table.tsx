import type * as React from "react"

import { cn } from "../lib/utils.js"

type TableProps = React.ComponentProps<"table"> & { density?: "default" | "compact" }

function Table({ className, density = "default", ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      className="group/table relative w-full overflow-x-auto rounded-surface border border-gray-alpha-400 material-group shadow-card"
    >
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse text-body", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-gray-alpha-100 [&_tr]:h-10 [&_tr]:hover:bg-transparent", className)}
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
      className={cn("border-t border-gray-alpha-400 bg-gray-alpha-100 text-callout [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/table-row group/selectable h-12 border-b border-gray-alpha-400 transition-control group-data-[density=compact]/table:h-10",
        // El hover es un velo, no un fondo: `gray-alpha-100` es un 5 % de negro en claro y un 7 %
        // de blanco en oscuro. Un gris opaco tapaba el vidrio de la tabla y la fila parecía
        // recortada y pegada encima. La elegida es la selección de macOS (2.0), como una fila de
        // Finder: acento sólido, y las celdas e íconos pasan al color de contraste (`TableCell`
        // cuelga de `group/table-row`). El anillo de foco sobre el acento no se vería en brand:
        // en la fila elegida va en el color de contraste.
        "hover:bg-gray-alpha-100 data-[state=selected]:bg-selection data-[state=selected]:text-on-selection data-[state=selected]:[&_svg]:text-on-selection",
        "[&[tabindex]]:cursor-pointer focus-visible:shadow-[inset_0_0_0_2px_var(--color-brand-700)] focus-visible:outline-none data-[state=selected]:focus-visible:shadow-[inset_0_0_0_2px_var(--color-on-selection)]",
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
        "px-4 text-left align-middle text-callout whitespace-nowrap text-gray-900",
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
      className={cn("px-4 align-middle whitespace-nowrap text-gray-1000 group-data-[state=selected]/table-row:text-on-selection", numeric && "text-right tabular-nums", className)}
      {...props}
    />
  )
}

// Aire arriba y abajo, no solo arriba: el pie vive ADENTRO del contorno de la tabla. Con
// `mt-4` a secas el texto quedaba apoyado en el borde de abajo, y con el radio de 20px la
// esquina le pasaba por encima.
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("px-4 py-3 text-callout text-gray-900", className)} {...props} />
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
