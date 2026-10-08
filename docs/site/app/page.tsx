import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import { Button } from "sebs7n-ui/button"
import { Reveal, RevealGroup } from "sebs7n-ui/reveal"
import { DefinitionItem, DefinitionList, RuledList, RuledListItem } from "sebs7n-ui/ruled-list"
import { SectionBackdrop } from "sebs7n-ui/section-backdrop"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "sebs7n-ui/table"
import { ThemeSwitcherLazy } from "sebs7n-ui/theme-switcher-lazy"
import { buttonVariants } from "sebs7n-ui/variants/button"
import { WindowFrame } from "sebs7n-ui/window-frame"

import site from "@/.generated/site.json"
import { CopyButton } from "sebs7n-ui/copy-button"

import { CodeBlock } from "./_components/code-block"
import { Inline } from "./_components/inline"
import { SectionHeader } from "./_components/section-header"
import { SiteFooter } from "./_components/site-footer"
import { SiteHeader } from "./_components/site-header"
import { START_HREF } from "./_components/site-nav-data"

// Poco texto y un solo acento por pantalla: el de la primera acción. La versión y la cantidad de componentes salen de
// `site.json` (que arma `scripts/generate.mjs` desde `package.json` y de `src/components/`), nunca se escriben acá:
// `test/home-sync.test.ts` falla si alguien las pega a mano.
const RAZONES = [
  { title: "Una sola dependencia", body: "Se instala, se importa y se actualiza con una versión. No se copian archivos a cada app." },
  { title: "Tailwind v4, sin config", body: "Los tokens son variables CSS: no hay tailwind.config.js." },
  { title: "Tu marca, en todo", body: "Cuatro variables de color y los grises se inclinan hacia tu matiz solos." },
  { title: "Accesible por contrato", body: "Foco visible, teclado y contraste AA medidos por tests, no a ojo." },
  { title: "Legible para un agente", body: "Cada página también se sirve como .md, con llms.txt y un registry shadcn." },
]

const FILAS = [
  ["F-0012", "Estudio Norte", "$ 145.200", "Emitida", "green"],
  ["F-0013", "Taller Sur", "$ 38.900", "Borrador", "gray"],
  ["F-0014", "Equipo Oeste", "$ 92.000", "Emitida", "green"],
] as const

const INSTALL = `pnpm add sebs7n-ui @base-ui/react next-themes sonner`

