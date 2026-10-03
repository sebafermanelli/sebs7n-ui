import type { Metadata } from "next"

import { Newsletter } from "./_components/newsletter"
import { PageShell } from "./_components/page-shell"
import { PostsBrowser } from "./_components/posts-browser"
import { BLOG } from "./_data/posts"

export const metadata: Metadata = {
  title: BLOG.name,
  description: BLOG.tagline,
}

// Lectura primero: una columna de 720 px sobre la superficie lisa, un h1 y la lista. El único JS propio es el
// filtro; el formulario de suscripción llega diferido.
export default function BlogPage() {
  return (
    <PageShell narrow>
      <header className="flex flex-col gap-3">
        <h1 className="text-large-title text-label">{BLOG.name}</h1>
        <p className="text-body-large text-label-secondary">{BLOG.tagline}</p>
      </header>
      <PostsBrowser />
      <Newsletter />
    </PageShell>
  )
}
