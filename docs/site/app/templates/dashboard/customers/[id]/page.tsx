"use client"

import { MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { EmptyState } from "sebs7n-ui/empty-state"
import { formatPhone } from "sebs7n-ui/lib/phone"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Skeleton } from "sebs7n-ui/skeleton"
import { StatGrid } from "sebs7n-ui/stat-grid"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"
import { buttonVariants } from "sebs7n-ui/variants/button"
import { WidgetCard } from "sebs7n-ui/widget-card"
import { toast } from "sonner"

import { STATUS_BADGE } from "../../_components/invoice-status"
import { NewInvoiceDialog } from "../../_components/new-invoice-dialog"
import { deriveCustomers } from "../../_data/derive"
import { formatDayMonth, money } from "../../_lib/format"
import { CUSTOMERS_PATH, INVOICES_PATH } from "../../_lib/routes"
import { isCollectable } from "../../_state/invoices-reducer"
import { useInvoicesStore } from "../../_state/invoices-context"

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { invoices, customers: records, loading, addInvoice } = useInvoicesStore()
  const all = deriveCustomers(invoices, records)
  const customer = all.find((c) => c.id === id)

  if (!customer) {
    return (
      <AppShellContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <EmptyState
            action={
              <Link className={buttonVariants()} href={CUSTOMERS_PATH}>
                Volver a Clientes
              </Link>
            }
            description="Puede que se haya escrito mal la dirección."
            title="No encontramos a ese cliente"
          />
        )}
      </AppShellContent>
    )
  }

  const mine = invoices.filter((inv) => inv.customer === customer.name).sort((a, b) => b.date.localeCompare(a.date))
  const collectable = mine.filter(isCollectable)

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>{customer.name}</PageHeaderTitle>
        <PageHeaderDescription>{customer.city ? `Cliente de ${customer.city}.` : "Ficha del cliente."}</PageHeaderDescription>
        <PageHeaderActions>
          <Button
            disabled={collectable.length === 0}
            onClick={() => toast.success(`Recordatorio enviado a ${customer.name}.`)}
            variant="secondary"
          >
            Enviar recordatorio
          </Button>
          <NewInvoiceDialog customers={all.map((c) => c.name)} defaultCustomer={customer.name} onAddInvoice={addInvoice} />
        </PageHeaderActions>
      </PageHeader>

      <StatGrid
        columns={3}
        items={[
          { id: "billed", label: "Facturado", value: money.format(customer.billed), hint: "Sin las anuladas" },
          { id: "outstanding", label: "Por cobrar", value: money.format(customer.outstanding), hint: "Pendientes y vencidas" },
          { id: "count", label: "Facturas", value: String(customer.invoiceCount), hint: "Emitidas en total" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <WidgetCard subtitle="De la más nueva a la más vieja" title="Facturas">
          {mine.length === 0 ? (
            <p className="text-callout text-label-secondary">Todavía no se le emitió ninguna factura.</p>
          ) : (
            // Una tabla simple: son pocas filas y no hace falta ordenar ni buscar, que es lo que agrega `DataTable`.
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead numeric>Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mine.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="tabular-nums">{inv.id}</TableCell>
                    <TableCell className="max-w-48 truncate">{inv.concept}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDayMonth(inv.dueDate)}</TableCell>
                    <TableCell>
                      <Badge color={STATUS_BADGE[inv.status].color} size="sm">
                        {STATUS_BADGE[inv.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell numeric>{money.format(inv.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <Link className={buttonVariants({ variant: "plain" })} href={INVOICES_PATH}>
            Ver todas las facturas
          </Link>
        </WidgetCard>

        <WidgetCard subtitle="A dónde van los avisos" title="Contacto">
          <ul aria-label="Datos de contacto" className="flex flex-col gap-3 text-callout text-label">
            <li className="flex items-center gap-2">
              <MailIcon aria-hidden="true" className="size-4 text-label-secondary" />
              {customer.email ?? "Sin correo cargado"}
            </li>
            <li className="flex items-center gap-2">
              <PhoneIcon aria-hidden="true" className="size-4 text-label-secondary" />
              {customer.phone ? formatPhone(customer.phone) : "Sin teléfono cargado"}
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon aria-hidden="true" className="size-4 text-label-secondary" />
              {customer.city || "Sin ciudad cargada"}
            </li>
          </ul>
        </WidgetCard>
      </div>
    </AppShellContent>
  )
}
