import Link from "next/link"

/** Índice de la página, a la derecha en pantallas anchas. */
export function PageNav({ items }: { items: { text: string; id: string }[] }) {
  if (!items.length) return null
  return (
    <nav aria-label="En esta página" className="sticky top-20 hidden w-56 shrink-0 xl:block">
      <div className="px-2 py-1 text-label-12 text-gray-900">En esta página</div>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              className="block rounded-md px-2 py-1 text-copy-13 text-gray-900 outline-none transition-control hover:text-gray-1000 focus-visible:focus-ring"
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
