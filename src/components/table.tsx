import type * as React from "react"

import { cn } from "../lib/utils.js"

type TableProps = React.ComponentProps<"table"> & { density?: "default" | "compact" }

function Table({ className, density = "default", ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      data-density={density}
      className="group/table relative w-full overflow-x-auto rounded-xl border border-gray-400"
    >
      <table data-slot="table" className={cn("w-full caption-bottom border-collapse text-copy-13", className)} {...props} />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-background-200 [&_tr]:h-10 [&_tr]:hover:bg-transparent", className)}
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
      className={cn("border-t border-gray-400 bg-background-200 text-label-13 [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "h-12 border-b border-gray-400 transition-control group-data-[density=compact]/table:h-10",
        "hover:bg-gray-100 data-[state=selected]:bg-brand-100",
        "[&[tabindex]]:cursor-pointer focus-visible:shadow-[inset_0_0_0_2px_var(--color-brand-700)] focus-visible:outline-none",
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
        "px-4 text-left align-middle text-label-12 whitespace-nowrap text-gray-900",
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
      className={cn("px-4 align-middle whitespace-nowrap text-gray-1000", numeric && "text-right tabular-nums", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-copy-13 text-gray-900", className)} {...props} />
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
