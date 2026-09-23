"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "sebs7n-ui/button"

export function CodeBlock({ code, label = "Copiar el código" }: { code: string; label?: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <div className="group/code relative">
      <pre className="overflow-x-auto rounded-xl border border-gray-400 bg-background-200 p-4 pr-14">
        <code className="text-copy-13-mono text-gray-1000">{code}</code>
      </pre>
      <Button
        aria-label={copiado ? "Copiado" : label}
        className="absolute top-2 right-2"
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
