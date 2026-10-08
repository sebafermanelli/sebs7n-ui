// Pruebas visuales del motor de tema (3.0): una pantalla de referencia por preset y por combinación clave (claro/oscuro, densidades,
// radios, alto contraste), comparada contra una línea base de capturas.
//
//   npm run visual            compara contra `visual/baseline/*.png` y escribe las diferencias en `visual/diff/`
//   npm run visual:update     regenera la línea base (después de un cambio visual intencional: revisá las imágenes antes de commitear)
//
// Necesita el sitio en :4100 (`npm run dev`), el paquete compilado (`npm run build` en la raíz: se importa `dist/lib/theme.js`) y el CLI
// `agent-browser` (Chromium), que ya usa quien mantiene el sitio: no suma ninguna dependencia al paquete ni al sitio. La comparación es de
// píxeles (`agent-browser diff screenshot`, umbral de color 0,1) y falla si más del 0,5 % de la imagen cambió.
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = join(aqui, "..")
const { createTheme, PRESETS } = await import(join(raiz, "../../dist/lib/theme.js"))

const update = process.argv.includes("--update")
const base = process.env.SITE_URL ?? "http://localhost:4100"
const baseline = join(raiz, "visual/baseline")
const diffDir = join(raiz, "visual/diff")
const MAX_CAMBIO = 0.5 // % de píxeles

const PANTALLAS = { inicio: "/templates/dashboard", facturas: "/templates/dashboard/invoices" }

/** Los casos: cada preset en claro y oscuro sobre «inicio», y combinaciones clave sobre «facturas» (donde se ve la densidad). */
const casos = [
  ...Object.values(PRESETS).flatMap((preset) => ["light", "dark"].map((tema) => ({ id: `preset-${preset.id}-${tema}`, pantalla: "inicio", tema, config: preset.config }))),
  { id: "combo-densidad-compacta", pantalla: "facturas", tema: "light", config: { density: "compact" } },
  { id: "combo-densidad-comoda", pantalla: "facturas", tema: "light", config: { density: "comfortable" } },
  { id: "combo-radios-rectos", pantalla: "facturas", tema: "light", config: { shape: "sharp" } },
  { id: "combo-radios-redondos", pantalla: "facturas", tema: "light", config: { shape: "round" } },
  { id: "combo-alto-contraste-claro", pantalla: "facturas", tema: "light", config: { contrast: "high" } },
  { id: "combo-alto-contraste-oscuro", pantalla: "facturas", tema: "dark", config: { contrast: "high" } },
]

const ab = (...args) => execFileSync("agent-browser", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
const ATRIBUTOS = ["data-shape", "data-density", "data-surface", "data-motion", "data-contrast", "data-neutral-tint", "data-grain", "data-type-scale", "data-type-tracking"]

mkdirSync(baseline, { recursive: true })
rmSync(diffDir, { recursive: true, force: true })
mkdirSync(diffDir, { recursive: true })
ab("set", "viewport", "1280", "900")

let fallas = 0
for (const caso of casos) {
  const tema = createTheme(caso.config)
  const vars = { ...tema.variables.light, ...tema.variables.dark }
  ab("set", "media", caso.tema, "reduced-motion")
  ab("open", `${base}${PANTALLAS[caso.pantalla]}`)
  ab("wait", "1500")
  const script = `(() => {
    const r = document.documentElement;
    ${JSON.stringify(ATRIBUTOS)}.forEach((a) => r.removeAttribute(a));
    Object.entries(${JSON.stringify(tema.attributes)}).forEach(([k, v]) => r.setAttribute(k, v));
    Object.entries(${JSON.stringify(vars)}).forEach(([k, v]) => r.style.setProperty(k, v));
    return 1
  })()`
  ab("eval", script)
  ab("wait", "400")
  const archivo = join(baseline, `${caso.id}.png`)
  if (update || !existsSync(archivo)) {
    ab("screenshot", archivo)
    console.log(`${update ? "actualizada" : "nueva"}  ${caso.id}`)
    continue
  }
  const salida = ab("diff", "screenshot", "--baseline", archivo, "--output", join(diffDir, `${caso.id}.png`), "--threshold", "0.1")
  const m = salida.match(/([\d.]+)\s*%/)
  const cambio = m ? Number(m[1]) : /match|identical|0 pixels/i.test(salida) ? 0 : NaN
  const ok = Number.isFinite(cambio) && cambio <= MAX_CAMBIO
  if (!ok) fallas++
  console.log(`${ok ? "ok    " : "CAMBIÓ"}  ${caso.id}  ${Number.isFinite(cambio) ? `${cambio}%` : salida.trim().slice(0, 80)}`)
}
writeFileSync(join(raiz, "visual/README.md"), `# Línea base visual del motor de tema\n\nCapturas de referencia (1280 × 900, \`prefers-reduced-motion\`). Se regeneran con \`npm run visual:update\` y se comparan con \`npm run visual\`.\nVer \`scripts/visual-themes.mjs\`.\n\n${casos.map((c) => `- \`${c.id}\``).join("\n")}\n`)
if (fallas) {
  console.error(`\n${fallas} caso(s) cambiaron más del ${MAX_CAMBIO} %: mirá visual/diff/. Si el cambio es intencional, \`npm run visual:update\`.`)
  process.exit(1)
}
