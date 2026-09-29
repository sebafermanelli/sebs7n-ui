import { issueLinks } from "../_lib/github"

const TEXT = { enhancement: "Pedí una mejora", bug: "Reportá un bug" } as const

/** Pie de la página de un componente. Server Component: son dos anclas, no hace falta JS. */
export function IssueLinks({ component, version }: { component: string; version: string }) {
  const [enhancement, bug] = issueLinks(component, version)
  return (
    <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-separator pt-6 text-callout text-label-secondary">
      <span>¿Falta algo?</span>
      <a className="rounded-sm text-label underline underline-offset-4 outline-none focus-visible:focus-ring" href={enhancement.href} rel="noreferrer" target="_blank">
        {TEXT.enhancement}
      </a>
      <span aria-hidden="true">·</span>
      <a className="rounded-sm text-label underline underline-offset-4 outline-none focus-visible:focus-ring" href={bug.href} rel="noreferrer" target="_blank">
        {TEXT.bug}
      </a>
    </footer>
  )
}
