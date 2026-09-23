"use client"

import Link from "next/link"
import { useState } from "react"
import { Pagination } from "sebs7n-ui/pagination"

/**
 * Con botones
 * Para una lista que se pagina sin cambiar de URL: `onPageChange` recibe la página destino.
 */
export function ConBotones() {
  const [page, setPage] = useState(1)
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="text-copy-14 text-gray-900">Página {page} de 10</p>
      <Pagination onPageChange={setPage} page={page} pageCount={10} />
    </div>
  )
}

/**
 * Con links
 * Si la página vive en la URL, `render`: son `<a>` de verdad, el crawler los ve y se abren en una pestaña nueva.
 */
export function ConLinks() {
  return (
    <Pagination
      page={4}
      pageCount={12}
      render={(page) => <Link href={`/docs/components/pagination?page=${page}`} scroll={false} />}
    />
  )
}

/**
 * Muchas páginas y tamaño chico
 * El ancho no salta: cuando un «…» desaparece, lo reemplaza un número.
 */
export function MuchasPaginas() {
  const [page, setPage] = useState(50)
  return <Pagination onPageChange={setPage} page={page} pageCount={100} size="sm" />
}
