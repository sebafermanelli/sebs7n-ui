import { authorOf, type Post } from "../_data/posts"
import { formatDateShort, readingTime } from "../_lib/format"

// Una línea de texto gris: «21 sep 2026 · 5 min». En el artículo suma el autor y «de lectura»; entra en 390 px.
export function PostMeta({ post, withAuthor = false }: { post: Post; withAuthor?: boolean }) {
  const minutes = readingTime(post.body)
  return (
    <p className="text-callout text-label-secondary">
      {withAuthor && (
        <>
          <span className="text-label">{authorOf(post).name}</span> ·{" "}
        </>
      )}
      <time dateTime={post.date}>{formatDateShort(post.date)}</time> · {withAuthor ? `${minutes} min de lectura` : `${minutes} min`}
    </p>
  )
}
