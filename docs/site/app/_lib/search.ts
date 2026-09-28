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
