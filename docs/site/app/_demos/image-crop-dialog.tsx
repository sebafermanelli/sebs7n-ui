"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui"
import { ImageCropDialog, type ImageCropShape } from "sebs7n-ui/image-crop-dialog"

// Un archivo de muestra (un paisaje en SVG) para no depender de ninguno del sistema.
const sampleFile = () =>
  new File(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb3ff"/><stop offset="1" stop-color="#ffd6a5"/></linearGradient></defs><rect width="1200" height="800" fill="url(#s)"/><circle cx="880" cy="230" r="90" fill="#fff6d6"/><path d="M0 800V520l220-180 180 150 260-250 300 260 240-120v420z" fill="#3d5a80"/></svg>`,
    ],
    "paisaje.svg",
    { type: "image/svg+xml" },
  )

function Demo({ shape, aspect, label }: { shape: ImageCropShape; aspect?: number; label: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={() => setFile(sampleFile())} variant="secondary">
        {label}
      </Button>
      {result && <p className="text-callout text-label-secondary">Se subiría: {result}</p>}
      <ImageCropDialog
        aspect={aspect}
        file={file}
        onCancel={() => setFile(null)}
        onSave={async (cropped) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          setResult(`${cropped.name} · ${cropped.type} · ${Math.round(cropped.size / 1024)} kB`)
          setFile(null)
        }}
        shape={shape}
      />
    </div>
  )
}

/**
 * Recorte circular
 * Arrastrá la imagen, usá la rueda o el control de zoom. Guardar entrega un `File` cuadrado en WebP.
 */
export function Circle() {
  return <Demo label="Recortar foto de perfil" shape="circle" />
}

/**
 * Recorte redondeado y apaisado
 * Para un logo. `shape="rounded"` redondea las esquinas, `aspect` cambia la proporción (acá 4/3) y `output` el tamaño y el formato de salida.
 */
export function Rounded() {
  return <Demo aspect={4 / 3} label="Recortar logo" shape="rounded" />
}
