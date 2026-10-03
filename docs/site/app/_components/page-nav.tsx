import Link from "next/link"
import { TextLink } from "sebs7n-ui/text-link"

/**
 * Índice de la página, a la derecha cuando el contenido es ancho. Vive dentro de `AppShellContent`
 * (`@container`): aparece por el ancho de ese contenedor, no por el de la ventana.
 */
export function PageNav({ items }: { items: { text: string; id: string }[] }) {
  if (!items.length) return null
  return (
    // top-(--app-shell-header) + 32: se pega debajo de la barra global del AppShell (44) con el aire
    // del py-8 de AppShellContent. `self-start`: como ítem de un flex se estiraba y el sticky no pegaba.
    <nav aria-label="En esta página" className="sticky top-[calc(var(--app-shell-header,0px)+2rem)] hidden w-56 shrink-0 self-start @5xl:block">
      <div className="px-2 py-1 text-footnote text-label-secondary">En esta página</div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <TextLink className="block px-2 py-1 text-callout" render={<Link href={`#${item.id}`} />} variant="subtle">
              {item.text}
            </TextLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
