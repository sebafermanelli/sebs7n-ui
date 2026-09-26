"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"

/**
 * Un bloque de código con su botón de copiar.
 *
 * El botón vive **al lado** del `<pre>`, no encima: antes era `absolute` sobre
 * un `<pre>` con scroll horizontal, y un comando largo pasaba por debajo —el
 * fondo translúcido del hover dejaba ver el texto a través del botón—. Además
 * el `top-2` fijo no lo centraba con la única línea de texto. Con flex, el
 * `<pre>` es el que scrollea, el botón queda centrado a su altura y el texto
 * nunca lo alcanza.
 */
export function CodeBlock({ code, label = "Copiar el código" }: { code: string; label?: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-400 bg-background-200 pr-2">
      <pre className="min-w-0 flex-1 overflow-x-auto p-4">
        <code className="text-copy-13-mono text-gray-1000">{code}</code>
      </pre>
      <Button
        aria-label={copiado ? "Copiado" : label}
        className="shrink-0"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
            setCopiado(true)
            setTimeout(() => setCopiado(false), 1600)
          } catch {
            setCopiado(false)
          }
        }}
        size="icon-sm"
        variant="outline"
      >
        {copiado ? <CheckIcon className="text-green-900" /> : <CopyIcon />}
      </Button>
    </div>
  )
}
