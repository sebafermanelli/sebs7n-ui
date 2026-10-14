"use client"

import * as React from "react"
import { CameraIcon, ImageIcon, Trash2Icon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { accepts, formatBytes } from "../internal/files.js"
import type { CropOutput } from "../internal/crop-image.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu.js"
import { ImageCropDialog, type ImageCropDialogLabels, type ImageCropShape } from "./image-crop-dialog.js"
import { Spinner } from "./spinner.js"

type AvatarUploadLabels = {
  /** «Subir foto» / «Subir logo»: la opción del menú. */
  upload: string
  /** «Quitar foto» / «Quitar logo». */
  remove: string
  invalidType: string
  /** Lleva `{max}`: «La imagen pesa más de {max}». */
  tooLarge: string
  removeError: string
  /** Lo que anuncia el lector mientras sube o quita. */
  loading: string
}

const avatarUploadLabels: AvatarUploadLabels = {
  upload: "Subir foto",
  remove: "Quitar foto",
  invalidType: "Elegí una imagen PNG, JPG o WebP.",
  tooLarge: "La imagen pesa más de {max}. Elegí una más liviana.",
  removeError: "No pudimos quitar la imagen. Probá de nuevo.",
  loading: "Guardando…",
}

type AvatarUploadSize = "md" | "lg" | "xl"

type AvatarUploadProps = {
  /** La imagen actual. Sin `src` el clic abre directo el selector de archivos. */
  src?: string | null
  /** Nombre accesible del botón: «Cambiar foto de perfil», «Cambiar logo del estudio». Obligatorio. */
  label: string
  /** Lo que se ve sin imagen (iniciales o un ícono). Default: un ícono de imagen. */
  fallback?: React.ReactNode
  /** `circle` (foto de perfil), `rounded` (logo) o `square`. Es también la forma del recorte. */
  shape?: ImageCropShape
  /** 64, 96 o 128 px. Default `xl`. */
  size?: AvatarUploadSize
  /** Recibe el recorte ya ajustado (WebP, cuadrado). Si falla, el diálogo queda abierto con el mensaje del error. */
  onUpload: (file: File) => void | Promise<void>
  /** Quita la imagen. Sin esto el menú no ofrece «Quitar». */
  onRemove?: () => void | Promise<void>
  disabled?: boolean
  /** La app está subiendo o quitando por su cuenta: spinner sobre la imagen y botón ocupado. */
  loading?: boolean
  /** Tope del archivo elegido, en bytes. Default 2 MB. */
  maxBytes?: number
  /** Tipos aceptados. Default PNG, JPG y WebP. */
  accept?: string
  /** Tamaño y formato del recorte que sale. Por defecto 512 px, WebP, y nunca más que `maxBytes`. */
  output?: CropOutput
  /** Un error que viene de afuera (se muestra debajo, como los de validación). */
  error?: string
  labels?: Partial<AvatarUploadLabels>
  cropLabels?: Partial<ImageCropDialogLabels>
  className?: string
}

const SIZE = { md: "size-16", lg: "size-24", xl: "size-32" } as const
// En porcentaje y en `style`: el radio sigue al tamaño del logo (no hay token que lo haga).
const RADIUS = { circle: "50%", rounded: "22%", square: "0" } as const

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp"
const DEFAULT_MAX = 2 * 1024 * 1024

/**
 * La foto de perfil o el logo que se cambia tocando la imagen: al pasar el puntero (o enfocar con
 * el teclado) aparece una cámara encima. Sin imagen, el clic abre el selector de archivos; con
 * imagen, un menú ofrece «Subir» y «Quitar». Al elegir un archivo se abre `ImageCropDialog` para
 * encuadrar la parte visible, y recién al «Guardar» se llama a `onUpload` con el recorte.
 *
 * No sube nada: la red es de la app. Valida tipo y peso antes de abrir el recorte.
 */
function AvatarUpload({
  src,
  label,
  fallback,
  shape = "circle",
  size = "xl",
  onUpload,
  onRemove,
  disabled = false,
  loading = false,
  maxBytes = DEFAULT_MAX,
  accept = DEFAULT_ACCEPT,
  output,
  error: errorProp,
  labels: labelsProp,
  cropLabels,
  className,
}: AvatarUploadProps) {
  const labels = { ...avatarUploadLabels, ...useLabels().avatarUpload, ...defined(labelsProp) }
  const input = React.useRef<HTMLInputElement>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [message, setMessage] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [broken, setBroken] = React.useState(false)
  const errorId = React.useId()
  const working = loading || busy
  const off = disabled || working
  const hasImage = !!src && !broken
  const shownError = message ?? errorProp

  React.useEffect(() => setBroken(false), [src])

  function pick() {
    input.current?.click()
  }

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0]
    // Se limpia para poder elegir de nuevo el mismo archivo.
    event.target.value = ""
    if (!chosen) return
    if (!accepts(chosen, accept)) return setMessage(labels.invalidType)
    if (chosen.size > maxBytes) return setMessage(labels.tooLarge.replace("{max}", formatBytes(maxBytes, "es-AR")))
    setMessage(null)
    setFile(chosen)
  }

  async function remove() {
    if (!onRemove) return
    setMessage(null)
    setBusy(true)
    try {
      await onRemove()
    } catch (caught) {
      setMessage(caught instanceof Error && caught.message ? caught.message : labels.removeError)
    } finally {
      setBusy(false)
    }
  }

  async function save(cropped: File) {
    await onUpload(cropped)
    setFile(null)
  }

  const frame = cn("group/avatar-upload relative inline-block shrink-0", SIZE[size])

  return (
    <div data-slot="avatar-upload" className={cn("inline-flex flex-col items-start gap-2", className)}>
      <DropdownMenu
        open={menuOpen && hasImage && !off}
        onOpenChange={(next) => {
          if (off) return
          // Sin imagen no hay nada que elegir en un menú: el clic va directo al selector.
          if (next && !hasImage) return pick()
          setMenuOpen(next)
        }}
      >
        <DropdownMenuTrigger
          data-slot="avatar-upload-trigger"
          aria-label={label}
          aria-busy={working || undefined}
          aria-describedby={shownError ? errorId : undefined}
          disabled={disabled}
          style={{ borderRadius: RADIUS[shape] }}
          className={cn(frame, "cursor-pointer overflow-hidden border border-separator bg-fill-2 outline-none focus-visible:focus-ring disabled:cursor-not-allowed disabled:opacity-60", working && "cursor-progress")}
        >
          {hasImage ? (
            // El nombre del botón ya dice qué es; la imagen es decoración.
            <img src={src!} alt="" draggable={false} onError={() => setBroken(true)} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-label-secondary [&_svg]:size-1/3">{fallback ?? <ImageIcon aria-hidden />}</span>
          )}
          <span
            aria-hidden
            data-slot="avatar-upload-overlay"
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 motion-safe:transition-opacity",
              "group-hover/avatar-upload:opacity-100 group-focus-visible/avatar-upload:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:bg-black/30",
              working && "opacity-100",
            )}
          >
            {working ? <Spinner size="lg" /> : <CameraIcon className="size-1/4 min-h-5 min-w-5" />}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={pick}>
            <CameraIcon aria-hidden />
            {labels.upload}
          </DropdownMenuItem>
          {onRemove && (
            <DropdownMenuItem variant="destructive" onClick={remove}>
              <Trash2Icon aria-hidden />
              {labels.remove}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <input ref={input} type="file" accept={accept} hidden tabIndex={-1} aria-hidden onChange={choose} data-slot="avatar-upload-input" />
      <span role="status" className="sr-only">{working ? labels.loading : ""}</span>
      {shownError && (
        <p id={errorId} role="alert" className="max-w-64 text-footnote text-destructive">
          {shownError}
        </p>
      )}
      <ImageCropDialog
        file={file}
        shape={shape}
        onCancel={() => setFile(null)}
        onSave={save}
        output={{ maxBytes, ...output }}
        labels={cropLabels}
      />
    </div>
  )
}

export { AvatarUpload, avatarUploadLabels, type AvatarUploadLabels, type AvatarUploadProps, type AvatarUploadSize }
