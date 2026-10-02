import { CLIENTS } from "../_data/content"

// Fila fija, no `Marquee`: seis logos entran en una línea, y algo que se mueve más de 5 s necesita
// un botón de pausa (WCAG 2.2.2). Si fueran muchos, `Marquee` con su pausa.
export function Clients() {
  return (
    <section className="flex flex-col items-center gap-4">
      <p className="text-callout text-label-secondary">Lo usan equipos de administración de todo tamaño</p>
      <ul aria-label="Clientes" className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {CLIENTS.map((name) => (
          <li className="text-headline whitespace-nowrap text-label-secondary" key={name}>
            {name}
          </li>
        ))}
      </ul>
    </section>
  )
}
