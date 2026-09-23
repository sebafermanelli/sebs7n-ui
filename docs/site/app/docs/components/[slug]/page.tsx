import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "sebs7n-ui/badge"

import site from "@/.generated/site.json"
import { CodeBlock } from "../../../_components/code-block"
import { Example } from "../../../_components/example"
import { Inline } from "../../../_components/inline"
import { MdLink } from "../../../_components/md-link"
import { PageNav } from "../../../_components/page-nav"
import { PropsTable } from "../../../_components/props-table"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return site.components.map((component) => ({ slug: component.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const component = site.components.find((entry) => entry.slug === slug)
  if (!component) return {}
  return { title: component.title, description: component.description }
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-t border-gray-400 pt-8">
      <h2 className="scroll-mt-24 text-heading-24 text-gray-1000" id={id}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default async function ComponentPage({ params }: Params) {
  const { slug } = await params
  const component = site.components.find((entry) => entry.slug === slug)
  if (!component) notFound()

  const grupo = site.groups.find((entry) => entry.id === component.group)
  const indice = [
    { text: "Ejemplos", id: "ejemplos" },
    { text: "Props", id: "props" },
    component.keyboard.length ? { text: "Teclado", id: "teclado" } : null,
    component.a11y.length ? { text: "Accesibilidad", id: "accesibilidad" } : null,
    component.usage.length ? { text: "Reglas de uso", id: "reglas" } : null,
  ].filter((entry) => entry !== null)

  return (
    <div className="flex gap-10">
      <article className="flex min-w-0 flex-1 flex-col gap-10 pb-24">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-label-12 text-gray-900">
            <span>{grupo?.title}</span>
            {!component.useClient && <Badge size="sm">Server Component</Badge>}
          </div>
          <h1 className="text-heading-40 text-gray-1000">{component.title}</h1>
          <p className="text-copy-18 text-gray-900">
            <Inline text={component.description} />
          </p>
          <div className="flex flex-wrap gap-2">
            <MdLink href={`/docs/components/${component.slug}`} />
            <a
              className="rounded-md border border-gray-alpha-400 bg-background-100 px-3 py-1.5 text-button-14 text-gray-1000 outline-none transition-control hover:bg-gray-alpha-200 focus-visible:focus-ring"
              href={`https://github.com/sebafermanelli/sebs7n-ui/blob/main/src/components/${component.slug}.tsx`}
              rel="noreferrer"
              target="_blank"
            >
              Ver el código
            </a>
          </div>
          <div className="pt-2">
            <CodeBlock code={component.importLine} label="Copiar el import" />
          </div>
        </header>

        <Section id="ejemplos" title="Ejemplos">
          <div className="flex flex-col gap-10">
            {component.examples.map((example) => (
              <Example example={example} key={example.id} />
            ))}
          </div>
        </Section>

        <Section id="props" title="Props">
          <p className="text-copy-14 text-gray-900">
            Generadas del TypeScript del paquete. Solo las props propias: las heredadas del primitivo de Base UI o del
            elemento HTML están en la línea «hereda de».
          </p>
          <PropsTable exports={component.exports} />
        </Section>

        {component.keyboard.length > 0 && (
          <Section id="teclado" title="Teclado">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
              {component.keyboard.map(([tecla, que]) => (
                <div className="contents" key={tecla + que}>
                  <dt className="text-copy-13-mono text-gray-1000">{tecla}</dt>
                  <dd className="text-copy-14 text-gray-900">
                    <Inline text={que} />
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {component.a11y.length > 0 && (
          <Section id="accesibilidad" title="Accesibilidad">
            <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-gray-700">
              {component.a11y.map((linea) => (
                <li className="text-copy-16 text-gray-1000" key={linea}>
                  <Inline text={linea} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {component.usage.length > 0 && (
          <Section id="reglas" title="Reglas de uso">
            <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-gray-700">
              {component.usage.map((linea) => (
                <li className="text-copy-16 text-gray-1000" key={linea}>
                  <Inline text={linea} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {component.related.length > 0 && (
          <Section id="relacionados" title="Relacionados">
            <div className="flex flex-wrap gap-2">
              {component.related.map((otro) => {
                const destino = site.components.find((entry) => entry.slug === otro)
                return (
                  <Link
                    className="rounded-md border border-gray-400 px-3 py-1.5 text-copy-14 text-gray-1000 outline-none transition-control hover:bg-gray-100 focus-visible:focus-ring"
                    href={`/docs/components/${otro}`}
                    key={otro}
                  >
                    {destino?.title ?? otro}
                  </Link>
                )
              })}
            </div>
          </Section>
        )}
      </article>
      <PageNav items={indice} />
    </div>
  )
}
