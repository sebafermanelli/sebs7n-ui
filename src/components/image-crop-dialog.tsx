"use client"

import * as React from "react"
import Cropper, { type Area } from "react-easy-crop"
import { ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { cropToFile, drawCrop, loadImage, type CropOutput } from "../internal/crop-image.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog.js"
import { Slider } from "./slider.js"

type ImageCropDialogLabels = {
  title: string
  description: string
  /** Nombre accesible del control deslizante de zoom. */
  zoom: string
  cancel: string
  save: string
  saving: string
  /** Nombre accesible de la vista previa. */
  preview: string
  /** Nombre accesible del área de recorte (la imagen se mueve con flechas, arrastrando o con la rueda). */
  area: string
  /** Cuando `onSave` falla sin mensaje propio. */
  saveError: string
  loadError: string
}

const imageCropLabels: ImageCropDialogLabels = {
  title: "Elegí la parte visible",
  description: "Arrastrá la imagen para moverla y usá el zoom para acercarla.",
  zoom: "Zoom",
  cancel: "Cancelar",
  save: "Guardar",
  saving: "Guardando…",
  preview: "Vista previa",
  area: "Área de recorte. Con las flechas movés la imagen.",
  saveError: "No pudimos guardar la imagen. Probá de nuevo.",
  loadError: "No pudimos leer esa imagen. Probá con otra.",
}

/** La forma del recorte: `circle` (foto de perfil), `rounded` (logo, esquinas redondeadas) o `square`. */
type ImageCropShape = "circle" | "rounded" | "square"

type ImageCropDialogProps = {
  /** El archivo elegido. Sin archivo el diálogo no se abre. */
  file: File | null
  /** Cierra sin guardar (Cancelar, Escape, la X o clic afuera). Mientras guarda no cierra. */
  onCancel: () => void
  /**
   * Recibe el recorte ya ajustado. Si devuelve una promesa, el diálogo muestra «Guardando…» y se
   * cierra al resolverse; si falla, queda abierto con el mensaje de error (`error.message`).
   */
  onSave: (file: File) => void | Promise<void>
  shape?: ImageCropShape
  /** Ancho / alto del recorte. Default 1. */
  aspect?: number
  /** Tamaño y formato del archivo que sale. */
  output?: CropOutput
  title?: React.ReactNode
  description?: React.ReactNode
  labels?: Partial<ImageCropDialogLabels>
}

const RADIUS = { circle: "50%", rounded: "22%", square: "0" } as const

function ImageCropDialog({ file, onCancel, onSave, shape = "circle", aspect = 1, output, title, description, labels: labelsProp }: ImageCropDialogProps) {
  const labels = { ...imageCropLabels, ...useLabels().imageCrop, ...defined(labelsProp) }
  const [url, setUrl] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const area = React.useRef<Area | null>(null)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const preview = React.useRef<HTMLCanvasElement>(null)
  const source = React.useRef<HTMLImageElement | null>(null)
  const open = file !== null

  // La URL del archivo vive mientras el diálogo está abierto; al cambiar de archivo se reinicia todo.
  React.useEffect(() => {
    if (!file) return
    const next = URL.createObjectURL(file)
    setUrl(next)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setError(null)
    area.current = null
    source.current = null
    let cancelled = false
    loadImage(next).then(
      (image) => {
        if (!cancelled) source.current = image
      },
      () => {
        if (!cancelled) setError(labels.loadError)
      },
    )
    return () => {
      cancelled = true
      URL.revokeObjectURL(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `labels.loadError` no debe reiniciar el recorte
  }, [file])

  const drawPreview = React.useCallback((pixels: Area) => {
    area.current = pixels
    const canvas = preview.current
    const image = source.current
    if (canvas && image) drawCrop(canvas, image, pixels, 96, 96 / aspect)
  }, [aspect])

  async function save() {
    if (!file || !url || !area.current || pending) return
    setPending(true)
    setError(null)
    try {
      const cropped = await cropToFile(url, area.current, file.name, output)
      await onSave(cropped)
    } catch (caught) {
      const message = caught instanceof Error && caught.message && !["canvas", "encode", "image-load"].includes(caught.message) ? caught.message : labels.saveError
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !pending && onCancel()}>
      <DialogContent className="sm:max-w-md" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title ?? labels.title}</DialogTitle>
          <DialogDescription>{description ?? labels.description}</DialogDescription>
        </DialogHeader>
        {/* Alto fijo: el diálogo no cambia de medida mientras carga la imagen ni cuando aparece el error. */}
        <div className="relative h-72 w-full overflow-hidden rounded-surface bg-black" data-slot="image-crop-area">
          {url ? (
            <Cropper
              image={url}
              crop={crop}
              zoom={zoom}
              minZoom={1}
              maxZoom={4}
              aspect={aspect}
              cropShape={shape === "circle" ? "round" : "rect"}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropAreaChange={(_, pixels) => drawPreview(pixels)}
              onCropComplete={(_, pixels) => drawPreview(pixels)}
              cropperProps={{ "aria-label": labels.area } as React.HTMLAttributes<HTMLDivElement>}
              style={{ cropAreaStyle: shape === "rounded" ? { borderRadius: RADIUS.rounded } : undefined }}
            />
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <ZoomOutIcon aria-hidden className="size-4 shrink-0 text-label-secondary" />
          <Slider aria-label={labels.zoom} min={1} max={4} step={0.01} value={zoom} onValueChange={(next) => setZoom(next as number)} disabled={pending} />
          <ZoomInIcon aria-hidden className="size-4 shrink-0 text-label-secondary" />
          <canvas
            ref={preview}
            aria-label={labels.preview}
            role="img"
            className="ms-2 h-12 shrink-0 bg-fill-2 object-cover"
            style={{ width: 48 * aspect, borderRadius: RADIUS[shape] }}
          />
        </div>
        <p role="alert" className={cn("min-h-5 text-footnote text-destructive", !error && "sr-only")}>{error}</p>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={pending}>{labels.cancel}</Button>
          <Button onClick={save} disabled={!url || (!!error && !area.current)} loading={pending}>
            {pending ? labels.saving : labels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ImageCropDialog, imageCropLabels, type ImageCropDialogLabels, type ImageCropDialogProps, type ImageCropShape }
export type { CropOutput }
