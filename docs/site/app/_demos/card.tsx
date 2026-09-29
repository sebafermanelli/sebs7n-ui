"use client"

import { EllipsisIcon, FileTextIcon, ListFilterIcon, SquarePenIcon, UsersIcon } from "lucide-react"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardRow,
  CardTitle,
} from "sebs7n-ui/card"

/**
 * El widget
 * La card de iCloud: una franja de cabecera de otro tono con el ícono de la app, título y subtítulo, la acción arriba a la derecha, el cuerpo en filas con separadores interiores y el «…» abajo, sin franja de pie.
 */
export function Completa() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader
        icon={
          <span className="flex size-10 items-center justify-center rounded-control bg-brand-700 text-brand-contrast">
            <FileTextIcon className="size-5" />
          </span>
        }
      >
        <CardTitle>Facturas</CardTitle>
        <CardDescription>Septiembre · 3 por cobrar</CardDescription>
        <CardAction>
          <Button aria-label="Nueva factura" size="icon-md" variant="plain">
            <SquarePenIcon />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <CardRow description="Factura 0012" title="Acme S.A." trailing="30/09" />
        <CardRow description="Factura 0011" title="Nube Digital" trailing="28/09" />
        <CardRow description="Factura 0010" title="Estudio Ruiz" trailing="25/09" />
      </CardContent>
      <CardFooter>
        <Button aria-label="Ver todas las facturas" className="-ms-1.5" size="icon-sm" variant="plain">
          <EllipsisIcon />
        </Button>
        <Button aria-label="Filtrar" size="icon-sm" variant="plain">
          <ListFilterIcon />
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Dos columnas
 * El widget grande: `CardContent columns={2}` reparte las filas en dos columnas con una regla vertical en el medio.
 */
export function DosColumnas() {
  return (
    <Card className="w-full">
      <CardHeader
        icon={
          <span className="flex size-10 items-center justify-center rounded-control bg-fill-2 text-brand-900">
            <UsersIcon className="size-5" />
          </span>
        }
      >
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Los que más facturaron</CardDescription>
      </CardHeader>
      <CardContent columns={2}>
        <CardRow description="12 facturas" title="Acme S.A." trailing="$ 1.284.000" />
        <CardRow description="9 facturas" title="Nube Digital" trailing="$ 912.500" />
        <CardRow description="7 facturas" title="Estudio Ruiz" trailing="$ 640.200" />
        <CardRow description="4 facturas" title="Taller Norte" trailing="$ 318.000" />
      </CardContent>
    </Card>
  )
}

/**
 * Lo simple
 * Sin ícono ni filas: la franja con título y un badge como acción, y un cuerpo libre. `subtle` es la card hundida y sin sombra, para ir adentro de otra superficie.
 */
export function Variantes() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Factura 0012</CardTitle>
          <CardDescription>Acme S.A. · vence el 30/09</CardDescription>
          <CardAction>
            <Badge color="green" size="sm">
              Pagada
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-title-1 text-label tabular-nums">$ 128.400</div>
        </CardContent>
      </Card>
      <Card size="sm" variant="subtle">
        <CardContent>
          <p className="text-callout text-label-secondary">La variante subtle: fill-1, sin sombra, para adentro de otra superficie.</p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Interactiva y seleccionada
 * `interactive` solo pone los estilos: para que sea clickeable tiene que ser un `<a>` o un `<button>`.
 */
export function Interactiva() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <a className="block rounded-surface outline-none focus-visible:focus-ring" href="/docs/components/card">
        <Card interactive size="sm">
          <CardHeader>
            <CardTitle>Plan Pro</CardTitle>
            <CardDescription>Hasta 500 facturas por mes.</CardDescription>
          </CardHeader>
        </Card>
      </a>
      <Card selected size="sm">
        <CardHeader>
          <CardTitle>Plan Equipo</CardTitle>
          <CardDescription>El que está elegido.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
