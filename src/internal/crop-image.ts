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

/** Dibuja el recorte en un canvas cuadrado o rectangular de `width × height`. */
export function drawCrop(canvas: HTMLCanvasElement, image: CanvasImageSource, area: CropArea, width: number, height: number) {
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext("2d")
  if (!context) return false
  context.imageSmoothingQuality = "high"
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)
  return true
}

export async function cropToFile(src: string, area: CropArea, name: string, output: CropOutput = {}): Promise<File> {
  const { size = 512, type = "image/webp", maxBytes } = output
  const image = await loadImage(src)
  const canvas = document.createElement("canvas")
  let scale = Math.min(1, size / Math.max(area.width, area.height))
  let quality = output.quality ?? 0.9
  for (let attempt = 0; attempt < 8; attempt++) {
    if (!drawCrop(canvas, image, area, area.width * scale, area.height * scale)) throw new Error("canvas")
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
