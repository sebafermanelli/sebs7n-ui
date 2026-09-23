"use client"

import { Button } from "sebs7n-ui/button"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Tabs, TabsList, TabsTrigger } from "sebs7n-ui/tabs"

/**
 * Con migas, acciones y tabs
 * Cualquier hijo que no sea título, bajada o acciones ocupa una fila entera debajo.
 */
export function Basico() {
  return (
    <PageHeader
      breadcrumb={
        <>
          <a href="/docs">Facturas</a>
          <span aria-hidden="true">›</span>
          <span>0012</span>
        </>
      }
    >
      <PageHeaderTitle>Factura 0012</PageHeaderTitle>
      <PageHeaderDescription>Acme S.A. · emitida el 01/09 · vence el 30/09.</PageHeaderDescription>
      <PageHeaderActions>
        <Button variant="outline">Descargar</Button>
        <Button variant="accent">Enviar por email</Button>
      </PageHeaderActions>
      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="items">Ítems</TabsTrigger>
        </TabsList>
      </Tabs>
    </PageHeader>
  )
}
