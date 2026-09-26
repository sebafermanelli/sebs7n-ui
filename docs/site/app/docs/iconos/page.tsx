import type { Metadata } from "next"
import { ViewTransition } from "react"

import { IconCatalog } from "../../_components/icon-catalog"

export const metadata: Metadata = {
  title: "Iconos",
  description: "Los íconos de lucide, con búsqueda. Un clic copia el import.",
}

export default function IconosPage() {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex max-w-4xl flex-col gap-8 pb-24">
        <header className="flex flex-col gap-3">
          <h1 className="text-heading-40 text-gray-1000">Iconos</h1>
          <p className="text-copy-18 text-gray-900">
            El paquete usa <a className="text-brand-900 underline underline-offset-4 hover:text-brand-1000" href="https://lucide.dev" rel="noreferrer" target="_blank">lucide</a>, y no hace falta instalar
            nada más: ya es dependencia. Buscá, hacé clic y pegá el import. Para tamaños, tonos y el nombre accesible, ver{" "}
            <a className="text-brand-900 underline underline-offset-4 hover:text-brand-1000" href="/docs/components/icon">
              Icon
            </a>
            .
          </p>
        </header>
        <IconCatalog />
      </div>
    </ViewTransition>
  )
}
