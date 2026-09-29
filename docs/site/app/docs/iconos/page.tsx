import { icons } from "lucide-react"
import type { Metadata } from "next"
import { ViewTransition } from "react"
import { Icon } from "sebs7n-ui/icon"

import { IconCatalog } from "../../_components/icon-catalog"
import { PAGINA } from "../../_lib/iconos"

export const metadata: Metadata = {
  title: "Iconos",
  description: "Los íconos de lucide, con búsqueda. Un clic copia el import.",
}

// Los nombres y los primeros íconos salen de acá, del servidor: así el catálogo no tiene que
// importar lucide entero para pintar la primera tanda. Ver `icon-catalog.tsx`.
const NOMBRES = Object.keys(icons)
const INICIALES = Object.fromEntries(
  NOMBRES.slice(0, PAGINA).map((nombre) => [
    nombre,
    <Icon icon={icons[nombre as keyof typeof icons]} key={nombre} label={`Copiar el import de ${nombre}Icon`} size="md" />,
  ])
)

export default function IconosPage() {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex max-w-4xl flex-col gap-8 pb-24">
        <header className="flex flex-col gap-3">
          <h1 className="text-large-title text-label">Iconos</h1>
          <p className="text-body text-label-secondary">
            El paquete usa <a className="text-brand-900 underline underline-offset-4 hover:text-brand-1000" href="https://lucide.dev" rel="noreferrer" target="_blank">lucide</a>, y no hace falta instalar
            nada más: ya es dependencia. Buscá, hacé clic y pegá el import. Para tamaños, tonos y el nombre accesible, ver{" "}
            <a className="text-brand-900 underline underline-offset-4 hover:text-brand-1000" href="/docs/components/icon">
              Icon
            </a>
            .
          </p>
        </header>
        <IconCatalog iniciales={INICIALES} nombres={NOMBRES} />
      </div>
    </ViewTransition>
  )
}
