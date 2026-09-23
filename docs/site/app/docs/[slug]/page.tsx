import type { Metadata } from "next"
import { notFound } from "next/navigation"

import site from "@/.generated/site.json"
import { MdLink } from "../../_components/md-link"
import { PageNav } from "../../_components/page-nav"
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
    <div className="flex gap-10">
      <article className="min-w-0 flex-1 pb-24">
        <header className="flex flex-col gap-3 pb-8">
          <h1 className="text-heading-40 text-gray-1000">{page.title}</h1>
          <p className="text-copy-18 text-gray-900">{page.description}</p>
          <div className="flex gap-2">
            <MdLink href={`/docs/${page.slug}`} />
          </div>
        </header>
        <Prose markdown={page.body} />
      </article>
      <PageNav items={headings(page.body)} />
    </div>
  )
}
