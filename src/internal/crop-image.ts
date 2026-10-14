// Recorta una imagen con el rectángulo en píxeles que da `react-easy-crop` y devuelve un `File`.
// Vive aparte del componente para poder probarlo sin React y para que el barrel no lo vea.

export type CropArea = { x: number; y: number; width: number; height: number }

export type CropOutput = {
  /** Lado mayor de la salida en píxeles. Si el recorte es más chico no se agranda. Default 512. */
  size?: number
  /** `image/webp` (default), `image/png` o `image/jpeg`. */
  type?: "image/webp" | "image/png" | "image/jpeg"
  /** Calidad inicial 0–1 (no aplica a PNG). Default 0,9. */
  quality?: number
  /** Si el resultado pesa más, baja la calidad y después el tamaño hasta que entre. */
  maxBytes?: number
}

export type Size = { width: number; height: number }
export type Point = { x: number; y: number }
/** Lo que `react-easy-crop` llama `MediaSize`: la imagen como se dibuja con zoom 1 y sus píxeles reales. */
export type CropMedia = Size & { naturalWidth: number; naturalHeight: number }

/**
 * Todo lo que hace falta para saber qué parte de la imagen está dentro del marco: la imagen con zoom 1
 * (`media`), el marco (`frame`), el zoom y cuánto se corrió la imagen del centro (`offset`, en píxeles
 * de pantalla; negativo = la imagen se fue a la izquierda / arriba y se ve más de la derecha / abajo).
 */
export type CropView = { media: CropMedia; frame: Size; zoom: number; offset: Point }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

/**
 * Cuánto se puede correr la imagen por eje sin dejar un hueco dentro del marco: la mitad de lo que
 * sobra (o, con zoom menor al de cubrir, de lo que falta para llenar el marco: ahí la imagen se
 * mueve dentro del marco y no se sale). Es la misma cuenta que `restrictPosition` de la librería.
 */
export function clampOffset(offset: Point, { media, frame, zoom }: CropView): Point {
  const maxX = Math.abs((media.width * zoom) / 2 - frame.width / 2)
  const maxY = Math.abs((media.height * zoom) / 2 - frame.height / 2)
  // `+ 0` evita un -0.
  return { x: clamp(offset.x, -maxX, maxX) + 0, y: clamp(offset.y, -maxY, maxY) + 0 }
}

/**
 * El rectángulo de la imagen original (en sus píxeles) que está dentro del marco. Lo calculamos acá y
 * no con el de la librería porque ella lo limita a la imagen: con «ver entera» (zoom menor a 1) el área
 * se pasa de la imagen y ese resto sale transparente. Vista previa y archivo guardado salen del mismo.
 */
export function viewToArea(view: CropView): CropArea {
  const { media, frame, zoom } = view
  const offset = clampOffset(view.offset, view)
  const shownWidth = media.width * zoom
  const shownHeight = media.height * zoom
  const scaleX = media.naturalWidth / shownWidth
  const scaleY = media.naturalHeight / shownHeight
  return {
    x: ((shownWidth - frame.width) / 2 - offset.x) * scaleX,
    y: ((shownHeight - frame.height) / 2 - offset.y) * scaleY,
    width: frame.width * scaleX,
    height: frame.height * scaleY,
  }
}

/** El zoom con el que la imagen entra entera en el marco (nunca más de 1: con 1 ya cubre el marco). */
export function fitZoom(media: Size, frame: Size): number {
  return Math.min(1, frame.width / media.width, frame.height / media.height)
}

/** En qué ejes sobra imagen fuera del marco, o sea, en cuáles tiene sentido arrastrar. */
export function overflowAxes(area: CropArea, media: Pick<CropMedia, "naturalWidth" | "naturalHeight">): { x: boolean; y: boolean } {
  return { x: area.width < media.naturalWidth - 0.5, y: area.height < media.naturalHeight - 0.5 }
}

/** El tramo de la imagen que se ve, de 0 a 100 %, por eje. */
export function visibleSpan(area: CropArea, media: Pick<CropMedia, "naturalWidth" | "naturalHeight">) {
  const span = (from: number, size: number, total: number): [number, number] => [clamp(Math.round((from / total) * 100), 0, 100), clamp(Math.round(((from + size) / total) * 100), 0, 100)]
  return { x: span(area.x, area.width, media.naturalWidth), y: span(area.y, area.height, media.naturalHeight) }
}

const EXTENSION = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" } as const

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("image-load"))
    image.src = src
  })
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

const sizeOf = (image: CanvasImageSource) => {
  const source = image as { naturalWidth?: number; width?: number; naturalHeight?: number; height?: number }
  return { width: source.naturalWidth || source.width || 0, height: source.naturalHeight || source.height || 0 }
}

/**
 * Dibuja el recorte en un canvas de `width × height`. Si el área se pasa de la imagen («ver entera»)
 * solo se dibuja lo que hay, en su lugar, y el resto queda transparente (o del `background`, que es
 * lo que pide un JPEG, que no tiene alfa).
 */
export function drawCrop(canvas: HTMLCanvasElement, image: CanvasImageSource, area: CropArea, width: number, height: number, background?: string) {
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext("2d")
  if (!context) return false
  context.imageSmoothingQuality = "high"
  context.clearRect(0, 0, canvas.width, canvas.height)
  if (background) {
    context.fillStyle = background
    context.fillRect(0, 0, canvas.width, canvas.height)
  }
  const natural = sizeOf(image)
  const inside = !natural.width || !natural.height || (area.x >= 0 && area.y >= 0 && area.x + area.width <= natural.width + 1e-6 && area.y + area.height <= natural.height + 1e-6)
  if (inside) {
    context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)
    return true
  }
  const left = Math.max(area.x, 0)
  const top = Math.max(area.y, 0)
  const right = Math.min(area.x + area.width, natural.width)
  const bottom = Math.min(area.y + area.height, natural.height)
  if (right <= left || bottom <= top) return true
  const kx = canvas.width / area.width
  const ky = canvas.height / area.height
  context.drawImage(image, left, top, right - left, bottom - top, (left - area.x) * kx, (top - area.y) * ky, (right - left) * kx, (bottom - top) * ky)
  return true
}

export async function cropToFile(src: string, area: CropArea, name: string, output: CropOutput = {}): Promise<File> {
  const { size = 512, type = "image/webp", maxBytes } = output
  const image = await loadImage(src)
  const canvas = document.createElement("canvas")
  let scale = Math.min(1, size / Math.max(area.width, area.height))
  let quality = output.quality ?? 0.9
  for (let attempt = 0; attempt < 8; attempt++) {
    if (!drawCrop(canvas, image, area, area.width * scale, area.height * scale, type === "image/jpeg" ? "#fff" : undefined)) throw new Error("canvas")
    const blob = await toBlob(canvas, type, quality)
    if (!blob) throw new Error("encode")
    if (!maxBytes || blob.size <= maxBytes || attempt === 7) {
      const base = name.replace(/\.[^.]+$/, "") || "image"
      // Si el navegador no sabe codificar el tipo pedido, devuelve PNG: el nombre sigue al tipo real.
      const real = (blob.type || type) as keyof typeof EXTENSION
      return new File([blob], `${base}.${EXTENSION[real] ?? "png"}`, { type: blob.type || type })
    }
    if (type !== "image/png" && quality > 0.6) quality -= 0.15
    else scale *= 0.8
  }
  throw new Error("encode")
}
