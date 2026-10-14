"use client"

import * as React from "react"
import Cropper from "react-easy-crop"
import { ImageOffIcon, MoveIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react"

import { defined } from "../internal/defined.js"
import { clampOffset, cropToFile, drawCrop, fitZoom, loadImage, overflowAxes, viewToArea, visibleSpan, type CropMedia, type CropOutput, type Point, type Size } from "../internal/crop-image.js"
import { useLabels } from "../lib/labels.js"
import { cn } from "../lib/utils.js"
import { Button } from "./button.js"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog.js"
import { Slider } from "./slider.js"
import { Spinner } from "./spinner.js"

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
  /** La ayuda de abajo del recorte; aparece cuando hay un eje para mover la imagen. */
  hint: string
  /** Lo que lee el lector de pantalla del área de recorte: cómo moverla con el teclado. */
  keyboardHint: string
  /** Lo que anuncia el lector después de mover con el teclado. Lleva `{from}` y `{to}` (%). */
  positionX: string
  /** Igual, en vertical. Lleva `{from}` y `{to}` (%). */
  positionY: string
  /** Mientras se lee la imagen. */
  loading: string
}

const imageCropLabels: ImageCropDialogLabels = {
  title: "Elegí la parte visible",
  description: "Ajustá el encuadre y el zoom antes de guardar.",
  zoom: "Zoom",
  cancel: "Cancelar",
  save: "Guardar",
  saving: "Guardando…",
  preview: "Vista previa",
  area: "Área de recorte",
  saveError: "No pudimos guardar la imagen. Probá de nuevo.",
  loadError: "No pudimos leer esa imagen. Probá con otra.",
  hint: "Arrastrá la imagen para elegir qué parte se ve",
  keyboardHint: "Con las flechas movés la imagen; con Mayús, de a pasos más grandes. Con + y − cambiás el zoom.",
  positionX: "Se ve del {from} % al {to} % del ancho de la imagen.",
  positionY: "Se ve del {from} % al {to} % del alto de la imagen.",
  loading: "Cargando la imagen…",
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
  /**
   * Deja alejar la imagen hasta verla entera, con el resto del marco transparente (un logo apaisado
   * que no tiene que cortarse), y se abre mostrándola así. Sin esto el zoom mínimo cubre todo el marco,
   * que es lo que va para una foto de perfil. Pensado para `shape="rounded"` o `square` con salida en WebP o PNG: un JPEG
   * no tiene transparencia y el vacío sale blanco.
   */
  allowFit?: boolean
  title?: React.ReactNode
  description?: React.ReactNode
  labels?: Partial<ImageCropDialogLabels>
}

const RADIUS = { circle: "50%", rounded: "22%", square: "0" } as const

const MAX_ZOOM = 4
// Lo que mueve cada flecha en pantalla, sola y con Mayús.
const STEP = 10
const STEP_BIG = 50

type Status = "loading" | "ready" | "error"

