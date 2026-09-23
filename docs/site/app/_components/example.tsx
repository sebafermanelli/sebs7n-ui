import { DEMOS } from "../_demos/registry"
import { CodeBlock } from "./code-block"

type Ejemplo = { id: string; title: string; description: string; code: string }

export function Example({ example }: { example: Ejemplo }) {
  const Demo = DEMOS[example.id]
  const anchor = example.id.split("--")[1].toLowerCase()
  return (
    <section aria-labelledby={`ej-${anchor}`} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h3 className="scroll-mt-24 text-heading-20 text-gray-1000" id={`ej-${anchor}`}>
          {example.title}
        </h3>
        {example.description && <p className="text-copy-14 text-gray-900">{example.description}</p>}
      </div>
      <div className="flex min-h-32 items-center justify-center rounded-xl border border-gray-400 bg-background-100 p-6">
        {Demo ? <Demo /> : <p className="text-copy-14 text-red-900">Falta la demo {example.id}.</p>}
      </div>
      <CodeBlock code={example.code} label={`Copiar el código de ${example.title}`} />
    </section>
  )
}