export default function Home() {
  const destacados = site.components.filter((component) => component.detallado).slice(0, 6)
  return (
    <div className="min-h-dvh bg-background" id="top">
      <SiteHeader version={site.version} />
      {/*
        El hero es una sola composición: a la izquierda lo que se dice, a la derecha lo que se ve (una pantalla armada con el paquete), y un
        fondo continuo que cubre las dos cosas. El lavado de la marca se funde hacia abajo con una máscara (sin corte seco, el grano también) y
        un foco suave detrás del titular y de la ventana marca dónde mirar. Bajo `lg` se apila: el texto y, debajo, la ventana entera.
      */}
      <SectionBackdrop
        backdropClassName="[-webkit-mask-image:linear-gradient(to_bottom,#000_55%,transparent)] [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
        className="px-4 pt-10 pb-24 md:px-6 md:pt-16 md:pb-32"
        variant="wash"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] [background:radial-gradient(ellipse_55%_50%_at_30%_35%,color-mix(in_oklab,var(--sf-brand-700)_9%,transparent),transparent_70%),radial-gradient(ellipse_40%_45%_at_78%_45%,color-mix(in_oklab,var(--sf-brand-700)_6%,transparent),transparent_70%)]"
        />
        <div className="mx-auto grid w-full max-w-[1080px] items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:gap-12">
          <RevealGroup className="flex flex-col items-start gap-7 [&>*]:max-w-full" step={90}>
            <Badge>v{site.version}</Badge>
            <h1 className="text-display-2 text-balance text-label">
              Interfaces <span className="emphasis-accent">calmas</span>
              <span className="emphasis-muted">, con una sola dependencia.</span>
            </h1>
            <p className="max-w-[34rem] text-lead text-pretty text-label-secondary">
              El lenguaje de iCloud, cálido y cuidado: {site.components.length} componentes accesibles, neutros con el tinte de tu marca y tipografía con
              carácter.
            </p>
            <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Link className={buttonVariants({ size: "lg" })} href={START_HREF}>
                Empezar
              </Link>
              <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href="/docs/playground">
                Probarlo en el Playground
              </Link>
            </div>
            {/* El comando es un dato, no una acción: una línea tenue con su botón de copiar, por debajo de los botones. */}
            <p className="flex max-w-full min-w-0 items-center gap-1 text-footnote text-label-secondary">
              <code className="min-w-0 truncate text-mono-callout">{INSTALL}</code>
              <CopyButton aria-label="Copiar el comando de instalación" value={INSTALL} />
            </p>
          </RevealGroup>

          <Reveal delay={160}>
            <div className="flex flex-col items-center gap-5">
              <WindowFrame className="w-full" elevation="overlay" title="Facturas">
                <div className="flex items-center justify-between gap-3 border-b border-separator px-4 py-3">
                  <p className="font-display text-title-3 text-label">Facturas</p>
                  <Button size="sm" variant="secondary">
                    Nueva factura
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-end">Total</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FILAS.map(([code, client, total, status, color]) => (
                      <TableRow key={code}>
                        <TableCell>{code}</TableCell>
                        <TableCell>{client}</TableCell>
                        <TableCell className="text-end tabular-nums">{total}</TableCell>
                        <TableCell>
                          <Badge color={color}>{status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </WindowFrame>
              <div className="flex items-center gap-3">
                <span className="text-callout text-label-secondary">Mirala en otro tema</span>
                <ThemeSwitcherLazy />
              </div>
            </div>
          </Reveal>
        </div>
      </SectionBackdrop>
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-20 px-4 pb-20 md:gap-24 md:px-6 md:pb-24">
        <Reveal>
          <section className="mx-auto flex w-full max-w-3xl scroll-mt-20 flex-col gap-10" id="razones">
            <SectionHeader subtitle="Lo que cambia respecto de copiar componentes a cada app." title="Por qué existe" />
            <RuledList>
              {RAZONES.map((razon) => (
                <RuledListItem key={razon.title} title={razon.title}>
                  {razon.body}
                </RuledListItem>
              ))}
            </RuledList>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto flex w-full max-w-3xl scroll-mt-20 flex-col gap-10" id="destacados">
            <SectionHeader subtitle="Con página detallada: props, teclado y cuándo usarlos." title="Los que más se usan" />
            <DefinitionList>
              {destacados.map((component) => (
                <DefinitionItem
                  key={component.slug}
                  term={
                    <Link className="rounded-sm text-headline text-label outline-none hover:underline focus-visible:focus-ring" href={`/docs/components/${component.slug}`}>
                      {component.title}
                    </Link>
                  }
                >
                  <Inline text={component.description} />
                </DefinitionItem>
              ))}
            </DefinitionList>
            <Link className={buttonVariants({ variant: "ghost" }) + " group self-center"} href="/docs">
              Ver los {site.components.length}
              <ArrowRightIcon aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </section>
        </Reveal>

        <Reveal>
          <section className="mx-auto flex w-full max-w-3xl scroll-mt-20 flex-col gap-10" id="agentes">
            <SectionHeader subtitle="Todo el sitio está en texto plano; cada página responde en markdown con .md." title="Para un agente" />
            <DefinitionList>
              {[
                { href: "/llms.txt", what: "El índice completo, una línea por página." },
                { href: "/llms-full.txt", what: "Todo el sitio en un solo archivo." },
                { href: "/docs/components/button.md", what: "Cualquier página como markdown." },
                { href: "/r/registry.json", what: "El registry con formato shadcn." },
              ].map((item) => (
                <DefinitionItem key={item.href} term={<Link className="rounded-sm text-mono-body text-label outline-none hover:underline focus-visible:focus-ring" href={item.href}>{item.href}</Link>}>
                  {item.what}
                </DefinitionItem>
              ))}
            </DefinitionList>
            <div className="mx-auto w-full max-w-xl">
              <CodeBlock code={`pnpm dlx shadcn@latest add ${site.site}/r/button.json`} label="Copiar el comando del registry" />
            </div>
          </section>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  )
}
