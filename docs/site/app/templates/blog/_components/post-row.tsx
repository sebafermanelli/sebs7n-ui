import Link from "next/link"

import type { Post } from "../_data/posts"
import { postPath } from "../_lib/routes"
import { PostMeta } from "./post-meta"

// Un artículo en la lista: texto sobre la superficie, sin tarjeta. Etiqueta chica arriba, título, extracto de
// dos líneas y una línea de meta. El título es el link y su `::after` estira el área de toque a toda la fila.
export function PostRow({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className="group relative flex flex-col gap-2">
      <p className="text-footnote text-label-secondary">
        <span className="sr-only">Etiquetas: </span>
        {post.tags.join(" · ")}
      </p>
      <h3 className={featured ? "text-title-1 text-label" : "text-title-3 text-label"}>
        <Link className="rounded-control outline-none group-hover:underline after:absolute after:-inset-y-4 after:-inset-x-2 focus-visible:focus-ring" href={postPath(post.slug)}>
          {post.title}
        </Link>
      </h3>
      <p className={`line-clamp-2 text-label-secondary ${featured ? "text-body" : "text-callout"}`}>{post.excerpt}</p>
      <PostMeta post={post} />
    </article>
  )
}
