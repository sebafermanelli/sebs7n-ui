"use client"

import { Fragment, useMemo, useState } from "react"
import { EmptyState } from "sebs7n-ui/empty-state"
import { FilterBar } from "sebs7n-ui/filter-bar"
import { SearchField } from "sebs7n-ui/search-field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "sebs7n-ui/select"
import { Separator } from "sebs7n-ui/separator"

import { POSTS, TAGS } from "../_data/posts"
import { PostRow } from "./post-row"

const normalize = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

const ALL = "all"
const TAG_ITEMS: Record<string, string> = { [ALL]: "Todas las etiquetas", ...Object.fromEntries(TAGS.map((tag) => [tag, tag])) }

// El único JS de la portada: buscar y filtrar por etiqueta, en una fila (en el teléfono, apilado a ancho entero).
// Sin filtros, el primer artículo va algo más grande.
export function PostsBrowser() {
  const [tag, setTag] = useState(ALL)
  const [query, setQuery] = useState("")
  const filtering = tag !== ALL || query.trim() !== ""

  const shown = useMemo(() => {
    const needle = normalize(query.trim())
    return POSTS.filter((post) => (tag === ALL || post.tags.includes(tag)) && normalize(`${post.title} ${post.excerpt}`).includes(needle))
  }, [tag, query])

  return (
    <section aria-labelledby="articulos-titulo" className="flex scroll-mt-20 flex-col gap-8" id="articulos">
      <h2 className="sr-only" id="articulos-titulo">
        Artículos
      </h2>
      <FilterBar
        aria-label="Buscar y filtrar artículos"
        filters={
          <Select items={TAG_ITEMS} onValueChange={(value) => value && setTag(value)} value={tag}>
            <SelectTrigger aria-label="Etiqueta" className="sm:w-52" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TAG_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        role="search"
        search={<SearchField aria-label="Buscar artículos" size="sm" onValueChange={setQuery} placeholder="Buscar" value={query} />}
      />
      {shown.length > 0 ? (
        <div className="flex flex-col gap-8">
          {shown.map((post, index) => (
            <Fragment key={post.slug}>
              {index > 0 && <Separator />}
              <PostRow featured={!filtering && index === 0} post={post} />
            </Fragment>
          ))}
        </div>
      ) : (
        <EmptyState description="Probá con otra etiqueta o con otras palabras." title="No hay artículos que coincidan" />
      )}
      <p aria-live="polite" className="text-callout text-label-secondary">
        {shown.length} de {POSTS.length} artículos
      </p>
    </section>
  )
}
