"use client"

import { EllipsisIcon, FileTextIcon, SquarePenIcon } from "lucide-react"
import { Button } from "sebs7n-ui/button"
import { CardRow } from "sebs7n-ui/card"
import { PromoCard, PromoCardLink, WidgetCard } from "sebs7n-ui/widget-card"

const IconoFacturas = (
  <span className="flex size-10 items-center justify-center rounded-control bg-brand-700 text-brand-contrast">
    <FileTextIcon className="size-5" />
  </span>
)

const Nueva = (
  <Button aria-label="Nueva factura" size="icon-md" variant="plain">
    <SquarePenIcon />
  </Button>
)

const Mas = (
  <Button aria-label="Ver todas las facturas" size="icon-sm" variant="plain">
    <EllipsisIcon />
  </Button>
)

/**
 * El widget
 * Todo de una: ícono de la app, título, subtítulo y la acción arriba; filas con separadores interiores y el «…» abajo. Son las partes de `Card`, ya armadas.
 */
export function Basico() {
  return (
    <WidgetCard action={Nueva} className="w-full max-w-sm" icon={IconoFacturas} more={Mas} subtitle="Septiembre · 3 por cobrar" title="Facturas">
      <CardRow description="Factura 0012" title="Acme S.A." trailing="30/09" />
      <CardRow description="Factura 0013" title="Nube Digital" trailing="28/09" />
      <CardRow description="Factura 0014" title="Estudio Ruiz" trailing="21/09" />
    </WidgetCard>
  )
}

/**
 * Sobre el wallpaper
 * Adentro de `AppShell ambient` (acá, un `data-ambient` con `bg-ambient`) la franja pasa al material translúcido y el cuerpo, en oscuro, a negro al 75 % con blur: el widget de Home de iCloud. Grande, con dos columnas.
 */
export function SobreElWallpaper() {
  return (
    <div className="w-full rounded-surface bg-ambient p-6 sm:p-8" data-ambient="">
      <WidgetCard action={Nueva} className="w-full" columns={2} icon={IconoFacturas} more={Mas} subtitle="Últimos 7 días" title="Cobranzas">
        <CardRow description="Transferencia" title="Acme S.A." trailing="$ 128.400" />
        <CardRow description="Tarjeta" title="Nube Digital" trailing="$ 96.000" />
        <CardRow description="Transferencia" title="Estudio Ruiz" trailing="$ 41.200" />
        <CardRow description="Efectivo" title="Taller Sur" trailing="$ 12.800" />
      </WidgetCard>
    </div>
  )
}

/**
 * La card promocional
 * La de Ajustes de iCloud: degradado de marca, título grande, links con chevron y el chip translúcido. El texto es el color de contraste de la marca, así que anda con cualquier brand.
 */
export function Promocional() {
  return (
    <PromoCard chip="12 usuarios" className="w-full max-w-md" title="Plan Pro">
      <PromoCardLink href="#plan">Plan</PromoCardLink>
      <PromoCardLink href="#facturacion">Facturación</PromoCardLink>
      <PromoCardLink href="#beneficios">Beneficios</PromoCardLink>
    </PromoCard>
  )
}
