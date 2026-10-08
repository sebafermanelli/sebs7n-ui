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
      <SectionBackdrop className="px-4 pt-12 pb-16 md:px-6 md:pt-20" variant="wash">
        <div className="mx-auto w-full max-w-[1080px]">
          <RevealGroup className="flex flex-col items-center gap-6 text-center [&>*]:max-w-full" step={90}>
            <Badge>v{site.version}</Badge>
            <h1 className="max-w-4xl text-display text-balance text-label">
              Interfaces <span className="emphasis-accent">calmas</span>
              <span className="emphasis-muted">, con una sola dependencia.</span>
            </h1>
            <p className="max-w-2xl text-lead text-pretty text-label-secondary">
              El lenguaje de iCloud, cálido y cuidado: {site.components.length} componentes accesibles, neutros con el tinte de tu marca y
              tipografía con carácter.
            </p>
            <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Link className={buttonVariants({ size: "lg" })} href={START_HREF}>
                Empezar
              </Link>
              <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href="/docs/playground">
                Probarlo en el Playground
              </Link>
            </div>
            <div className="w-full max-w-xl pt-2 text-left">
              <CodeBlock code={INSTALL} label="Copiar el comando de instalación" />
            </div>
          </RevealGroup>
        </div>
      </SectionBackdrop>
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-20 px-4 pt-4 pb-20 md:gap-24 md:px-6 md:pb-24">

        <Reveal>
          <section className="flex scroll-mt-20 flex-col items-center gap-6" id="pantalla">
            <WindowFrame className="w-full max-w-3xl" elevation="resting" title="Facturas">
              <div className="flex items-center justify-between gap-3 border-b border-separator px-4 py-3">
                <p className="font-display text-title-3 text-label">Facturas</p>
                <Button size="sm" variant="secondary">Nueva factura</Button>
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
          </section>
        </Reveal>

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
