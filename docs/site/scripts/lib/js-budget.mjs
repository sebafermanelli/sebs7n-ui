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
  // 328 KB el 2026-10-02: el Inicio del template de dashboard usa solo las barras de Recharts y
  // Turbopack partió la librería en dos chunks; esta página paga ~15 KB por la división.
  "/docs/components/chart": 345,
  // 295 KB. Todo lo que pide está a la vista y prerenderizado: los controles y la muestra con
  // Select, DropdownMenu, Dialog, Tabs, Slider… Diferirlo sería dejar la pantalla sin hidratar.
  // 316 KB el 2026-10-03 (antes 309). Todo lo que suma está a la vista: el Tabs con desborde, la tabla
  // `sm`, el DataTable y los controles nuevos de la muestra. Medido 316 + 5 % → 335.
  "/docs/playground": 335,
  // 277 KB el 2026-10-02 (cuando era la raíz del template). Una pantalla entera a propósito:
  // DataTable con DropdownMenu por fila, Dialog con Form y Select, Sheet de detalle, AlertDialog.
  "/templates/dashboard/invoices": 360,
  // Las otras secciones del template, medidas el 2026-10-02. La base es el layout (~244 KB): AppShell,
  // Sidebar, UserMenu con su menú y el store; el gráfico de Inicio no cuenta (es `lazy`, post-hidratación).
  // 274 KB: el layout + el diálogo de alta (Dialog, Form, Select).
  "/templates/dashboard": 300,
  // 244 KB: el layout + List, SearchField y EmptyState.
  "/templates/dashboard/customers": 295,
  // 276 KB: el layout + Tabs, Form, RadioGroup, Select y Switch.
  // 316 KB el 2026-10-03: las secciones-card de Configuración (SettingsSection) con Equipo, Notificaciones y la
  // barra de guardado; medido + 5 % redondeado a 5 KB.
  "/templates/dashboard/settings": 335,
  // Dashboard y consola, medidos el 2026-10-02 después de sumar notificaciones, atajos, filtros, equipo,
  // detalle de cliente, alta de servicio y costos. La paleta ⌘K se pide recién al abrirla (`dynamic`);
  // sin eso cada ruta pagaba ~20 KB más. La landing carga su `ThemeSwitcher` igual: de 238 a 180 KB.
  "/templates/console": 335,
  "/templates/console/deployments": 325,
  // 306 KB el 2026-10-03 (+5 % → 325): la tabla de logs con `FilterBar` y el DataTable `sm`, ya sin el
  // tooltip del `CopyButton` (que es `lazy` desde 2.10.0).
  "/templates/console/logs": 325,
  "/templates/console/costs": 300,
  "/templates/console/resources": 300,
  "/templates/console/alerts": 345,
  "/templates/dashboard/login": 290,
  // 313 KB el 2026-10-03 (+5 % → 330): lo mismo que los logs más el formulario de alta de variables.
  "/templates/console/variables": 330,
  // El blog (2026-10-02), de Server Components: paga la barra, el selector de tema diferido y, en la
  // portada, el filtro y el formulario. 198 KB la portada y 204 KB un artículo (el índice flotante).
  // Blog 225 KB con el `Select` de etiquetas y la `FilterBar` (antes 198). El login (273 KB) pesa más que
  // el Inicio (262): AuthLayout, PasswordInput y OtpField entran al abrir; candidato a diferir el 2FA.
  "/templates/blog": 240,
  "/templates/blog/despliegues-sin-miedo": 215,
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
  "/templates",
  "/templates/dashboard",
  "/templates/dashboard/invoices",
  "/templates/dashboard/customers",
  "/templates/dashboard/settings",
  "/templates/dashboard/login",
  "/templates/landing",
  "/templates/console",
  "/templates/console/deployments",
  "/templates/console/logs",
  "/templates/console/costs",
  "/templates/console/resources",
  "/templates/console/alerts",
  "/templates/console/variables",
  "/templates/blog",
  "/templates/blog/despliegues-sin-miedo",
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
