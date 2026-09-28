// La búsqueda del sitio, separada del índice: el índice ya no viaja en el bundle de cada página
// (se pide como /search-index.json al abrir el buscador), así que esta función lo recibe.

export type SearchEntry = { title: string; href: string; group: string; description: string; keywords: string }

export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function search(index: SearchEntry[], query: string): SearchEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  return index
    .map((entry) => {
      const text = normalize(`${entry.title} ${entry.group} ${entry.description} ${entry.keywords}`)
      if (!terms.every((term) => text.includes(term))) return null
      // El título pesa más que el cuerpo, y empezar con el término más que contenerlo.
      const title = normalize(entry.title)
      const score = terms.reduce((total, term) => total + (title.startsWith(term) ? 100 : title.includes(term) ? 40 : 1), 0)
      return { entry, score }
    })
    .filter((result) => result !== null)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, 12)
    .map((result) => result.entry)
}

/**
 * Agrupa para `CommandGroup` sin perder el ranking: los grupos salen en el orden de su mejor
 * resultado, y adentro de cada uno los resultados siguen el orden de `search()`. Así el primero de
 * la lista sigue siendo el mejor, que es el que queda elegido y abre Enter.
 */
export function groupResults(results: SearchEntry[]): [group: string, entries: SearchEntry[]][] {
  const groups = new Map<string, SearchEntry[]>()
  for (const result of results) {
    const group = groups.get(result.group)
    if (group) group.push(result)
    else groups.set(result.group, [result])
  }
  return [...groups]
}

/** Las descripciones traen el markdown mínimo de `Inline`; en una fila de una línea van planas. */
export function plainText(text: string) {
  return text.replace(/`([^`]+)`|\*\*([^*]+)\*\*/g, (_, code: string | undefined, bold: string | undefined) => code ?? bold ?? "")
}
