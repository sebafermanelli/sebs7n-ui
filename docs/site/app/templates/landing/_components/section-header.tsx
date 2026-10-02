// El encabezado de cada sección: un `<h2>` y una línea. Mismo tamaño y separación en todas.
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h2 className="text-title-1 text-balance text-label">{title}</h2>
      {subtitle && <p className="max-w-2xl text-body text-pretty text-label-secondary">{subtitle}</p>}
    </div>
  )
}
