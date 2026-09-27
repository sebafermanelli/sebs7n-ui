// Lo que el Playground le suma al color: el veredicto de contraste de un color DE MARCA. La
// conversión y el selector ya son del paquete (`sebs7n-ui/lib/color`, `sebs7n-ui/color-picker`).
import { cssOfOklch, oklchOfHex } from "sebs7n-ui/lib/color"
import { contrastRatio, hexOfOklch, luminanceOfHex, luminanceOfOklch, type Oklch } from "sebs7n-ui/lib/contrast"

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

export { cssOfOklch, hexOfOklch, oklchOfHex, type Oklch }
