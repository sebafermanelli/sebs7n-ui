// Los links del sitio a los formularios de issue de GitHub (.github/ISSUE_TEMPLATE/).
//
// Los formularios aceptan precarga por query: cada parámetro con el `id` de un campo llena ese
// campo. Así quien reporta desde la página de un componente no tiene que escribir cuál es ni
// buscar la versión. Los ids viven en los YAML; `test/issue-forms.test.ts` los cruza con estos.

export const REPO = "https://github.com/sebafermanelli/sebs7n-ui"

export type IssueKind = "bug" | "enhancement" | "component-request"

export function issueUrl(kind: IssueKind, params: { component?: string; version?: string } = {}): string {
  const query = new URLSearchParams({ template: `${kind}.yml` })
  for (const [key, value] of Object.entries(params)) {
    // Un parámetro vacío pisa el placeholder del campo con nada: mejor no mandarlo.
    if (value) query.set(key, value)
  }
  return `${REPO}/issues/new?${query}`
}

/** El pie de cada página de componente: la mejora primero, que es lo que más se pide. */
export function issueLinks(component: string, version: string): { kind: IssueKind; href: string }[] {
  return [
    { kind: "enhancement", href: issueUrl("enhancement", { component }) },
    { kind: "bug", href: issueUrl("bug", { component, version }) },
  ]
}
