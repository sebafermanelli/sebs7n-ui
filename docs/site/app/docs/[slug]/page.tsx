import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ViewTransition } from "react"
import { PageHeader, PageHeaderActions, PageHeaderDescription, PageHeaderTitle } from "sebs7n-ui/page-header"

import site from "@/.generated/site.json"
import { Inline } from "../../_components/inline"
import { MdLink } from "../../_components/md-link"
import { PageNav } from "../../_components/page-nav"
import { PageExtras } from "../../_components/page-extras"
import { headings, Prose } from "../../_components/prose"

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return site.pages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const page = site.pages.find((entry) => entry.slug === slug)
  if (!page) return {}
  return { title: page.title, description: page.description }
}

export default async function SystemPage({ params }: Params) {
  const { slug } = await params
  const page = site.pages.find((entry) => entry.slug === slug)
  if (!page) notFound()

  return (
    // `default="none"`: solo anima al entrar y al salir por navegación, no en cada
    // Suspense que se resuelve adentro (las demos cargan por chunk).
    <ViewTransition default="none" enter="page-in" exit="page-out">
      <div className="flex gap-10">
        <article className="min-w-0 flex-1 pb-24">
        <PageHeader className="pb-8">
          <PageHeaderTitle>{page.title}</PageHeaderTitle>
          <PageHeaderDescription>
            <Inline text={page.description} />
          </PageHeaderDescription>
          <PageHeaderActions>
            <MdLink href={`/docs/${page.slug}`} />
          </PageHeaderActions>
        </PageHeader>
        <Prose markdown={page.body} />
        <PageExtras slug={page.slug} />
      </article>
      <PageNav items={headings(page.body)} />
    </div>
    </ViewTransition>
  )
}
