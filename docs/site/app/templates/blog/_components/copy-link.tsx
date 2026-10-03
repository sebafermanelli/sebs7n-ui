"use client"

import { useEffect, useState } from "react"
import { CopyButton } from "sebs7n-ui/copy-button"

// Copia la URL completa: el origen solo se conoce en el navegador, así que se arma después de hidratar
// (hasta entonces el botón está apagado, porque `value` vacío lo apaga).
export function CopyLink({ path }: { path: string }) {
  const [url, setUrl] = useState("")
  useEffect(() => {
    setUrl(`${window.location.origin}${path}`)
  }, [path])
  return (
    <CopyButton aria-label="Copiar el enlace del artículo" value={url}>
      Copiar enlace
    </CopyButton>
  )
}
