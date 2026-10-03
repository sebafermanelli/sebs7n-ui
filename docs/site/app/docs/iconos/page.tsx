import { icons } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { ViewTransition } from "react"
import { Icon } from "sebs7n-ui/icon"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { TextLink } from "sebs7n-ui/text-link"

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
        <PageHeader>
          <PageHeaderTitle>Iconos</PageHeaderTitle>
          <PageHeaderDescription>
            El paquete usa{" "}
            <TextLink href="https://lucide.dev" trailing="external" variant="inline">
              lucide
            </TextLink>
            , y no hace falta instalar nada más: ya es dependencia. Buscá, hacé clic y pegá el import. Para tamaños, tonos y el nombre accesible, ver{" "}
            <TextLink render={<Link href="/docs/components/icon" />} variant="inline">
              Icon
            </TextLink>
            .
          </PageHeaderDescription>
        </PageHeader>
        <IconCatalog iniciales={INICIALES} nombres={NOMBRES} />
      </div>
    </ViewTransition>
  )
}
