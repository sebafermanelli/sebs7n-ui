"use client"

import { SlashIcon } from "lucide-react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "sebs7n-ui/breadcrumb"
import { PageHeader, PageHeaderTitle } from "sebs7n-ui/page-header"

/**
 * Una página de detalle
 * Los separadores los pone `BreadcrumbList`. El último nivel no es link: lleva `aria-current="page"`.
 */
export function Basico() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/docs" />}>Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/docs/components/table" />}>Clientes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Acme S.A.</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Muchos niveles: colapsar el medio
 * `maxItems={4}` deja el primero, un «…» con nombre accesible y los dos últimos.
 */
export function Colapsado() {
  return (
    <Breadcrumb>
      <BreadcrumbList maxItems={4}>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Inicio</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Clientes</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Acme S.A.</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Facturas</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>0012</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

/**
 * Dentro de un PageHeader
 * Acá va `BreadcrumbList` **suelto**: el `<nav>` ya lo pone la prop `breadcrumb`.
 */
export function EnPageHeader() {
  return (
    <PageHeader
      breadcrumb={
        <BreadcrumbList separator={<SlashIcon />}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Facturas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>0012</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      }
    >
      <PageHeaderTitle>Factura 0012</PageHeaderTitle>
    </PageHeader>
  )
}
