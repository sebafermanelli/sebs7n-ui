// axe-core en un navegador real (con contraste de color) sobre cada página de componente, en claro y en oscuro (3.0).
//
// Complementa `test/a11y-demos.test.tsx` (jsdom, sin estilos): acá sí se calculan los colores. Usa el CLI `agent-browser` (Chromium) que ya
// tiene quien mantiene el sitio; no suma ninguna dependencia al paquete. Con el sitio corriendo en :4100 (`npm run dev`):
//
//   node scripts/axe-chrome.mjs [base-url] [salida.json] [slug,slug…]
//
// Imprime un resumen por regla y escribe el detalle en `salida.json` (default: `axe-chrome.json` en el directorio actual).
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"

const base = process.argv[2] ?? "http://localhost:4100"
const salida = process.argv[3] ?? "axe-chrome.json"
const only = process.argv[4]?.split(",")
const site = JSON.parse(readFileSync(new URL("../.generated/site.json", import.meta.url), "utf8"))
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8")
const slugs = only ?? site.components.map((c) => c.slug)
// `EXTRA=/docs/playground,/templates/landing` suma páginas que no son de un componente (la home, el Playground y los templates).
const extra = (process.env.EXTRA ?? "").split(",").filter(Boolean)

const run = (...args) => execFileSync("agent-browser", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
// axe pesa ~500 kB: no entra en los argumentos del CLI, va por stdin.
const evalStdin = (script) => execFileSync("agent-browser", ["eval", "--stdin"], { encoding: "utf8", input: script, maxBuffer: 64 * 1024 * 1024 })
// Solo se miran las páginas de componentes; las reglas de página entera (región, h1) no aplican a una demo.
const SCRIPT = `(async () => {
  if (!window.axe) (0, eval)(${JSON.stringify(axeSource)})
  const r = await window.axe.run(document.querySelector("main") ?? document, { rules: { region: { enabled: false }, "landmark-one-main": { enabled: false }, "page-has-heading-one": { enabled: false } } })
  return JSON.stringify(r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.html.slice(0, 160), summary: v.nodes[0]?.failureSummary?.split("\\n").slice(0, 3).join(" ") })))
})()`

const informe = {}
run("set", "viewport", "1280", "900")
for (const tema of ["light", "dark"]) {
  run("set", "media", tema)
  for (const slug of [...slugs, ...extra]) {
    run("open", `${base}${slug.startsWith("/") ? slug : `/docs/components/${slug}`}`)
    run("wait", "1200")
    let violaciones
    try {
      violaciones = JSON.parse(JSON.parse(evalStdin(SCRIPT).trim()))
    } catch (error) {
      violaciones = [{ id: "no-se-pudo-medir", impact: "n/a", nodes: 0, sample: String(error).slice(0, 120) }]
    }
    informe[`${slug}:${tema}`] = violaciones
    if (violaciones.length) console.log(`${tema} ${slug}: ${violaciones.map((v) => `${v.id}×${v.nodes}`).join(", ")}`)
  }
}
writeFileSync(salida, JSON.stringify(informe, null, 2))
const porRegla = {}
for (const lista of Object.values(informe)) for (const v of lista) porRegla[v.id] = (porRegla[v.id] ?? 0) + v.nodes
console.log("\nResumen por regla (nodos):", porRegla)
