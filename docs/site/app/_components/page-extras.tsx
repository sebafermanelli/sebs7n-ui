import { Bitter } from "next/font/google"
import { Button } from "sebs7n-ui/button"
import { Reveal } from "sebs7n-ui/reveal"
import { SectionBackdrop } from "sebs7n-ui/section-backdrop"

import { NeutralTintToggle } from "./neutral-tint-toggle"

// La fuente de titulares de una app de ejemplo, cargada como lo haría ella (`--font-heading`). Se acota a un contenedor y,
// como `--font-display` se resuelve en la raíz, se la reapunta a mano ahí mismo.
const bitter = Bitter({ subsets: ["latin"], variable: "--font-heading", display: "swap" })

const SCALE = [
  ["text-display", "El titular del hero"],
  ["text-display-2", "Una sección grande"],
  ["text-display-3", "Un titular de bloque"],
  ["text-lead", "Emití, enviá y cobrá desde un solo lugar."],
] as const

/** Lo vivo que una página de Sistema muestra después de su texto (el markdown no puede). */
export function PageExtras({ slug }: { slug: string }) {
  if (slug === "tokens") {
    return (
      <div className={`${bitter.variable} flex flex-col gap-6`} style={{ "--font-display": "var(--font-heading)" } as React.CSSProperties}>
        <SectionBackdrop className="rounded-surface border border-separator px-6 py-12" variant="wash">
          <div className="flex flex-col gap-4">
            <Reveal>
              <h3 className="text-display text-label">
                Facturá con <span className="emphasis-accent">calma</span>
                <span className="emphasis-muted">, cobrá sin perseguir a nadie.</span>
              </h3>
            </Reveal>
            <Reveal delay={90}>
              <p className="max-w-[56ch] text-lead text-label-secondary">Escala fluida, énfasis de color o de peso, nunca un degradé en el texto.</p>
            </Reveal>
            <Reveal delay={180}>
              <div className="flex flex-wrap gap-3">
                <Button>Empezar</Button>
                <Button variant="secondary">Ver precios</Button>
              </div>
            </Reveal>
          </div>
        </SectionBackdrop>
        <div className="flex flex-col divide-y divide-separator rounded-surface border border-separator">
          {SCALE.map(([role, sample]) => (
            <div className="grid gap-2 p-5 @lg:grid-cols-[12rem_minmax(0,1fr)] @lg:gap-6" key={role}>
              <code className="text-callout text-label">{role}</code>
              <p className={`${role} min-w-0 text-label`}>{sample}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (slug === "theming") return <NeutralTintToggle />
  return null
}
