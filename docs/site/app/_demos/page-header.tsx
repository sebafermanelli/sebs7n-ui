"use client"

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "sebs7n-ui/breadcrumb"
import { Button } from "sebs7n-ui/button"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Tabs, TabsList, TabsTrigger } from "sebs7n-ui/tabs"

/**
 * Con migas, acciones y tabs
 * La página de Settings de iCloud: migas de 12, título de 48, bajada de 17 gris con un ancho de lectura de 650 y las pestañas de línea debajo. Cualquier hijo que no sea título, bajada o acciones ocupa una fila entera debajo.
 */
export function Basico() {
  return (
    <PageHeader
      breadcrumb={
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Facturas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>0012</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      }
    >
      <PageHeaderTitle>Factura 0012</PageHeaderTitle>
      <PageHeaderDescription>Acme S.A. · emitida el 01/09 · vence el 30/09.</PageHeaderDescription>
      <PageHeaderActions>
        <Button variant="secondary">Descargar</Button>
        <Button>Enviar por email</Button>
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
