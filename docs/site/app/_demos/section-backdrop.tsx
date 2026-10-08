import { SectionBackdrop } from "sebs7n-ui/section-backdrop"
import { SectionHeader } from "sebs7n-ui/section-header"

const VARIANTS = [
  ["wash", "Lavado de la marca al 7 %."],
  ["grid", "Retícula de filetes de 1 px."],
  ["grain", "Grano fino al 5 %."],
] as const

/**
 * Tres fondos, ninguno de adorno
 * Lavado de marca, retícula y grano: texturas quietas que se apagan hacia los bordes. Sin degradé violeta, sin glow.
 */
export function Variants() {
  return (
    <div className="grid w-full gap-4 @lg:grid-cols-3">
      {VARIANTS.map(([variant, text]) => (
        <SectionBackdrop className="rounded-surface border border-separator px-4 py-10" key={variant} variant={variant}>
          <SectionHeader align="start" description={text} level={3} title={variant} />
        </SectionBackdrop>
      ))}
    </div>
  )
}
