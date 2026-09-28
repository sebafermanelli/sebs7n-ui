// `npm run budget`, después de `npm run build`. Imprime una tabla por ruta y sale con 1 si
// alguna pasa el presupuesto: así CI lo corta y cada PR muestra el antes y el después.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { limitOf, measure, ROUTES } from "./lib/js-budget.mjs"

const site = fileURLToPath(new URL("..", import.meta.url))
const htmlOf = (route) => readFileSync(join(site, ".next/server/app", route === "/" ? "index.html" : `${route}.html`), "utf8")
const readChunk = (src) => readFileSync(join(site, ".next", src.replace(/^\/_next\//, "")))

let excede = false
console.log(`${"ruta".padEnd(28)}${"KB".padStart(6)}  límite  archivos`)
for (const route of ROUTES) {
  const { kb, files } = measure(htmlOf(route), readChunk)
  const limite = limitOf(route)
  const ok = kb <= limite
  if (!ok) excede = true
  console.log(`${route.padEnd(28)}${String(kb).padStart(6)}  ${String(limite).padStart(6)}  ${String(files).padStart(8)}  ${ok ? "ok" : "EXCEDE"}`)
}
process.exit(excede ? 1 : 0)
