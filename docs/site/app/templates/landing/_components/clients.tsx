import { Marquee } from "sebs7n-ui/marquee"

import { CLIENTS } from "../_data/content"

const items = CLIENTS.map((name) => ({ id: name, node: <span className="text-headline whitespace-nowrap">{name}</span> }))

// En escritorio, la franja que se desliza (tocarla la pausa; el botón de pausa queda para teclado y lector).
// En el teléfono no: el borde difuminado cortaba los nombres a la mitad, así que van todos a la vista, en grilla.
export function Clients() {
  return (
    <section className="flex scroll-mt-20 flex-col items-center gap-4" id="clientes">
      <p className="text-center text-callout text-label-secondary">Lo usan equipos de administración de todo tamaño</p>
      <ul aria-label="Clientes" className="grid w-full grid-cols-2 gap-x-4 gap-y-3 text-center text-headline text-label-secondary sm:hidden">
        {CLIENTS.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <Marquee aria-label="Clientes" className="hidden w-full sm:flex" items={items} pauseControl="press" />
    </section>
  )
}
