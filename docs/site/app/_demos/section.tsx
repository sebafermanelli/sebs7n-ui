import { RuledList, RuledListItem } from "sebs7n-ui/ruled-list"
import { Section } from "sebs7n-ui/section"
import { SectionHeader } from "sebs7n-ui/section-header"

/**
 * Una franja agrupada
 * `grouped` ocupa todo el ancho con `bg-grouped` y filetes; la columna de adentro tiene su propio ancho máximo.
 */
export function Grouped() {
  return (
    <div className="w-full overflow-hidden rounded-surface border border-separator">
      <Section aria-label="Cobros" innerClassName="py-10" maxWidth="640px" variant="grouped">
        <SectionHeader align="start" description="Lo que pasa después de emitir." level={3} title="Cobros" />
        <RuledList>
          <RuledListItem title="Recordatorios">Automáticos, sin que lo pidas.</RuledListItem>
        </RuledList>
      </Section>
    </div>
  )
}
