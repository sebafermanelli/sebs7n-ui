/**
 * Conversión de color, para `ColorPicker` y para quien guarde colores.
 *
 * El sistema trabaja en OKLCH —así se declara `--brand-base`—, pero un color casi siempre
 * llega o se guarda como hexadecimal. `hexOfOklch` ya vivía en `lib/contrast`, porque medir
 * contraste lo necesita; acá está el camino de vuelta.
 *
 * Sin dependencias y sin `"use client"`.
 */
// `../lib/` y no `./`: el generador del registry de `shadcn add` reconoce las dependencias
// entre módulos por esa forma. Con `./contrast.js` armaba una dependencia a un ítem que no existe.
import { hexOfOklch, type Oklch } from "../lib/contrast.js"

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const redondear = (valor: number, decimales: number) => Number(valor.toFixed(decimales))

/** `#rgb`, `#rrggbb` o lo mismo sin numeral → OKLCH. `null` si el texto no es un color. */
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
  // Cuatro decimales y el matiz con uno. Con tres y grados enteros, un ámbar pegado al borde del
  // gamut (#ffb200) volvía como #ffb205: ahí el canal azul se mueve mucho con muy poco croma.
  return [redondear(L, 4), redondear(c, 4), redondear(h, 1)]
}

/** Como se escribe en CSS: `oklch(0.573 0.214 258)`. */
export const cssOfOklch = ([l, c, h]: Oklch) => `oklch(${redondear(l, 4)} ${redondear(c, 4)} ${redondear(h, 1)})`

/** ¿Son el mismo color? Con la tolerancia de lo que se puede distinguir a ojo, no bit a bit. */
export const isSameColor = (a: Oklch, b: Oklch) => hexOfOklch(a) === hexOfOklch(b)
