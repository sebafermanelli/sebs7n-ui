import site from "@/.generated/site.json"
import { DocsNav } from "../_components/docs-nav"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] gap-8 px-4 md:px-6">
      <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-gray-400 py-8 pr-4 lg:block">
        <DocsNav nav={site.nav} />
      </aside>
      <main className="min-w-0 flex-1 py-8" id="contenido">
        {children}
      </main>
    </div>
  )
}
