// Los datos de la sección «Todos los componentes» del Playground: cada componente del sitio con su
// primera demo, en los grupos y el orden de la navegación. Separado del JSX para que un test pueda
// verificar que no falta ninguno (`test/all-components.test.ts`).

type Site = {
  groups: { id: string; title: string }[]
  components: { slug: string; title: string; group: string; description: string; examples: { id: string }[] }[]
}

export type ComponentGroup = {
  id: string
  title: string
  components: { slug: string; title: string; description: string; href: string; demoId: string | undefined }[]
}

export function allComponents(site: Site): ComponentGroup[] {
  return site.groups.map((group) => ({
    id: group.id,
    title: group.title,
    // El mismo filtro y el mismo orden que arma `nav` en scripts/generate.mjs.
    components: site.components
      .filter((component) => component.group === group.id)
      .map((component) => ({
        slug: component.slug,
        title: component.title,
        description: component.description,
        href: `/docs/components/${component.slug}`,
        demoId: component.examples[0]?.id,
      })),
  }))
}
