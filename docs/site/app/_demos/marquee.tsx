"use client"

import { Marquee } from "sebs7n-ui/marquee"

// Clientes de ejemplo de una cuenta de facturación, como texto: el sitio no tiene logos de nadie.
const CLIENTS = ["Acme S.A.", "Globex SRL", "Initech", "Umbrella Corp.", "Hooli", "Stark Industrias", "Wayne Enterprises", "Soylent", "Tyrell", "Cyberdyne"]

const items = CLIENTS.map((name) => ({
  id: name,
  node: <span className="text-headline whitespace-nowrap">{name}</span>,
}))

/**
 * Clientes
 * Si no entran en el ancho, pasan en bucle; se pausa con el puntero encima o con el botón, y con foco en un link queda quieta. Con movimiento reducido queda quieta y se scrollea a mano.
 */
export function Clients() {
  return <Marquee aria-label="Clientes que facturan con nosotros" className="w-full" items={items} />
}

/**
 * Pocos, quietos
 * Si entran, la fila queda quieta y centrada: no hay nada que mover.
 */
export function Few() {
  return <Marquee aria-label="Clientes destacados" className="w-full" items={items.slice(0, 3)} />
}
