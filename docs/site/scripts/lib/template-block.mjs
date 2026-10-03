// El template de dashboard, leído del disco para dos salidas: su `.md` (para agentes) y su bloque
// del registry (para `shadcn add`). Se lee al generar, así que ninguna de las dos se desincroniza
// del template que se ve en el sitio.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

// El orden en que conviene leerlo: la estructura primero, los detalles al final.
const GROUPS = ["layout.tsx", "page.tsx", "invoices/", "customers/page.tsx", "customers/", "settings/", "services/", "deployments/", "logs/", "costs/", "variables/", "[slug]/", "login/", "resources/", "alerts/", "_lib/", "_state/", "_data/", "_components/"]
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

/** `_lib/routes.ts` de la consola: rutas en `/console` y sin vuelta a la galería. */
export function consoleRoutes(source) {
  const out = withoutGallery(source).replace('export const CONSOLE_PATH = "/templates/console"', 'export const CONSOLE_PATH = "/console"')
  if (!out.includes('CONSOLE_PATH = "/console"') || /^export .*\/templates/m.test(out)) throw new Error("template-block: routes.ts cambió y el bloque quedaría con /templates")
  return out
}

/** `_lib/routes.ts` del blog: rutas en `/blog` y sin vuelta a la galería. */
export function blogRoutes(source) {
  const out = withoutGallery(source).replace('export const BLOG_PATH = "/templates/blog"', 'export const BLOG_PATH = "/blog"')
  if (!out.includes('BLOG_PATH = "/blog"') || /^export .*\/templates/m.test(out)) throw new Error("template-block: routes.ts cambió y el bloque quedaría con /templates")
  return out
}

/** `_lib/routes.ts` de un template sin más rutas que la galería: fuera del sitio no hay galería. */
export function withoutGallery(source) {
  const out = source.replace('export const GALLERY_PATH: string | null = "/templates"', "export const GALLERY_PATH: string | null = null")
  if (out === source) throw new Error("template-block: routes.ts cambió y el bloque quedaría con /templates")
  return out
}

const fence = (path) => (path.endsWith(".tsx") ? "tsx" : path.endsWith(".ts") ? "ts" : "js")

/** El `.md` del template: el texto a mano y, después, el código de cada archivo. */
export function templateMarkdown({ intro, files }) {
  const code = files.map((file) => [`### \`${file.path}\``, "", "```" + fence(file.path), file.content.trim(), "```", ""].join("\n"))
  return [intro.trim(), "", "## El código", "", "Cada archivo con su ruta dentro de la carpeta del dashboard.", "", ...code].join("\n")
}

/**
 * Los templates de la galería que viajan como `.md` y como bloque. Uno nuevo es una entrada acá, su
 * carpeta en `app/templates/<slug>` y su texto en `content/templates/<slug>.md`.
 */
export const TEMPLATES = [
  {
    slug: "dashboard",
    title: "Template: dashboard operativo",
    blockTitle: "Dashboard operativo",
    description:
      "Una app entera (Inicio, Facturas, Clientes, Configuración) para copiar la estructura y cambiar los datos; con el código de cada archivo.",
    blockDescription:
      "El template SaaS de sebs7n-ui: Inicio, Facturas, Clientes y Configuración con el estado compartido. Importa del paquete; la app cambia los datos de `_data/`.",
    // Los peers del paquete van explícitos: `@base-ui/react` llega por su cuenta solo si la app hizo
    // `shadcn init` con el estilo base-nova (lo comprobó la prueba real del bloque).
    dependencies: ["sebs7n-ui", "@base-ui/react", "@dnd-kit/core", "sonner", "lucide-react", "recharts", "next-themes"],
    transform: (file) => (file.path === "_lib/routes.ts" ? blockRoutes(file.content) : file.content),
  },
  {
    slug: "landing",
    title: "Template: landing page",
    blockTitle: "Landing page",
    description:
      "El default para landings y páginas de marketing: hero, logos, beneficios, precios, testimonios, preguntas y cierre sobre el wallpaper; con el código de cada archivo.",
    blockDescription:
      "La landing de sebs7n-ui: hero, logos, beneficios, precios, testimonios, preguntas y cierre. Importa del paquete; la app cambia el texto de `_data/content.ts`.",
    dependencies: ["sebs7n-ui", "@base-ui/react", "lucide-react", "next-themes"],
    transform: (file) => (file.path === "_lib/routes.ts" ? withoutGallery(file.content) : file.content),
  },
  {
    slug: "console",
    title: "Template: consola PaaS / cloud",
    blockTitle: "Consola PaaS / cloud",
    description:
      "Una consola de infraestructura (Servicios, Despliegues con visor de logs, Variables de entorno) con selector de proyecto y ⌘K; con el código de cada archivo.",
    blockDescription:
      "La consola cloud de sebs7n-ui: selector de proyecto, Servicios, Despliegues en SplitView con visor de logs y Variables de entorno. Importa del paquete; la app cambia los datos de `_data/`.",
    dependencies: ["sebs7n-ui", "@base-ui/react", "sonner", "lucide-react", "next-themes"],
    transform: (file) => (file.path === "_lib/routes.ts" ? consoleRoutes(file.content) : file.content),
  },
  {
    slug: "blog",
    title: "Template: blog / editorial",
    blockTitle: "Blog / editorial",
    description:
      "Lectura primero: portada con filtro por etiquetas y artículo con índice flotante, roles tipográficos y artículos relacionados; con el código de cada archivo.",
    blockDescription:
      "El blog de sebs7n-ui: portada con búsqueda y etiquetas, artículo con índice flotante y suscripción. Importa del paquete; la app cambia los artículos de `_data/posts.ts`.",
    dependencies: ["sebs7n-ui", "@base-ui/react", "sonner", "lucide-react", "next-themes"],
    transform: (file) => (file.path === "_lib/routes.ts" ? blogRoutes(file.content) : file.content),
  },
]

/** El ítem del registry de un template: copia su carpeta e instala el paquete; no copia componentes. */
export function buildTemplateBlock({ template, files, site, author }) {
  return {
    $schema: ITEM_SCHEMA,
    name: template.slug,
    type: "registry:block",
    title: template.blockTitle,
    description: template.blockDescription,
    author,
    docs: `Guía: ${site}/docs/guia-agentes.md · Template: ${site}/templates/${template.slug}.md. Necesita lo de ${site}/docs/instalacion (el tema, la fuente, el ThemeProvider y el Toaster).`,
    dependencies: template.dependencies,
    files: files.map((file) => ({
      path: `registry/sebs7n-ui/blocks/${template.slug}/${file.path}`,
      type: "registry:file",
      target: `app/${template.slug}/${file.path}`,
      content: template.transform(file),
    })),
  }
}

/** El del dashboard, que es el que usan los tests y el que vino primero. */
export const buildDashboardBlock = ({ files, site, author }) => buildTemplateBlock({ template: TEMPLATES[0], files, site, author })