function ImageCropDialog({ file, onCancel, onSave, shape = "circle", aspect = 1, output, allowFit = false, title, description, labels: labelsProp }: ImageCropDialogProps) {
  const labels = { ...imageCropLabels, ...useLabels().imageCrop, ...defined(labelsProp) }
  const [url, setUrl] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [media, setMedia] = React.useState<CropMedia | null>(null)
  const [frame, setFrame] = React.useState<Size | null>(null)
  const [status, setStatus] = React.useState<Status>("loading")
  // La librería mide el contenedor al montar: con el diálogo todavía creciendo (zoom-in) mide de menos
  // y el marco y los límites quedan chicos para siempre. Se monta recién con el diálogo asentado.
  const [settled, setSettled] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const preview = React.useRef<HTMLCanvasElement>(null)
  const source = React.useRef<HTMLImageElement | null>(null)
  const announceTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hintId = React.useId()
  const keyboardId = React.useId()
  const open = file !== null

  // La URL del archivo vive mientras el diálogo está abierto; al cambiar de archivo se reinicia todo.
  React.useEffect(() => {
    if (!file) {
      setSettled(false)
      return
    }
    const next = URL.createObjectURL(file)
    setUrl(next)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setMedia(null)
    setFrame(null)
    fitApplied.current = false
    setStatus("loading")
    setError(null)
    setAnnouncement("")
    source.current = null
    let cancelled = false
    loadImage(next).then(
      (image) => {
        if (cancelled) return
        source.current = image
        setStatus("ready")
      },
      () => {
        if (cancelled) return
        setStatus("error")
        setError(labels.loadError)
      },
    )
    // Por si el diálogo no avisa que terminó de abrirse (sin animación, entornos sin Web Animations).
    const fallback = setTimeout(() => setSettled(true), 400)
    return () => {
      cancelled = true
      clearTimeout(fallback)
      URL.revokeObjectURL(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `labels.loadError` no debe reiniciar el recorte
  }, [file])

  React.useEffect(() => () => clearTimeout(announceTimer.current), [])

  // El zoom que ve la app y el slider (`zoom`) es 1 cuando la imagen recién cubre el marco, que es el recorte
  // más grande posible; el de la librería (`zoom * cover`) es 1 cuando la imagen cubre el contenedor, que es
  // más grande que el marco en una vertical. `fit` es el mismo mínimo de «ver entera» en las unidades de la app.
  const cover = media && frame ? Math.max(frame.width / media.width, frame.height / media.height) : 1
  const minZoom = allowFit && media && frame ? Math.min(1, Math.floor((fitZoom(media, frame) / cover) * 100) / 100) : 1
  // Con `allowFit` se abre mostrando la imagen entera (lo que pide un logo); alejarse o acercarse queda a mano.
  const fitApplied = React.useRef(false)
  React.useEffect(() => {
    if (!allowFit || !media || !frame || fitApplied.current) return
    fitApplied.current = true
    setZoom(minZoom)
  }, [allowFit, media, frame, minZoom])
  const view = media && frame ? { media, frame, zoom: zoom * cover, offset: crop } : null
  // El rectángulo de la imagen original dentro del marco: de acá salen la vista previa y el archivo.
  const area = React.useMemo(() => (view ? viewToArea(view) : null), [media, frame, zoom, cover, crop]) // eslint-disable-line react-hooks/exhaustive-deps
  const axes = area && media ? overflowAxes(area, media) : { x: false, y: false }
  const showHint = status === "ready" && (axes.x || axes.y)

  React.useEffect(() => {
    const canvas = preview.current
    const image = source.current
    if (canvas && image && area) drawCrop(canvas, image, area, 96, 96 / aspect, output?.type === "image/jpeg" ? "#fff" : undefined)
  }, [area, aspect, output?.type, status])

  function announce(nextArea: ReturnType<typeof viewToArea>) {
    if (!media) return
    const span = visibleSpan(nextArea, media)
    const axesNow = overflowAxes(nextArea, media)
    const parts: string[] = []
    if (axesNow.x) parts.push(labels.positionX.replace("{from}", String(span.x[0])).replace("{to}", String(span.x[1])))
    if (axesNow.y) parts.push(labels.positionY.replace("{from}", String(span.y[0])).replace("{to}", String(span.y[1])))
    // Con un pequeño retraso: una ráfaga de flechas se lee una sola vez, con el lugar al que llegó.
    clearTimeout(announceTimer.current)
    announceTimer.current = setTimeout(() => setAnnouncement(parts.join(" ")), 250)
  }

  // Las flechas de la librería mueven 1 px y Mayús, menos: acá 10 px y Mayús, 50. Reemplaza su `onKeyDown`.
  function onAreaKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!media || !frame || pending || status !== "ready") return
    const step = event.shiftKey ? STEP_BIG : STEP
    const move: Record<string, Point | undefined> = { ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 }, ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step } }
    const delta = move[event.key]
    let nextZoom = zoom
    if (!delta) {
      if (event.key === "+" || event.key === "=") nextZoom = Math.min(MAX_ZOOM, zoom + 0.1)
      else if (event.key === "-" || event.key === "_") nextZoom = Math.max(minZoom, zoom - 0.1)
      else return
    }
    event.preventDefault()
    const nextView = { media, frame, zoom: nextZoom * cover, offset: crop }
    const nextCrop = clampOffset({ x: crop.x + (delta?.x ?? 0), y: crop.y + (delta?.y ?? 0) }, nextView)
    setZoom(nextZoom)
    setCrop(nextCrop)
    announce(viewToArea({ ...nextView, offset: nextCrop }))
  }

  async function save() {
    if (!file || !url || !area || status !== "ready" || pending) return
    setPending(true)
    setError(null)
    try {
      const cropped = await cropToFile(url, area, file.name, output)
      await onSave(cropped)
    } catch (caught) {
      const message = caught instanceof Error && caught.message && !["canvas", "encode", "image-load"].includes(caught.message) ? caught.message : labels.saveError
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !pending && onCancel()} onOpenChangeComplete={(done) => setSettled(done)}>
      <DialogContent className="sm:max-w-md" showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title ?? labels.title}</DialogTitle>
          <DialogDescription>{description ?? labels.description}</DialogDescription>
        </DialogHeader>
        {/* Alto fijo: el diálogo no cambia de medida mientras carga la imagen ni cuando aparece el error. */}
        <div className="relative h-72 w-full overflow-hidden rounded-surface bg-black" data-slot="image-crop-area" aria-busy={status === "loading" || undefined}>
          {url && settled && status === "ready" ? (
            <Cropper
              image={url}
              crop={crop}
              zoom={zoom * cover}
              minZoom={minZoom * cover}
              maxZoom={MAX_ZOOM * cover}
              aspect={aspect}
              // La imagen cubre el contenedor y el marco ocupa su lado menor: con «contain» una vertical
              // (900×1600) dejaba un marco de 160 px en un área de 288.
              objectFit="cover"
              cropShape={shape === "circle" ? "round" : "rect"}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={(next) => setZoom(next / cover)}
              setMediaSize={setMedia}
              setCropSize={setFrame}
              cropperProps={
                {
                  role: "group",
                  "aria-label": labels.area,
                  "aria-describedby": `${hintId} ${keyboardId}`,
                  onKeyDown: onAreaKeyDown,
                } as React.HTMLAttributes<HTMLDivElement>
              }
              style={{ cropAreaStyle: shape === "rounded" ? { borderRadius: RADIUS.rounded } : undefined }}
            />
          ) : null}
          {status === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center text-white/80" data-slot="image-crop-loading">
              <Spinner size="lg" label={labels.loading} />
            </div>
          )}
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60" data-slot="image-crop-failed">
              <ImageOffIcon aria-hidden className="size-8" />
            </div>
          )}
        </div>
        {/* Siempre ocupa su renglón (invisible sin eje de movimiento) para que el diálogo no salte. */}
        <p id={hintId} aria-hidden={!showHint || undefined} data-slot="image-crop-hint" className={cn("-mt-1 flex min-h-5 items-center justify-center gap-1.5 text-footnote text-label-secondary", !showHint && "invisible")}>
          <MoveIcon aria-hidden className="size-3.5 shrink-0" />
          {labels.hint}
        </p>
        <span id={keyboardId} className="sr-only">{labels.keyboardHint}</span>
        <p role="status" className="sr-only">{announcement}</p>
        <div className="flex items-center gap-3">
          <ZoomOutIcon aria-hidden className="size-4 shrink-0 text-label-secondary" />
          <Slider aria-label={labels.zoom} min={minZoom} max={MAX_ZOOM} step={0.01} value={Math.max(zoom, minZoom)} onValueChange={(next) => setZoom(next as number)} disabled={pending || status !== "ready"} />
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
          <Button onClick={save} disabled={status !== "ready" || !area} loading={pending}>
            {pending ? labels.saving : labels.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ImageCropDialog, imageCropLabels, type ImageCropDialogLabels, type ImageCropDialogProps, type ImageCropShape }
export type { CropOutput }
