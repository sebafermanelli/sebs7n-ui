// Copia la guía para agentes del sitio al paquete (`agents/guia.md`), para que un agente la
// encuentre en `node_modules/sebs7n-ui` sin internet y en la versión instalada. La fuente es una
// sola: `docs/site/content/pages/guia-agentes.md`. Corre en `prepack`; el archivo no se commitea.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

export const SITE = "https://ui.sebastianfermanelli.com"

/** La guía con encabezado y los links del sitio (`](/…)`) pasados a absolutos. */
export function buildAgentGuide({ source, version, site = SITE }) {
  const body = source.replace(/\]\(\//g, `](${site}/`)
  return [
    `# Guía para agentes — sebs7n-ui ${version}`,
    "",
    `> Las reglas de sistema y la anatomía de una app. Es la misma página que ${site}/docs/guia-agentes, en la versión que tenés instalada. Índice completo para agentes: ${site}/llms.txt.`,
    "",
    body.trim(),
    "",
  ].join("\n")
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL("..", import.meta.url)
  const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"))
  const source = readFileSync(new URL("docs/site/content/pages/guia-agentes.md", root), "utf8")
  mkdirSync(new URL("agents/", root), { recursive: true })
  writeFileSync(new URL("agents/guia.md", root), buildAgentGuide({ source, version: pkg.version }))
  console.log(`[agent-guide] agents/guia.md (${pkg.version})`)
}
