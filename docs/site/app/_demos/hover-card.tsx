"use client"

import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { Badge } from "sebs7n-ui/badge"
import { HoverCard, HoverCardContent, HoverCardHeader, HoverCardTrigger } from "sebs7n-ui/hover-card"
import { linkVariants } from "sebs7n-ui/variants/link"

/**
 * El adelanto de un cliente
 * El trigger es un `<a>`: se le pasa `href` derecho. Todo lo que está en la tarjeta está también del otro lado del link, porque en un celular la tarjeta no existe.
 */
export function Basico() {
  return (
    <p className="max-w-sm text-copy-14 text-gray-1000">
      La factura 0012 salió a nombre de{" "}
      <HoverCard>
        <HoverCardTrigger className={linkVariants({ variant: "inline" })} href="#">
          Acme S.A.
        </HoverCardTrigger>
        <HoverCardContent>
          <HoverCardHeader>
            <Avatar>
              <AvatarFallback>AC</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="text-heading-14 text-gray-1000">Acme S.A.</span>
              <span className="text-copy-13 text-gray-900">CUIT 30-71234567-8</span>
            </div>
          </HoverCardHeader>
          <div className="flex items-center gap-2">
            <Badge color="green" size="sm">
              Al día
            </Badge>
            <span className="text-copy-13 text-gray-900">12 facturas · $ 1.284.000</span>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      y vence el 30/09.
    </p>
  )
}

/**
 * Los dos retardos
 * `delay` evita que se dispare al pasar de largo; `closeDelay` da tiempo a llegar con el mouse hasta la tarjeta. El de abajo abre casi en el acto: se nota la diferencia moviendo el mouse por la línea.
 */
export function Retardos() {
  const ficha = (
    <HoverCardContent side="top">
      <span className="text-heading-14 text-gray-1000">Plan Pro</span>
      <span className="text-copy-13 text-gray-900">
        Usuarios ilimitados, facturación electrónica y soporte en 24 h. $ 18.400 por mes.
      </span>
    </HoverCardContent>
  )
  return (
    <div className="flex max-w-sm flex-col gap-3 text-copy-14 text-gray-1000">
      <span>
        Por defecto, 600 ms para abrir:{" "}
        <HoverCard>
          <HoverCardTrigger className={linkVariants({ variant: "inline" })} href="#">
            Plan Pro
          </HoverCardTrigger>
          {ficha}
        </HoverCard>
      </span>
      <span>
        Con 100 ms:{" "}
        <HoverCard>
          <HoverCardTrigger className={linkVariants({ variant: "inline" })} closeDelay={100} delay={100} href="#">
            Plan Pro
          </HoverCardTrigger>
          {ficha}
        </HoverCard>
      </span>
    </div>
  )
}
