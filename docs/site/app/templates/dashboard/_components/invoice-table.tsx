"use client"

import { MoreHorizontalIcon, CheckCircle2Icon, BanIcon } from "lucide-react"
import { Badge, type BadgeProps } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "sebs7n-ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"
import type { Invoice, InvoiceStatus } from "../_data/invoices-mock"

const STATUS_BADGE: Record<InvoiceStatus, { label: string; color: BadgeProps["color"] }> = {
  paid: { label: "Cobrada", color: "green" },
  pending: { label: "Pendiente", color: "amber" },
  overdue: { label: "Vencida", color: "red" },
  void: { label: "Anulada", color: "gray" },
}

interface InvoiceTableProps {
  invoices: Invoice[]
  onMarkAsPaid: (id: string) => void
  onOpenVoidDialog: (invoice: Invoice) => void
}

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" })
// Las fechas del mock son `YYYY-MM-DD` locales: con `new Date(iso)` serían UTC y en Argentina darían el día anterior.
const shortDate = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" })
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number)
  return shortDate.format(new Date(y!, m! - 1, d))
}

export function InvoiceTable({ invoices, onMarkAsPaid, onOpenVoidDialog }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-surface border border-separator bg-surface text-center">
        <p className="text-callout font-medium text-label">No se encontraron facturas</p>
        <p className="text-footnote text-label-secondary">Probá cambiando el filtro o término de búsqueda.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-surface border border-separator bg-surface shadow-widget">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead className="w-32" numeric>
              Monto
            </TableHead>
            <TableHead className="w-28">Estado</TableHead>
            <TableHead className="w-32" numeric>
              Vencimiento
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => {
            const badgeInfo = STATUS_BADGE[inv.status]
            return (
              <TableRow key={inv.id}>
                <TableCell className="tabular-nums">{inv.id}</TableCell>
                <TableCell>{inv.customer}</TableCell>
                <TableCell className="text-label-secondary">{inv.concept}</TableCell>
                <TableCell numeric>{money.format(inv.amount)}</TableCell>
                <TableCell>
                  <Badge color={badgeInfo.color} size="sm">
                    {badgeInfo.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-label-secondary" numeric>
                  {formatDate(inv.dueDate)}
                </TableCell>
                <TableCell className="text-center">
                  {/* Una anulada ya no tiene acciones: sin trigger, en vez de un menú vacío. */}
                  {inv.status !== "void" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button size="icon-sm" variant="plain" aria-label={`Acciones para ${inv.id}`} />}>
                        <MoreHorizontalIcon className="size-4 text-label-secondary" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {inv.status !== "paid" && (
                          <>
                            <DropdownMenuItem onClick={() => onMarkAsPaid(inv.id)}>
                              <CheckCircle2Icon />
                              Marcar cobrada
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem variant="destructive" onClick={() => onOpenVoidDialog(inv)}>
                          <BanIcon />
                          Anular factura
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
