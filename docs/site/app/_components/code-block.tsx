import { CopyButton } from "sebs7n-ui/copy-button"

/**
 * Un bloque de código con su botón de copiar: el `CopyButton` del paquete (✓, «Copiado» y aviso al
 * lector de pantalla incluidos) al lado del `<pre>`, no encima: el `<pre>` es el que scrollea y el
 * texto nunca pasa por debajo del botón.
 */
export function CodeBlock({ code, label = "Copiar el código" }: { code: string; label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-surface border border-separator bg-fill-1 pr-2">
      {/* `tabIndex`: un bloque que scrollea tiene que poder recorrerse con el teclado (axe: scrollable-region-focusable). */}
      <pre className="min-w-0 flex-1 overflow-x-auto p-4 focus-visible:focus-ring" tabIndex={0}>
        <code className="text-mono-body text-label">{code}</code>
      </pre>
      <CopyButton aria-label={label} className="shrink-0" value={code} />
    </div>
  )
}
