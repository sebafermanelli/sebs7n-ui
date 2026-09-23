import Link from "next/link"
import { Badge } from "sebs7n-ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "sebs7n-ui/card"
import { buttonVariants } from "sebs7n-ui/variants/button"

import site from "@/.generated/site.json"
import { CodeBlock } from "./_components/code-block"
import { Inline } from "./_components/inline"
import { SiteHeader } from "./_components/site-header"

const RAZONES = [
  {
    title: "Una dependencia",
    body: "No se copian archivos al repo de la app. Se instala, se importa y se actualiza con una versión.",
  },
  {
    title: "Tailwind v4, sin config",
    body: "Los tokens son variables CSS y utilidades de @theme. No hay tailwind.config.js en ninguna app.",
  },
  {
    title: "Tres variables de marca",
    body: "Lo único que cambia entre productos. De ahí sale la escala brand-100…1000 y su contraste.",
  },
  {
    title: "Accesible por contrato",
    body: "Foco visible siempre, Escape que devuelve el foco, y el contraste AA verificado por tests, no a ojo.",
  },
  {
    title: "Server Components",
    body: 'Las variantes y los componentes sin estado no llevan "use client": el import por subpath baja 21 % el JS.',
  },
  {
    title: "Legible para un agente",
    body: "Cada página también se sirve como .md, con llms.txt en la raíz y un registry con formato shadcn.",
  },
]

const INSTALL = `pnpm add sebs7n-ui @base-ui/react next-themes sonner geist`

export default function Home() {
  const destacados = site.components.filter((component) => component.detallado).slice(0, 6)
  return (
    <>
      <SiteHeader version={site.version} />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-20 px-4 py-16 md:px-6 md:py-24">
        <section className="flex flex-col items-start gap-6">
          <Badge color="brand">v{site.version}</Badge>
          <h1 className="text-heading-48 text-gray-1000 md:text-heading-64">
            {/* Un solo color para todo el título. Dos grises cercanos no leen
                como jerarquía: leen como media frase apagada. */}
            El design system de una sola dependencia.
          </h1>
          <p className="max-w-2xl text-copy-18 text-gray-900">
            Geist —el lenguaje visual de Vercel— sobre las primitivas de shadcn/ui <code>base-nova</code> (Base UI).{" "}
            {site.components.length} componentes accesibles, tokens de color, tipografía, radios y sombras, y tres
            variables para el color de marca.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link className={buttonVariants({ variant: "accent", size: "lg", shape: "pill" })} href="/docs/instalacion">
              Empezar
            </Link>
            <Link
              className={buttonVariants({ variant: "outline", size: "lg", shape: "pill" })}
              href="/docs/components/button"
            >
              Ver los componentes
            </Link>
          </div>
          <div className="w-full max-w-xl pt-2">
            <CodeBlock code={INSTALL} label="Copiar el comando de instalación" />
          </div>
        </section>

        <section aria-labelledby="razones" className="flex flex-col gap-6">
          <h2 className="text-heading-32 text-gray-1000" id="razones">
            Por qué existe
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RAZONES.map((razon) => (
              <Card key={razon.title} size="sm">
                <CardHeader>
                  <CardTitle>{razon.title}</CardTitle>
                  <CardDescription>{razon.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="destacados" className="flex flex-col gap-6">
          <h2 className="text-heading-32 text-gray-1000" id="destacados">
            Los que más se usan
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((component) => (
              <Link className="block" href={`/docs/components/${component.slug}`} key={component.slug}>
                <Card interactive size="sm">
                  <CardHeader>
                    <CardTitle>{component.title}</CardTitle>
                    <CardDescription>
                      <Inline text={component.description} />
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <Link className={buttonVariants({ variant: "ghost" }) + " self-start"} href="/docs">
            Ver los {site.components.length} →
          </Link>
        </section>

        <section aria-labelledby="agentes" className="flex flex-col gap-6">
          <h2 className="text-heading-32 text-gray-1000" id="agentes">
            Para un agente
          </h2>
          <p className="max-w-2xl text-copy-16 text-gray-900">
            Todo el sitio está disponible en texto plano. Cada página responde en markdown si le agregás{" "}
            <code>.md</code> a la URL.
          </p>
          <Card>
            <CardContent className="flex flex-col gap-3">
              {[
                { href: "/llms.txt", what: "El índice completo, con una línea por página." },
                { href: "/llms-full.txt", what: "Todo el sitio concatenado, en un solo archivo." },
                { href: "/docs/components/button.md", what: "Cualquier página como markdown." },
                { href: "/r/registry.json", what: "El registry con formato shadcn." },
              ].map((item) => (
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4" key={item.href}>
                  <a
                    className="shrink-0 rounded-sm text-copy-14-mono text-brand-900 underline underline-offset-4 outline-none hover:text-brand-1000 focus-visible:focus-ring"
                    href={item.href}
                  >
                    {item.href}
                  </a>
                  <span className="text-copy-14 text-gray-900">{item.what}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="max-w-xl">
            <CodeBlock
              code={`pnpm dlx shadcn@latest add ${site.site}/r/button.json`}
              label="Copiar el comando del registry"
            />
          </div>
        </section>

        <footer className="border-t border-gray-400 pt-8 text-copy-14 text-gray-900">
          MIT ·{" "}
          <a
            className="rounded-sm underline underline-offset-4 outline-none hover:text-gray-1000 focus-visible:focus-ring"
            href="https://github.com/sebafermanelli/sebs7n-ui"
            rel="noreferrer"
            target="_blank"
          >
            sebafermanelli/sebs7n-ui
          </a>
        </footer>
      </div>
    </>
  )
}
