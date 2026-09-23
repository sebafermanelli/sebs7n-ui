import type { ReactNode } from "react"

/**
 * Markdown mínimo para una línea suelta: `código` y **negrita**.
 * Las descripciones de meta.mjs lo usan, y el mismo texto viaja al .md sin tocar.
 */
export function Inline({ text }: { text: string }) {
  const nodes: ReactNode[] = []
  const regex = /`([^`]+)`|\*\*([^*]+)\*\*/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    if (match[1] !== undefined) {
      nodes.push(
        <code className="rounded-sm bg-gray-100 px-1 py-0.5 text-copy-13-mono text-gray-1000" key={match.index}>
          {match[1]}
        </code>
      )
    } else {
      nodes.push(
        <strong className="font-medium text-gray-1000" key={match.index}>
          {match[2]}
        </strong>
      )
    }
    last = regex.lastIndex
  }
  if (last < text.length) nodes.push(text.slice(last))
  return <>{nodes}</>
}
