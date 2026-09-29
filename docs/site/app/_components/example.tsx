import { CodeBlock } from "./code-block"
import { DemoSlot } from "./demo-slot"

type Ejemplo = { id: string; title: string; description: string; code: string }

export function Example({ example, eager = false }: { example: Ejemplo; eager?: boolean }) {
  const anchor = example.id.split("--")[1].toLowerCase()
  return (
    <section aria-labelledby={`ej-${anchor}`} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="scroll-mt-24 text-title-3 text-label" id={`ej-${anchor}`}>
          {example.title}
        </h3>
        {example.description && <p className="text-callout text-label-secondary">{example.description}</p>}
      </div>
      <div className="flex min-h-32 items-center justify-center rounded-surface border border-separator bg-surface p-6 shadow-card">
        <DemoSlot eager={eager} id={example.id} />
      </div>
      <CodeBlock code={example.code} label={`Copiar el código de ${example.title}`} />
    </section>
  )
}
