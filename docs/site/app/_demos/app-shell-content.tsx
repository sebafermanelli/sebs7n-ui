"use client"

import { AppShellContent } from "sebs7n-ui/app-shell-content"
import { Card, CardContent } from "sebs7n-ui/card"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

/**
 * El contenedor de una página
 * Ancho máximo, márgenes y separación iguales en toda la app.
 */
export function Basico() {
  return (
    <div className="w-full rounded-xl border border-gray-400 bg-background">
      <AppShellContent>
        <PageHeader>
          <PageHeaderTitle>Clientes</PageHeaderTitle>
          <PageHeaderDescription>Todo lo que factura Acme.</PageHeaderDescription>
        </PageHeader>
        <Card>
          <CardContent>El contenido de la página, con el `gap-6` del contenedor.</CardContent>
        </Card>
      </AppShellContent>
    </div>
  )
}
