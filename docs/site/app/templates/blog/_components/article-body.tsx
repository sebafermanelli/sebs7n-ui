import type { Block } from "../_data/posts"

// El cuerpo de un artículo, con los roles tipográficos del paquete: título 2 para las secciones,
// `body` con interlínea de lectura (28 px) para el texto y una medida de ~68 caracteres.
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex max-w-[68ch] flex-col gap-5">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 className="mt-6 scroll-mt-24 text-title-1 text-label" id={block.id} key={index}>
                {block.text}
              </h2>
            )
          case "p":
            return (
              <p className="text-body leading-7 text-label" key={index}>
                {block.text}
              </p>
            )
          case "quote":
            return (
              <figure className="my-2 border-s-2 border-brand-900 ps-5" key={index}>
                <blockquote className="text-title-2 text-label">{block.text}</blockquote>
                {block.cite && <figcaption className="mt-2 text-callout text-label-secondary">— {block.cite}</figcaption>}
              </figure>
            )
          case "list":
            return (
              <ul className="flex list-disc flex-col gap-2 ps-6 text-body leading-7 text-label marker:text-label-secondary" key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )
          case "code":
            return (
              <pre className="overflow-x-auto rounded-control bg-fill-1 p-4 font-mono text-callout text-label" key={index} tabIndex={0}>
                <code>{block.code}</code>
              </pre>
            )
        }
      })}
    </div>
  )
}
