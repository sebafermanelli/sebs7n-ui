"use client"

import { LayoutGridIcon, ListIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent, CardGrid, CardHeader, CardTitle } from "sebs7n-ui/card"
import { EmptyState } from "sebs7n-ui/empty-state"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { useStoredState } from "sebs7n-ui/lib/use-stored-state"
import { List, ListRow } from "sebs7n-ui/list-row"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Pagination } from "sebs7n-ui/pagination"
import { SearchField } from "sebs7n-ui/search-field"
import { Skeleton } from "sebs7n-ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "sebs7n-ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { linkVariants } from "sebs7n-ui/variants/link"

import { LoadError } from "../_components/load-error"
import { NewCustomerDialog } from "../_components/new-customer-dialog"
import { deriveCustomers, filterCustomers, type BalanceFilter, type Customer } from "../_data/derive"
import { money, plural, wholeMoney } from "../_lib/format"
import { pageCountOf, pageOf } from "../_lib/paging"
import { customerPath } from "../_lib/routes"
import { useInvoicesStore } from "../_state/invoices-context"

type View = "list" | "grid"
const isView = (value: unknown): value is View => value === "list" || value === "grid"
const BALANCES: BalanceFilter[] = ["all", "owing", "settled"]
const isBalance = (value: unknown): value is BalanceFilter => BALANCES.includes(value as BalanceFilter)

/** Clientes por página: seis entran en dos filas de la grilla de tres. */
const PAGE_SIZE = 6

const owed = (customer: Customer) => (customer.outstanding > 0 ? `${money.format(customer.outstanding)} por cobrar` : "Al día")
// En la lista angosta el monto de la derecha y el detalle le comen el ancho al nombre: sin centavos y más corto.
const owedShort = (customer: Customer) => (customer.outstanding > 0 ? `debe ${wholeMoney.format(customer.outstanding)}` : "Al día")

export default function CustomersPage() {
  const { invoices, customers: records, loading, error, retry, addCustomer } = useInvoicesStore()
  const [query, setQuery] = useState("")
  const [balance, setBalance] = useState<BalanceFilter>("all")
  const [page, setPage] = useState(1)
  const [view, setView] = useStoredState<View>("acme-dashboard:customers-view", "list", isView)
  const all = deriveCustomers(invoices, records)
  const customers = filterCustomers(all, query, balance)
  const pageCount = pageCountOf(customers.length, PAGE_SIZE)
  const current = Math.min(page, pageCount)
  const shown = pageOf(customers, current, PAGE_SIZE)
  const filtered = query.trim() !== "" || balance !== "all"
  const clear = () => {
    setQuery("")
    setBalance("all")
    setPage(1)
  }

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Clientes</PageHeaderTitle>
        <PageHeaderDescription>Lo que se le facturó a cada uno y lo que falta cobrar.</PageHeaderDescription>
        <PageHeaderActions>
          <NewCustomerDialog existingNames={all.map((customer) => customer.name)} onAddCustomer={addCustomer} />
        </PageHeaderActions>
      </PageHeader>

      {error ? (
        <LoadError onRetry={retry} what="los clientes" />
      ) : (
        <>
          <FilterBar
            actions={
              // Elegir una vista es elegir una de dos: no se deja ninguna apagada (un valor vacío se ignora). Sin
              // `required`: su input escondido, hijo directo de la barra, tomaba el ancho completo en el teléfono.
              <ToggleGroup aria-label="Vista" onValueChange={(value) => isView(value[0]) && setView(value[0])} size="sm" value={[view]}>
                <Tooltip>
                  <TooltipTrigger render={<ToggleGroupItem aria-label="Lista" value="list" />}>
                    <ListIcon />
                  </TooltipTrigger>
                  <TooltipContent>Lista</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger render={<ToggleGroupItem aria-label="Tarjetas" value="grid" />}>
                    <LayoutGridIcon />
                  </TooltipTrigger>
                  <TooltipContent>Tarjetas</TooltipContent>
                </Tooltip>
              </ToggleGroup>
            }
            filters={
              // Tres opciones que entran en 390 px: ToggleGroup, no un Select.
              <ToggleGroup
                aria-label="Saldo"
                onValueChange={(value) => {
                  if (isBalance(value[0])) {
                    setBalance(value[0])
                    setPage(1)
                  }
                }}
                size="sm"
                value={[balance]}
              >
                <ToggleGroupItem value="all">Todos</ToggleGroupItem>
                <ToggleGroupItem value="owing">Con saldo</ToggleGroupItem>
                <ToggleGroupItem value="settled">Al día</ToggleGroupItem>
              </ToggleGroup>
            }
            role="search"
            search={
              <SearchField
                aria-label="Buscar cliente"
                onValueChange={(value) => {
                  setQuery(value)
                  setPage(1)
                }}
                placeholder="Buscar cliente…"
                size="sm"
                value={query}
              />
            }
          />

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              action={
                <Button onClick={clear} variant="secondary">
                  Limpiar filtros
                </Button>
              }
              description={filtered ? "Revisá cómo está escrito el nombre o probá con otro saldo." : "Dá de alta el primero con «Nuevo cliente»."}
              title={query.trim() ? `Ningún cliente coincide con «${query.trim()}»` : filtered ? "Ningún cliente con ese saldo" : "Todavía no hay clientes"}
            />
          ) : view === "grid" ? (
            // Cada tarjeta tiene las mismas tres franjas (nombre, contacto, saldo): en una fila quedan parejas.
            <CardGrid columns={3}>
              {shown.map((customer) => (
                <Card key={customer.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link className={linkVariants({ variant: "row" })} href={customerPath(customer.id)}>
                        {customer.name}
                      </Link>
                    </CardTitle>
                    <p className="truncate text-callout text-label-secondary">{customer.email ?? "Sin correo cargado"}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1">
                    <p className="text-title-3 text-label tabular-nums">{money.format(customer.billed)}</p>
                    <p className="text-callout text-label-secondary">
                      {plural(customer.invoiceCount, "factura", "facturas")} · {owed(customer)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </CardGrid>
          ) : (
            <Card>
              <CardContent>
                <List aria-label="Clientes">
                  {shown.map((customer) => (
                    <ListRow
                      chevron
                      description={`${plural(customer.invoiceCount, "factura", "facturas")} · ${owedShort(customer)}`}
                      key={customer.id}
                      render={<Link href={customerPath(customer.id)} />}
                      title={customer.name}
                      trailing={wholeMoney.format(customer.billed)}
                    />
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {!loading && pageCount > 1 && <Pagination className="self-center" onPageChange={setPage} page={current} pageCount={pageCount} size="sm" />}
        </>
      )}
    </AppShellContent>
  )
}
