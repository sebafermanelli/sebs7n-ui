"use client"

import { useState } from "react"
import { AvatarUpload } from "sebs7n-ui/avatar-upload"

// Imágenes de muestra generadas en línea: la demo no depende de ningún archivo.
const sample = (a: string, b: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="100" cy="82" r="34" fill="#fff" fill-opacity=".85"/><path d="M36 190c6-42 34-62 64-62s58 20 64 62z" fill="#fff" fill-opacity=".85"/></svg>`,
  )}`

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Foto circular
 * Con foto, el clic abre un menú con «Subir foto» y «Quitar foto». Al elegir un archivo se abre el recorte y recién al guardar se llama a `onUpload`.
 */
export function Photo() {
  const [src, setSrc] = useState<string | null>(sample("#6e8efb", "#a777e3"))
  return (
    <AvatarUpload
      label="Cambiar foto de perfil"
      onRemove={async () => {
        await wait(500)
        setSrc(null)
      }}
      onUpload={async (file) => {
        await wait(700)
        setSrc(URL.createObjectURL(file))
      }}
      src={src}
    />
  )
}

/**
 * Sin foto
 * El clic abre directo el selector de archivos. Las iniciales (u otro `fallback`) ocupan el lugar de la foto.
 */
export function Empty() {
  const [src, setSrc] = useState<string | null>(null)
  return (
    <AvatarUpload
      fallback={<span className="text-title-2 font-semibold">AB</span>}
      label="Cambiar foto de perfil"
      onRemove={() => setSrc(null)}
      onUpload={(file) => setSrc(URL.createObjectURL(file))}
      src={src}
    />
  )
}

/**
 * Logo con esquinas redondeadas
 * `shape="rounded"` recorta un cuadrado de esquinas redondeadas. Los textos del menú se cambian con `labels`.
 */
export function Logo() {
  const [src, setSrc] = useState<string | null>(sample("#34c3a0", "#2b7fff"))
  return (
    <AvatarUpload
      label="Cambiar logo del estudio"
      labels={{ upload: "Subir logo", remove: "Quitar logo" }}
      onRemove={() => setSrc(null)}
      onUpload={(file) => setSrc(URL.createObjectURL(file))}
      shape="rounded"
      src={src}
    />
  )
}

/**
 * Cargando
 * `loading` cuando la app sube o quita por su cuenta: spinner sobre la imagen y el botón queda ocupado.
 */
export function Loading() {
  return <AvatarUpload label="Cambiar foto de perfil" loading onUpload={() => {}} src={sample("#f6a35b", "#e8556d")} />
}

/**
 * Con error
 * El archivo de más de 100 kB se rechaza antes de abrir el recorte; el error de la app va en `error` y queda unido al botón.
 */
export function WithError() {
  const [failed, setFailed] = useState(false)
  return (
    <AvatarUpload
      error={failed ? "No pudimos guardar tu foto. Probá de nuevo." : undefined}
      label="Cambiar foto de perfil"
      maxBytes={100 * 1024}
      onUpload={async () => {
        setFailed(false)
        await wait(400)
        setFailed(true)
        throw new Error("No pudimos guardar tu foto. Probá de nuevo.")
      }}
      src={sample("#8e9aaf", "#5c677d")}
    />
  )
}
