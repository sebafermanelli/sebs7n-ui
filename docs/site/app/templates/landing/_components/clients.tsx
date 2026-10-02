import { Marquee } from "sebs7n-ui/marquee"

import { CLIENTS } from "../_data/content"

const items = CLIENTS.map((name) => ({ id: name, node: <span className="text-headline whitespace-nowrap">{name}</span> }))

export function Clients() {
  return (
    <section className="flex flex-col items-center gap-4">
      <p className="text-callout text-label-secondary">Lo usan equipos de administración de todo tamaño</p>
      <Marquee aria-label="Clientes" className="w-full" items={items} />
    </section>
  )
}
