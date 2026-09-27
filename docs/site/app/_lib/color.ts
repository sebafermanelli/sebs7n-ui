// Color para el Playground. El paquete trae OKLCH → sRGB (`sebs7n-ui/lib/contrast`) porque es lo
// que necesita para medir contraste; el camino inverso —de un hexadecimal que alguien pegó a
// OKLCH— solo lo necesita un selector de color, así que vive acá y no en el paquete.
import { contrastRatio, hexOfOklch, luminanceOfHex, luminanceOfOklch, type Oklch } from "sebs7n-ui/lib/contrast"

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

/** `#rgb` o `#rrggbb` → OKLCH. Devuelve `null` si el texto no es un color. */
export function oklchOfHex(hex: string): Oklch | null {
  const limpio = hex.trim().replace(/^#/, "")
  const largo = limpio.length === 3 ? [...limpio].map((c) => c + c).join("") : limpio
  if (!/^[0-9a-f]{6}$/i.test(largo)) return null
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(largo.slice(i, i + 2), 16) / 255)) as [number, number, number]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const c = Math.hypot(A, B)
  // Un gris no tiene matiz: `atan2(0, 0)` da 0, y conviene que sea estable y no un -0 o un NaN.
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360
  // El matiz con un decimal: redondeado a grados enteros, un ámbar pegado al borde del gamut
  // (#ffb200) volvía como #ffb205.
  return [redondear(L, 3), redondear(c, 3), redondear(h, 1)]
}

const redondear = (valor: number, decimales: number) => Number(valor.toFixed(decimales))

/** Como se escribe en CSS: `oklch(0.573 0.214 258)`. */
export const cssOfOklch = ([l, c, h]: Oklch) => `oklch(${redondear(l, 3)} ${redondear(c, 3)} ${redondear(h, 1)})`

/**
 * El texto que va encima del brand: blanco si llega a 4,5:1, y si no, negro.
 *
 * No es «el que más contraste dé». Con el blue del paquete el blanco da 4,55:1 y el negro
 * 4,62:1: por siete centésimas ganaba el negro, y un botón azul con texto negro es un botón
 * que se ve roto. El blanco es la convención sobre un color de marca; el negro es la salida
 * para cuando el brand es claro y el blanco no llega.
 *
 * `aa` dice si el elegido llega a 4,5:1. Hay colores —un amarillo medio, un celeste— con los
 * que ninguno de los dos llega: ahí el Playground lo avisa en vez de esconderlo.
 */
export function textoSobre(color: Oklch): { hex: "#ffffff" | "#000000"; ratio: number; aa: boolean } {
  const fondo = luminanceOfOklch(color)
  const blanco = contrastRatio(fondo, luminanceOfHex("#ffffff"))
  const negro = contrastRatio(fondo, luminanceOfHex("#000000"))
  const usaBlanco = blanco >= 4.5 || blanco >= negro
  const ratio = usaBlanco ? blanco : negro
  return { hex: usaBlanco ? "#ffffff" : "#000000", ratio, aa: ratio >= 4.5 }
}

/** El anillo de foco y el borde de los campos son `brand-700` contra la superficie: 3:1. */
export function focoSobre(color: Oklch, superficie: string): { ratio: number; ok: boolean } {
  const ratio = contrastRatio(luminanceOfOklch(color), luminanceOfHex(superficie))
  return { ratio, ok: ratio >= 3 }
}

export { hexOfOklch, type Oklch }
