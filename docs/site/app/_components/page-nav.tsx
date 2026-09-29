import Link from "next/link"

/** Índice de la página, a la derecha en pantallas anchas. */
export function PageNav({ items }: { items: { text: string; id: string }[] }) {
  if (!items.length) return null
  return (
    // top-(--app-shell-header) + 32: se pega debajo de la barra global del AppShell (44) con el aire
    // del py-8 de AppShellContent.
    // `self-start`: como ítem de un flex se estiraba a todo el alto de la fila y el sticky no pegaba.
    <nav aria-label="En esta página" className="sticky top-[calc(var(--app-shell-header,0px)+2rem)] hidden w-56 shrink-0 self-start xl:block">
      <div className="px-2 py-1 text-label-12 text-label-secondary">En esta página</div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              className="block rounded-control px-2 py-1 text-copy-13 text-label-secondary outline-none transition-control hover:text-label focus-visible:focus-ring"
              href={`#${item.id}`}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
