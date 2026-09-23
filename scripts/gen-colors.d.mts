/**
 * Tipos de `gen-colors.mjs`, que se escribe en JavaScript porque lo corre `npm run tokens`
 * sin pasar por `tsc`. Los declara acá para que el `import` desde `test/tokens.test.ts`
 * tipe de verdad: estaba como `unknown`, así que el test podía pasarle cualquier cosa.
 */

/** Una escala: paso → hexadecimal (`{ "100": "#f2f2f2", … }`). El paso es string, como viene del JSON. */
export type ColorScale = Record<string, string>

/**
 * `tokens/geist.json`: el mismo juego de escalas en claro y en oscuro.
 *
 * `source` va en el encabezado del CSS generado —de dónde salieron los valores— y `notas`
 * es texto libre para el humano que abra el JSON: el generador no la lee.
 */
export type ColorTokens = {
  source: string
  notas?: unknown
  light: Record<string, ColorScale>
  dark: Record<string, ColorScale>
}

/** Devuelve el contenido completo de `src/styles/colors.css`. */
export function renderColors(tokens: ColorTokens): string
