export type Oklch = readonly [l: number, c: number, h: number]

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
const clamp = (c: number) => Math.min(1, Math.max(0, c))

function oklchToLinearRgb([l, c, h]: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ]
}

// Luminancia relativa WCAG del color ya recortado a sRGB (como lo pinta el navegador).
export function luminanceOfOklch(color: Oklch): number {
  const [r, g, b] = oklchToLinearRgb(color).map((v) => toLinear(clamp(toGamma(v))))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

export function luminanceOfHex(hex: string): number {
  const n = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(n.slice(i, i + 2), 16) / 255))
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
}

/**
 * Aplana un color con alfa (`#rrggbbaa`) contra el fondo opaco sobre el que se
 * pinta. Los tokens `gray-alpha-*` y el halo de foco son alfa: el navegador los
 * compone antes de mostrarlos, así que el ratio que ve una persona es el del
 * color YA compuesto, no el del hexadecimal declarado.
 */
export function flattenAlpha(hex: string, background: string): string {
  const n = hex.replace("#", "")
  if (n.length !== 8) return hex
  const alpha = parseInt(n.slice(6, 8), 16) / 255
  const bg = background.replace("#", "")
  const canal = (i: number) =>
    Math.round(parseInt(n.slice(i, i + 2), 16) * alpha + parseInt(bg.slice(i, i + 2), 16) * (1 - alpha))
  return `#${[0, 2, 4].map((i) => canal(i).toString(16).padStart(2, "0")).join("")}`
}

export function contrastRatio(a: number, b: number): number {
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}
