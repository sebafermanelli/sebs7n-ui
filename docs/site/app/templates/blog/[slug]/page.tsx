import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "sebs7n-ui/breadcrumb"
import { Separator } from "sebs7n-ui/separator"
import { TextLink } from "sebs7n-ui/text-link"

import { ArticleBody } from "../_components/article-body"
import { CopyLink } from "../_components/copy-link"
import { PageShell } from "../_components/page-shell"
import { PostMeta } from "../_components/post-meta"
import { TableOfContents } from "../_components/table-of-contents"
import { BLOG, findPost, POSTS } from "../_data/posts"
import { BLOG_PATH, postPath } from "../_lib/routes"

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = findPost((await params).slug)
  return post ? { title: `${post.title} · ${BLOG.name}`, description: post.excerpt } : {}
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = findPost((await params).slug)
  if (!post) notFound()

  const toc = post.body.flatMap((block) => (block.type === "h2" ? [{ id: block.id, text: block.text }] : []))
  const related = POSTS.filter((other) => other.slug !== post.slug && other.tags.some((tag) => post.tags.includes(tag))).slice(0, 2)

  return (
    <PageShell>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={BLOG_PATH} />}>Artículos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{post.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <article className="flex min-w-0 flex-col gap-8">
          <header className="flex max-w-3xl flex-col gap-4">
            <p className="text-footnote text-label-secondary">
              <span className="sr-only">Etiquetas: </span>
              {post.tags.join(" · ")}
            </p>
            <h1 className="text-large-title text-label">{post.title}</h1>
            <p className="text-body-large text-label-secondary">{post.excerpt}</p>
            <PostMeta post={post} withAuthor />
          </header>
          <Separator />
          <ArticleBody blocks={post.body} />
          <div className="-ms-3">
            <CopyLink path={postPath(post.slug)} />
          </div>
        </article>
        <aside>
          <TableOfContents items={toc} />
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="relacionados" className="flex flex-col gap-4 border-t border-separator pt-10">
          <h2 className="text-title-3 text-label" id="relacionados">
            Para seguir leyendo
          </h2>
          <ul className="flex flex-col gap-3">
            {related.map((other) => (
              <li key={other.slug}>
                <TextLink render={<Link href={postPath(other.slug)} />} trailing="chevron" variant="inline">
                  {other.title}
                </TextLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  )
}
