"use client"

import { useState } from "react"
import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { EmptyState } from "sebs7n-ui/empty-state"
import { List, ListRow } from "sebs7n-ui/list-row"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { SearchField } from "sebs7n-ui/search-field"
import { Skeleton } from "sebs7n-ui/skeleton"

import { deriveCustomers } from "../_data/derive"
import { money } from "../_lib/format"
import { useInvoicesStore } from "../_state/invoices-context"

export default function CustomersPage() {
  const { invoices, loading } = useInvoicesStore()
  const [query, setQuery] = useState("")
  const needle = query.trim().toLocaleLowerCase("es")
  const customers = deriveCustomers(invoices).filter((c) => !needle || c.name.toLocaleLowerCase("es").includes(needle))

  return (
    <AppShellContent>
      <PageHeader>
        <PageHeaderTitle>Clientes</PageHeaderTitle>
        <PageHeaderDescription>Lo que se le facturó a cada uno y lo que falta cobrar.</PageHeaderDescription>
      </PageHeader>

      <div className="w-full sm:max-w-xs">
        <SearchField aria-label="Buscar cliente" onValueChange={setQuery} placeholder="Buscar cliente…" value={query} />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton className="h-12 w-full" key={i} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => setQuery("")} variant="secondary">
              Limpiar búsqueda
            </Button>
          }
          description="Revisá cómo está escrito el nombre."
          title={`Ningún cliente coincide con «${query.trim()}»`}
        />
      ) : (
        <Card>
          <CardContent>
            <List aria-label="Clientes">
              {customers.map((customer) => (
                <ListRow
                  description={`${customer.invoiceCount} ${customer.invoiceCount === 1 ? "factura" : "facturas"} · ${
                    customer.outstanding > 0 ? `${money.format(customer.outstanding)} por cobrar` : "al día"
                  }`}
                  key={customer.name}
                  title={customer.name}
                  trailing={money.format(customer.billed)}
                />
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </AppShellContent>
  )
}
