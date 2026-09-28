// Cuánto JS pide una página al abrir. Se mide sobre el HTML prerenderizado del build: todo chunk
// que aparece ahí —como <script>, como preload o dentro del payload RSC— el navegador lo baja
// para hidratar. Lo que se pide después (una demo al hacer scroll, el buscador con ⌘K) no está
// en el HTML y no cuenta: es justo la diferencia que el presupuesto quiere cuidar.
import { gzipSync } from "node:zlib"

/** KB de JS comprimido que puede pedir una página al abrir. Ver la spec de 2026-09-28. */
export const BUDGET_KB = 200

/**
 * Las rutas que tienen su propio límite. Cada uno es lo medido el 2026-09-28, después de diferir
 * todo lo diferible, más un 5 % y redondeado para arriba a 5 KB: alcanza para que un cambio chico
 * no rompa el CI y no tanto como para que un salto pase sin que se vea.
 */
export const LIMITS = {
  // 305 KB. Recharts entra por la primera demo, que se carga al abrir (`DemoSlot` eager): es lo
  // que se ve arriba de todo, y diferirla dejaría un hueco del alto de un gráfico.
  "/docs/components/chart": 325,
  // 295 KB. Todo lo que pide está a la vista y prerenderizado: los controles y la muestra con
  // Select, DropdownMenu, Dialog, Tabs, Slider… Diferirlo sería dejar la pantalla sin hidratar.
  "/docs/playground": 310,
}

/** El límite de una ruta: el suyo si lo tiene, si no `BUDGET_KB`. */
export const limitOf = (route) => LIMITS[route] ?? BUDGET_KB

// Una de cada tipo de página, más la demo más pesada (Chart, con Recharts) para que su peso
// no se cuele al arranque de las demás.
export const ROUTES = [
  "/",
  "/docs/instalacion",
  "/docs/components/button",
  "/docs/components/chart",
  "/docs/playground",
  "/docs/iconos",
  "/docs/requests",
]

/**
 * Los chunks de Next que referencia un HTML, sin repetir.
 *
 * Los `<script noModule>` no cuentan: un navegador que entiende `type="module"` —todos los que
 * soporta Next 16— no los baja. Es el polyfill de core-js que Next agrega a cada página, ~38 KB
 * gzip que el presupuesto sumaba en las siete rutas sin que nadie los pidiera. Se saca la
 * etiqueta entera antes de buscar: si el mismo chunk apareciera además como preload o en el
 * payload, ahí sí se cuenta.
 */
export function chunkRefs(html) {
  // El atributo exacto, precedido de un espacio: `\bnomodule\b` también agarraba `data-nomodule`
  // y un `src` con «nomodule» en el nombre.
  const sinNoModule = html.replace(/<script\b[^>]*\snomodule(?=[\s=>\/])[^>]*>(?:<\/script>)?/gi, "")
  return [...new Set(sinNoModule.match(/\/_next\/static\/chunks\/[\w.-]+\.js/g) ?? [])]
}

/** Suma el gzip de cada chunk. `readChunk` recibe la ruta pública y devuelve el archivo. */
export function measure(html, readChunk) {
  const files = chunkRefs(html)
  const bytes = files.reduce((total, src) => total + gzipSync(readChunk(src)).length, 0)
  return { files: files.length, bytes, kb: Math.round(bytes / 1024) }
}
