import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, ViewTransition } from "react"
import { Badge } from "sebs7n-ui/badge"
import { Kbd } from "sebs7n-ui/kbd"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"
import { Separator } from "sebs7n-ui/separator"
import { buttonVariants } from "sebs7n-ui/variants/button"

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
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <Separator className="mb-4" />
      <h2 className="scroll-mt-24 text-title-2 text-label" id={id}>
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
    // `default="none"`: solo anima al entrar y al salir por navegación, no en cada
    // Suspense que se resuelve adentro (las demos cargan por chunk).
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex gap-10">
        <article className="flex min-w-0 flex-1 flex-col gap-10 pb-24">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-footnote text-label-secondary">
            <span>{grupo?.title}</span>
            {!component.useClient && <Badge size="sm">Server Component</Badge>}
          </div>
          {/* A 390 de ancho, «NavigationMenu» o «AppShellContent» en 48 no entran en una línea y la
              página scrolleaba de costado: se permite cortar entre las palabras del nombre
              (`<wbr>` antes de cada mayúscula) y, si ni así entra, donde sea. */}
          <PageHeader>
          <PageHeaderTitle>
            {component.title.split(/(?=[A-Z])/).map((part, index) => (
              <Fragment key={index}>
                {index > 0 && <wbr />}
                {part}
              </Fragment>
            ))}
          </PageHeaderTitle>
          <PageHeaderDescription>
            <Inline text={component.description} />
          </PageHeaderDescription>
          <PageHeaderActions>
            <MdLink href={`/docs/components/${component.slug}`} />
            <a
              className={buttonVariants({ variant: "secondary", size: "sm" })}
              href={`https://github.com/sebafermanelli/sebs7n-ui/blob/main/src/components/${component.slug}.tsx`}
              rel="noreferrer"
              target="_blank"
            >
              Ver el código
            </a>
          </PageHeaderActions>
        </PageHeader>
          <CodeBlock code={component.importLine} label="Copiar el import" />
        </div>

        <Section id="ejemplos" title="Ejemplos">
          <div className="flex flex-col gap-10">
            {component.examples.map((example, index) => (
              <Example eager={index === 0} example={example} key={example.id} />
            ))}
          </div>
        </Section>

        <Section id="props" title="Props">
          <p className="text-callout text-label-secondary">
            Generadas del TypeScript del paquete. Las propias del componente, más las heredadas del primitivo que
            tienen algo que explicar —marcadas «heredada de Base UI»—. El resto está en la línea «hereda de».
          </p>
          <PropsTable exports={component.exports} />
        </Section>

        {component.keyboard.length > 0 && (
          <Section id="teclado" title="Teclado">
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
              {component.keyboard.map(([tecla, que]) => (
                <div className="contents" key={tecla + que}>
                  <dt>
                    <Kbd>{tecla}</Kbd>
                  </dt>
                  <dd className="text-callout text-label-secondary">
                    <Inline text={que} />
                  </dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {component.a11y.length > 0 && (
          <Section id="accesibilidad" title="Accesibilidad">
            <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-label-tertiary">
              {component.a11y.map((linea) => (
                <li className="text-body text-label" key={linea}>
                  <Inline text={linea} />
                </li>
              ))}
            </ul>
          </Section>
        )}

        {component.usage.length > 0 && (
          <Section id="reglas" title="Reglas de uso">
            <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-label-tertiary">
              {component.usage.map((linea) => (
                <li className="text-body text-label" key={linea}>
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
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
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
    </ViewTransition>
  )
}
