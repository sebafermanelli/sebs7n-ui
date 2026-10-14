"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui"
import { ImageCropDialog, type ImageCropShape } from "sebs7n-ui/image-crop-dialog"

import { brokenFile, gridFile, logoFile } from "./sample-images"

// Un archivo de muestra (un paisaje en SVG) para no depender de ninguno del sistema.
const sampleFile = () =>
  new File(
    [
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb3ff"/><stop offset="1" stop-color="#ffd6a5"/></linearGradient></defs><rect width="1200" height="800" fill="url(#s)"/><circle cx="880" cy="230" r="90" fill="#fff6d6"/><path d="M0 800V520l220-180 180 150 260-250 300 260 240-120v420z" fill="#3d5a80"/></svg>`,
    ],
    "paisaje.svg",
    { type: "image/svg+xml" },
  )

function Demo({ shape, aspect, label, allowFit, make = async () => sampleFile() }: { shape: ImageCropShape; aspect?: number; label: string; allowFit?: boolean; make?: () => Promise<File> | File }) {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ text: string; url: string } | null>(null)
  return (
    <div className="flex flex-col items-start gap-3">
      <Button onClick={async () => setFile(await make())} variant="secondary">
        {label}
      </Button>
      {result && (
        <div className="flex items-center gap-3">
          {/* Lo que se subiría, tal cual sale del recorte. */}
          <img alt="Resultado guardado" className="h-16 border border-separator bg-fill-2" data-slot="crop-result" src={result.url} />
          <p className="text-callout text-label-secondary">Se subiría: {result.text}</p>
        </div>
      )}
      <ImageCropDialog
        allowFit={allowFit}
        aspect={aspect}
        file={file}
        onCancel={() => setFile(null)}
        onSave={async (cropped) => {
          await new Promise((resolve) => setTimeout(resolve, 600))
          setResult({ text: `${cropped.name} · ${cropped.type} · ${Math.round(cropped.size / 1024)} kB`, url: URL.createObjectURL(cropped) })
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

/**
 * Imagen apaisada
 * Una cuadrícula de 1600×900: arrastrá la imagen a los costados para elegir qué cuadrado se ve. Los bordes frenan el movimiento, sin dejar huecos.
 */
export function Landscape() {
  return <Demo label="Recortar imagen apaisada" make={() => gridFile(1600, 900, "apaisada.png")} shape="circle" />
}

/**
 * Imagen vertical
 * Una cuadrícula de 900×1600: se mueve hacia arriba y abajo. Con las flechas del teclado también, y con Mayús de a pasos más grandes.
 */
export function Portrait() {
  return <Demo label="Recortar imagen vertical" make={() => gridFile(900, 1600, "vertical.png")} shape="square" />
}

/**
 * Ver la imagen entera
 * Para un logo apaisado: `allowFit` abre el recorte mostrando la imagen completa y deja acercarla. El resto del marco sale transparente en el WebP (el recuadro de abajo lo muestra sobre un fondo gris).
 */
export function FitWhole() {
  return <Demo allowFit label="Recortar logo apaisado" make={() => logoFile()} shape="rounded" />
}

/**
 * Imagen ilegible
 * Si el archivo no se puede leer, el diálogo muestra el error y «Guardar» queda deshabilitado; «Cancelar» sigue andando.
 */
export function Unreadable() {
  return <Demo label="Elegir una imagen dañada" make={() => brokenFile()} shape="circle" />
}

/**
 * Leyendo una imagen pesada
 * Mientras se lee la imagen el área muestra un indicador y «Guardar» espera. Acá la imagen es grande (6000×4000) para que se alcance a ver.
 */
export function Loading() {
  return <Demo label="Recortar imagen grande" make={() => gridFile(6000, 4000, "grande.png")} shape="circle" />
}
