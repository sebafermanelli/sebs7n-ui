import { ArrowRightIcon, BotIcon, PackageIcon, PaletteIcon, ServerIcon, ShieldCheckIcon, SwatchBookIcon, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import { Card, CardContent, CardGrid } from "sebs7n-ui/card"
import { TextLink } from "sebs7n-ui/text-link"
import { cardVariants } from "sebs7n-ui/variants/card"
import { buttonVariants } from "sebs7n-ui/variants/button"

import site from "@/.generated/site.json"
import { CodeBlock } from "./_components/code-block"
import { Inline } from "./_components/inline"
import { SectionHeader } from "./_components/section-header"
import { SiteFooter } from "./_components/site-footer"
import { SiteHeader } from "./_components/site-header"
import { START_HREF } from "./_components/site-nav-data"

const RAZONES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: PackageIcon,
    title: "Una dependencia",
    body: "No se copian archivos al repo de la app. Se instala, se importa y se actualiza con una versión.",
  },
  {
    icon: SwatchBookIcon,
    title: "Tailwind v4, sin config",
    body: "Los tokens son variables CSS y utilidades de @theme. No hay tailwind.config.js en ninguna app.",
  },
  {
    icon: PaletteIcon,
    title: "Cuatro variables de marca",
    body: "Lo único que cambia entre productos: el acento en claro y en oscuro, y el texto que va encima de cada uno.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Accesible por contrato",
    body: "Foco visible siempre, Escape que devuelve el foco, y el contraste AA verificado por tests, no a ojo.",
  },
  {
    icon: ServerIcon,
    title: "Server Components",
    body: 'Las variantes y los componentes sin estado no llevan "use client": el import por subpath baja 21 % el JS.',
  },
  {
    icon: BotIcon,
    title: "Legible para un agente",
    body: "Cada página también se sirve como .md, con llms.txt en la raíz y un registry con formato shadcn.",
  },
]

const INSTALL = `pnpm add sebs7n-ui @base-ui/react next-themes sonner`

export default function Home() {
  const destacados = site.components.filter((component) => component.detallado).slice(0, 6)
  return (
    // Sobre el wallpaper (`bg-ambient` + `data-ambient`), como la landing de referencia: la barra y las cards pasan
    // solas al material translúcido. Va en el HTML del servidor y no lo prende JavaScript, así la página no
    // arranca lisa y cambia al hidratar. Server Components: el menú, el tema y la hoja del teléfono llegan diferidos.
    <div className="min-h-dvh bg-ambient" data-ambient="" id="top">
      <SiteHeader version={site.version} />
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-20 px-4 pb-20 md:gap-24 md:px-6 md:pb-24">
        <section className="flex flex-col items-center gap-6 pt-12 text-center md:pt-20">
          <Badge color="brand">v{site.version}</Badge>
          {/* Un solo color para todo el título. Dos grises cercanos no leen como jerarquía. */}
          <h1 className="max-w-3xl text-large-title text-balance text-label">El design system de una sola dependencia.</h1>
          <p className="max-w-2xl text-body text-pretty text-label-secondary">
            El lenguaje visual de iCloud web —superficies opacas en las apps y translúcidas sobre el wallpaper, Inter, radios chicos y barras
            fijas— sobre las primitivas de shadcn/ui <code>base-nova</code> (Base UI). {site.components.length} componentes accesibles, tokens de
            superficies, tipografía, radios y sombras, y cuatro variables para el color de marca.
          </p>
          <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Link className={buttonVariants({ size: "lg" })} href={START_HREF}>
              Empezar
            </Link>
            <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href="/docs/components/button">
              Ver los componentes
            </Link>
          </div>
          <div className="w-full max-w-xl pt-2 text-left">
            <CodeBlock code={INSTALL} label="Copiar el comando de instalación" />
          </div>
        </section>

        <section className="flex scroll-mt-20 flex-col gap-10" id="razones">
          <SectionHeader subtitle="Lo que cambia respecto de copiar componentes a cada app." title="Por qué existe" />
          <CardGrid>
            {RAZONES.map(({ icon: Icon, ...razon }) => (
              // Solo cuerpo, como las de la landing: sin nada debajo, una cabecera dejaría la franja del cuerpo vacía.
              <Card key={razon.title}>
                <CardContent className="flex gap-4">
                  <span aria-hidden="true" className="text-brand-900 [&_svg]:size-7">
                    <Icon />
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-headline text-label">{razon.title}</h3>
                    <p className="text-callout text-label-secondary">{razon.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardGrid>
        </section>

        <section className="flex scroll-mt-20 flex-col gap-10" id="destacados">
          <SectionHeader subtitle="Los componentes con página detallada: props, teclado y cuándo usarlos." title="Los que más se usan" />
          {/* La card es el link (`data-slot="card"`): entra en las filas compartidas de CardGrid y las
              alturas quedan parejas. */}
          <CardGrid>
            {destacados.map((component) => (
              <Link
                className={cardVariants({ interactive: true, size: "sm" })}
                data-size="sm"
                data-slot="card"
                href={`/docs/components/${component.slug}`}
                key={component.slug}
              >
                {/* Solo cuerpo, como las cards de «Por qué existe»: una cabecera sola, con descripciones largas y
                    trozos de código en línea, queda con una altura de fila menor a la de su texto y se recorta. */}
                <CardContent className="flex flex-col gap-1">
                  <h3 className="text-headline text-label">{component.title}</h3>
                  <p className="text-callout text-label-secondary">
                    <Inline text={component.description} />
                  </p>
                </CardContent>
              </Link>
            ))}
          </CardGrid>
          <Link className={buttonVariants({ variant: "ghost" }) + " group self-center"} href="/docs">
            Ver los {site.components.length}
            <ArrowRightIcon aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </section>

        <section className="flex scroll-mt-20 flex-col gap-10" id="agentes">
          <SectionHeader
            subtitle="Todo el sitio está disponible en texto plano. Cada página responde en markdown si le agregás .md a la URL."
            title="Para un agente"
          />
          <Card>
            <CardContent className="flex flex-col gap-3">
              {[
                { href: "/llms.txt", what: "El índice completo, con una línea por página." },
                { href: "/llms-full.txt", what: "Todo el sitio concatenado, en un solo archivo." },
                { href: "/docs/components/button.md", what: "Cualquier página como markdown." },
                { href: "/r/registry.json", what: "El registry con formato shadcn." }
              ].map((item) => (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4" key={item.href}>
                  <TextLink className="shrink-0 text-mono-body" href={item.href}>
                    {item.href}
                  </TextLink>
                  <span className="text-callout text-label-secondary">{item.what}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="mx-auto w-full max-w-xl">
            <CodeBlock code={`pnpm dlx shadcn@latest add ${site.site}/r/button.json`} label="Copiar el comando del registry" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
