// El template de dashboard, leído del disco para dos salidas: su `.md` (para agentes) y su bloque
// del registry (para `shadcn add`). Se lee al generar, así que ninguna de las dos se desincroniza
// del template que se ve en el sitio.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

// El orden en que conviene leerlo: la estructura primero, los detalles al final.
const GROUPS = ["layout.tsx", "page.tsx", "invoices/", "customers/", "settings/", "_lib/", "_state/", "_data/", "_components/"]
const rank = (path) => {
  const index = GROUPS.findIndex((group) => (group.endsWith("/") ? path.startsWith(group) : path === group))
  return index === -1 ? GROUPS.length : index
}

function walk(dir, base = dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full, base) : [relative(base, full)]
  })
}

/** Los archivos del template: `{ path, content }`, en el orden de lectura. */
export function readTemplate(dir) {
  return walk(dir)
    .filter((path) => /\.(tsx?|mjs)$/.test(path))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((path) => ({ path, content: readFileSync(join(dir, path), "utf8") }))
}

/** `_lib/routes.ts` para el bloque: rutas en `/dashboard` y sin vuelta a la galería. */
export function blockRoutes(source) {
  const out = source
    .replace('export const DASHBOARD_PATH = "/templates/dashboard"', 'export const DASHBOARD_PATH = "/dashboard"')
    .replace('export const GALLERY_PATH: string | null = "/templates"', "export const GALLERY_PATH: string | null = null")
  // Si alguien cambia `routes.ts` y los reemplazos dejan de encontrar su texto, el bloque saldría
  // apuntando a `/templates`: mejor cortar el generate. Mira solo el código: el comentario de
  // `GALLERY_PATH` nombra la galería a propósito.
  const replaced = out.includes('DASHBOARD_PATH = "/dashboard"') && out.includes("GALLERY_PATH: string | null = null")
  if (!replaced || /^export .*\/templates/m.test(out)) throw new Error("template-block: routes.ts cambió y el bloque quedaría con /templates")
  return out
}

const fence = (path) => (path.endsWith(".tsx") ? "tsx" : path.endsWith(".ts") ? "ts" : "js")

/** El `.md` del template: el texto a mano y, después, el código de cada archivo. */
export function templateMarkdown({ intro, files }) {
  const code = files.map((file) => [`### \`${file.path}\``, "", "```" + fence(file.path), file.content.trim(), "```", ""].join("\n"))
  return [intro.trim(), "", "## El código", "", "Cada archivo con su ruta dentro de la carpeta del dashboard.", "", ...code].join("\n")
}

/** El ítem `dashboard` del registry: copia las páginas e instala el paquete; no copia componentes. */
export function buildDashboardBlock({ files, site, author }) {
  return {
    $schema: ITEM_SCHEMA,
    name: "dashboard",
    type: "registry:block",
    title: "Dashboard operativo",
    description:
      "El template SaaS de sebs7n-ui: Inicio, Facturas, Clientes y Configuración con el estado compartido. Importa del paquete; la app cambia los datos de `_data/`.",
    author,
    docs: `Guía: ${site}/docs/guia-agentes.md · Template: ${site}/templates/dashboard.md. Necesita el Toaster de sonner y el ThemeProvider de next-themes montados (ver ${site}/docs/instalacion).`,
    dependencies: ["sebs7n-ui", "sonner", "lucide-react", "recharts", "next-themes"],
    files: files.map((file) => ({
      path: `registry/sebs7n-ui/blocks/dashboard/${file.path}`,
      type: "registry:file",
      target: `app/dashboard/${file.path}`,
      content: file.path === "_lib/routes.ts" ? blockRoutes(file.content) : file.content,
    })),
  }
}
