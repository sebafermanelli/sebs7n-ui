"use client"

import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "sebs7n-ui/card"

/** Las piezas */
export function Completa() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Factura 0012</CardTitle>
        <CardDescription>Acme S.A. · vence el 30/09</CardDescription>
        <CardAction>
          <Badge color="green">Pagada</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="text-heading-32 text-gray-1000 tabular-nums">$ 128.400</div>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="outline">
          Descargar
        </Button>
        <Button size="sm" variant="ghost">
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Superficie y banda
 * `default` es lo que flota sobre la página; `subtle` es una zona hundida.
 */
export function Variantes() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <Card size="sm">
        <CardHeader>
          <CardTitle>default</CardTitle>
          <CardDescription>Borde y `bg-background-100`.</CardDescription>
        </CardHeader>
      </Card>
      <Card size="sm" variant="subtle">
        <CardHeader>
          <CardTitle>subtle</CardTitle>
          <CardDescription>Sin borde, `bg-background-200`.</CardDescription>
        </CardHeader>
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
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <a className="block" href="/docs/components/card">
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
