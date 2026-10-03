import { StatGrid } from "sebs7n-ui/stat-grid"

import { STATS } from "../_data/content"
import { SectionHeader } from "./section-header"

// Cuatro cifras en una fila de cards parejas (una por columna en el teléfono): `StatGrid` decide las columnas.
export function Stats() {
  return (
    <section className="flex scroll-mt-20 flex-col gap-10" id="cifras">
      <SectionHeader title="Acme en números" />
      <StatGrid items={STATS} />
    </section>
  )
}
