"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "sebs7n-ui/lib/utils"

type Grupo = { id: string; title: string; items: { title: string; href: string }[] }

export function DocsNav({ nav }: { nav: Grupo[] }) {
  const pathname = usePathname()
  return (
    <nav aria-label="Documentación" className="flex flex-col gap-6">
      {nav.map((grupo) => (
        <div className="flex flex-col gap-1" key={grupo.id}>
          <div className="px-2 py-1 text-label-12 text-gray-900">{grupo.title}</div>
          <ul className="flex flex-col gap-0.5">
            {grupo.items.map((item) => {
              const activo = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-copy-14 outline-none transition-control focus-visible:focus-ring",
                      activo ? "bg-gray-100 text-gray-1000" : "text-gray-900 hover:bg-gray-100 hover:text-gray-1000"
                    )}
                    href={item.href}
                  >
                    {item.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
