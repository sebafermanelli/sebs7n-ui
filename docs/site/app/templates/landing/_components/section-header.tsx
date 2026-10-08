import { SectionHeader as Header } from "sebs7n-ui/section-header"

// El encabezado de cada sección: un `<h2>` con la fuente de titulares y una línea. Mismo tamaño y separación en todas.
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <Header description={subtitle} title={title} />
}
