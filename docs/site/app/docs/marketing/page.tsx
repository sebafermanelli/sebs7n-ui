import type { Metadata } from "next"
import { ViewTransition } from "react"
import { Button } from "sebs7n-ui/button"
import { PageHeader, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Reveal, RevealGroup } from "sebs7n-ui/reveal"
import { SectionBackdrop } from "sebs7n-ui/section-backdrop"
import { SectionHeader } from "sebs7n-ui/section-header"
import { WindowFrame } from "sebs7n-ui/window-frame"

import { Basic as NavbarMobileMenuDemo } from "../../_demos/navbar-mobile-menu"
import { Basic as ScrollStoryDemo } from "../../_demos/scroll-story"
import { Variants as BackdropVariants } from "../../_demos/section-backdrop"
import { Basic as SkipLinkDemo } from "../../_demos/skip-link"
import { Basic as WindowFrameDemo, Elevations } from "../../_demos/window-frame"

export const metadata: Metadata = {
  title: "Marketing",
  description: "El kit opt-in para una landing expresiva sin dejar el lenguaje de iCloud: escala display, énfasis, fondos de sección, Reveal, WindowFrame y ScrollStory.",
}

const SCALE = [
  ["text-display", "clamp(40 → 72 px)", "El titular del hero."],
  ["text-display-2", "clamp(32 → 52 px)", "El titular de una sección grande."],
  ["text-display-3", "clamp(24 → 34 px)", "Un titular de bloque."],
  ["text-lead", "clamp(17 → 21 px)", "La bajada bajo un titular."],
] as const

function Block({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6" id={`${id}-section`}>
      <SectionHeader align="start" description={description} id={id} title={title} />
      {children}
    </section>
  )
}

export default function MarketingPage() {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex max-w-5xl flex-col gap-20 pb-24">
        <PageHeader>
          <PageHeaderTitle>Marketing</PageHeaderTitle>
          <PageHeaderDescription>
            Un kit opt-in para una landing con más presencia, sin dejar el lenguaje de iCloud: más contraste de tamaños, una entrada que se asienta, fondos que parecen papel y recorridos con el scroll. Nada de esto cambia un componente existente: se pide a mano, por subpath.
          </PageHeaderDescription>
        </PageHeader>

        <SectionBackdrop className="-mx-4 rounded-surface px-4 py-16 @lg:-mx-8 @lg:px-8" variant="grid">
          <div className="flex flex-col gap-6">
            <Reveal>
              <h2 className="text-display text-label">
                Facturá con <span className="emphasis-accent">calma</span>
                <span className="emphasis-muted">, cobrá sin perseguir a nadie.</span>
              </h2>
            </Reveal>
            <Reveal delay={90}>
              <p className="max-w-[56ch] text-lead text-label-secondary">
                La escala display es fluida (<code className="text-callout">clamp()</code>) y el énfasis es de color sólido o de peso: nunca un degradé en el texto.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="flex flex-wrap gap-3">
                <Button>Empezar</Button>
                <Button variant="secondary">Ver precios</Button>
              </div>
            </Reveal>
          </div>
        </SectionBackdrop>

        <Block
          description="Cuatro roles nuevos para titulares de marketing, con más contraste que `text-large-title` (48). Llevan la fuente de titulares de la app (`--font-heading`)."
          id="escala"
          title="Escala display"
        >
          <div className="flex flex-col divide-y divide-separator rounded-surface border border-separator">
            {SCALE.map(([role, range, use]) => (
              <div className="grid gap-2 p-5 @lg:grid-cols-[12rem_minmax(0,1fr)] @lg:gap-6" key={role}>
                <div className="flex flex-col gap-0.5">
                  <code className="text-callout text-label">{role}</code>
                  <span className="text-footnote text-label-secondary">{range}</span>
                  <span className="text-footnote text-label-secondary">{use}</span>
                </div>
                <p className={`${role} min-w-0 text-label`}>{role === "text-lead" ? "Emití, enviá y cobrá desde un solo lugar." : "Facturación sin planillas"}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 @lg:grid-cols-3">
            <p className="text-display-3 text-label">
              Resalta con <span className="emphasis-accent">color</span>
            </p>
            <p className="text-display-3 text-label">
              O con <span className="emphasis-strong">peso</span>
            </p>
            <p className="text-display-3 text-label">
              O baja <span className="emphasis-muted">lo demás</span>
            </p>
          </div>
        </Block>

        <Block
          description="Tres texturas quietas, opt-in por sección. Se apagan hacia los bordes y siguen el tema claro y oscuro."
          id="fondos"
          title="Fondos de sección"
        >
          <BackdropVariants />
        </Block>

        <Block
          description="El marco de una ventana de producto, con las sombras del set chico (`resting`, `floating`, `overlay`)."
          id="marco"
          title="WindowFrame"
        >
          <div className="flex flex-col gap-8">
            <WindowFrameDemo />
            <Elevations />
          </div>
        </Block>

        <Block
          description="Cada bloque sube y se asienta una sola vez, con easing exponencial. El texto no baja de opacidad y, con movimiento reducido, todo queda quieto."
          id="reveal"
          title="Reveal"
        >
          <RevealGroup className="grid gap-4 @lg:grid-cols-3" step={90}>
            {["Emitir", "Enviar", "Cobrar"].map((title) => (
              <WindowFrame controls={false} elevation="resting" key={title} title={title}>
                <p className="p-4 text-callout text-label-secondary">Entra {title === "Emitir" ? "primero" : title === "Enviar" ? "después" : "al final"}.</p>
              </WindowFrame>
            ))}
          </RevealGroup>
        </Block>

        <Block
          description="Pasos numerados con filetes de 1 px y un escenario que cambia con el scroll. Si no entra (teléfono, ventana baja) o con movimiento reducido, se apila."
          id="historia"
          title="ScrollStory"
        >
          <ScrollStoryDemo />
        </Block>

        <Block description="Dos piezas chicas que una landing necesita: «Ir al contenido» y el menú de la barra en el teléfono." id="navegacion" title="SkipLink y NavbarMobileMenu">
          <SkipLinkDemo />
          <NavbarMobileMenuDemo />
        </Block>
      </div>
    </ViewTransition>
  )
}
