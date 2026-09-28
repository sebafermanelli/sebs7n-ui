import { issueLinks } from "../_lib/github"

const TEXT = { enhancement: "Pedí una mejora", bug: "Reportá un bug" } as const

/** Pie de la página de un componente. Server Component: son dos anclas, no hace falta JS. */
export function IssueLinks({ component, version }: { component: string; version: string }) {
  const [enhancement, bug] = issueLinks(component, version)
  return (
    <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-gray-alpha-400 pt-6 text-copy-14 text-gray-900">
      <span>¿Falta algo?</span>
      <a className="rounded-sm text-gray-1000 underline underline-offset-4 outline-none focus-visible:focus-ring" href={enhancement.href} rel="noreferrer" target="_blank">
        {TEXT.enhancement}
      </a>
      <span aria-hidden="true">·</span>
      <a className="rounded-sm text-gray-1000 underline underline-offset-4 outline-none focus-visible:focus-ring" href={bug.href} rel="noreferrer" target="_blank">
        {TEXT.bug}
      </a>
    </footer>
  )
}
