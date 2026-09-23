// Todo lo generado del sitio, en un solo paso. Corre en `predev`, `prebuild` y `pretest`.
//
//   .generated/site.json      el modelo que leen las páginas
//   .generated/search.json    el índice del buscador
//   app/_demos/registry.ts    id de demo → componente React
//   public/docs/**.md         cada página como markdown plano
//   public/llms.txt           el índice para agentes
//   public/llms-full.txt      todo concatenado
//   public/r/*.json           el registry con formato shadcn
//   registry.json             el registry completo, en la raíz del sitio
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { COMPONENTS, GROUPS, PROP_DESCRIPTIONS } from "../content/meta.mjs"
import { extractExamples } from "./lib/examples.mjs"
import { componentMarkdown, llmsTxt, pageMarkdown, table } from "./lib/markdown.mjs"
import { componentSlugs, extractProps } from "./lib/props.mjs"
import { buildRegistry } from "./lib/registry.mjs"
import { readBackgrounds, readColors, readRadii, readShadows, readTypography } from "./lib/tokens.mjs"

const here = join(dirname(fileURLToPath(import.meta.url)), "..")
const root = join(here, "..", "..")
const SITE = "https://ui.sebastianfermanelli.com"
const AUTHOR = "sebafermanelli <https://github.com/sebafermanelli>"
const BLURB =
  "Design system para React: Geist (el lenguaje visual de Vercel) sobre las primitivas de shadcn/ui base-nova (Base UI), empaquetado como una sola dependencia. Tailwind v4, Base UI, React 19, Next 15/16."

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))

// ── 1. Props desde el TypeScript ─────────────────────────────────────────────
const slugs = componentSlugs(root)
const missing = slugs.filter((slug) => !COMPONENTS[slug])
if (missing.length) throw new Error(`Falta metadata en content/meta.mjs para: ${missing.join(", ")}`)
const extraneous = Object.keys(COMPONENTS).filter((slug) => !slugs.includes(slug))
if (extraneous.length) throw new Error(`content/meta.mjs describe componentes que no existen: ${extraneous.join(", ")}`)

const propsBySlug = extractProps({
  root,
  files: slugs.map((slug) => `src/components/${slug}.tsx`),
  documented: (slug, component) => Object.keys(COMPONENTS[slug]?.props?.[component] ?? {}),
})

// ── 2. Ejemplos desde app/_demos ─────────────────────────────────────────────
const demosDir = join(here, "app/_demos")
const demoFiles = readdirSync(demosDir).filter((file) => file.endsWith(".tsx") && file !== "registry.tsx")
const examplesBySlug = new Map(demoFiles.map((file) => [basename(file, ".tsx"), extractExamples(join(demosDir, file))]))

// ── 3. Modelo del sitio ──────────────────────────────────────────────────────
const components = slugs.map((slug) => {
  const meta = COMPONENTS[slug]
  const exports = propsBySlug.get(slug) ?? []
  const source = readFileSync(join(root, `src/components/${slug}.tsx`), "utf8")
  const names = exports.map((exported) => exported.name)
  return {
    slug,
    title: meta.title,
    group: meta.group,
    description: meta.description,
    detallado: Boolean(meta.detallado),
    useClient: source.startsWith('"use client"'),
    importLine: `import { ${names.slice(0, 4).join(", ")}${names.length > 4 ? ", …" : ""} } from "sebs7n-ui/${slug}"`,
    exports: exports.map((exported) => ({
      ...exported,
      props: exported.props.map((prop) => ({
        ...prop,
        description: meta.props?.[exported.name]?.[prop.name] ?? prop.description ?? PROP_DESCRIPTIONS[prop.name] ?? "",
      })),
    })),
    examples: examplesBySlug.get(slug) ?? [],
    keyboard: meta.keyboard ?? [],
    a11y: meta.a11y ?? [],
    usage: meta.usage ?? [],
    related: meta.related ?? [],
  }
})

for (const component of components) {
  if (!component.examples.length) throw new Error(`Falta app/_demos/${component.slug}.tsx con al menos una demo`)
}

// Una descripción escrita en meta.mjs para una prop que no existe es trabajo que
// nadie va a ver: ni como fila propia ni como heredada. Antes pasaba en silencio.
const fantasmas = []
for (const slug of slugs) {
  for (const [exportado, props] of Object.entries(COMPONENTS[slug].props ?? {})) {
    const reales = components.find((component) => component.slug === slug).exports.find((entry) => entry.name === exportado)
    if (!reales) {
      fantasmas.push(`${slug}: meta.props describe "${exportado}", que no es un export del componente`)
      continue
    }
    for (const prop of Object.keys(props)) {
      if (!reales.props.some((entry) => entry.name === prop)) fantasmas.push(`${slug}.${exportado}.${prop}`)
    }
  }
}
if (fantasmas.length) throw new Error(`meta.mjs describe props que no existen:\n  ${fantasmas.join("\n  ")}`)

// ── 4. Páginas de sistema ────────────────────────────────────────────────────
const colors = readColors(root)
const typography = readTypography(root)

const colorTables = colors.groups
  .filter((group) => group !== "background")
  .map((group) => {
    const steps = colors.steps(group)
    return [
      `### ${group}`,
      "",
      table(
        ["Paso", "Claro", "Oscuro"],
        steps.map((step) => [`\`${group}-${step}\``, colors.light[group][step], colors.dark[group][step]])
      ),
    ].join("\n")
  })
  .join("\n\n")

const backgroundsTable = table(
  ["Token", "Rol", "Claro", "Oscuro"],
  readBackgrounds(root).map((row) => [`\`${row.token}\``, row.rol, row.light, row.dark])
)

const typographyTable = table(
  ["Utilidad", "Tamaño", "Interlineado", "Peso", "Tracking"],
  typography.map((entry) => [`\`${entry.name}\``, entry.size, entry.leading, entry.weight, entry.tracking])
)

const radiiTable = table(
  ["Utilidad", "Valor"],
  readRadii(root).map((radius) => [`\`rounded-${radius.name}\``, radius.value])
)

const shadowsTable = table(
  ["Utilidad", "Dónde"],
  readShadows(root).map((shadow) => [`\`${shadow.name}\``, shadow.uso])
)

const substitutions = {
  colores: colorTables,
  fondos: backgroundsTable,
  tipografia: typographyTable,
  radios: radiiTable,
  sombras: shadowsTable,
}

function loadPage(slug) {
  const body = readFileSync(join(here, `content/pages/${slug}.md`), "utf8")
  return body.replace(/\{\{([a-z]+)\}\}/g, (match, key) => substitutions[key] ?? match)
}

/** CHANGELOG.md sale del repo: una sola copia, la del paquete. */
function loadRepoDoc(file) {
  const body = readFileSync(join(root, file), "utf8")
  return body.replace(/^#\s+.*\n/, "").trim()
}

const pages = [
  {
    slug: "instalacion",
    title: "Instalación",
    description: "Una dependencia, un `@import` y cuatro variables de marca.",
    body: loadPage("instalacion"),
  },
  {
    slug: "tokens",
    title: "Tokens",
    description: "Color, tipografía, radios y sombras. Los valores salen de `tokens/geist.json` y de `theme.css`.",
    body: loadPage("tokens"),
  },
  {
    slug: "theming",
    title: "Theming",
    description: "Cuatro variables de marca, claro y oscuro, radio y densidad.",
    body: loadPage("theming"),
  },
  {
    slug: "accesibilidad",
    title: "Accesibilidad",
    description: "Lo que garantiza el paquete y lo que le queda a la app.",
    body: loadPage("accesibilidad"),
  },
  {
    slug: "reglas",
    title: "Reglas de uso",
    description: "Las decisiones que no se ven en una tabla de props.",
    body: loadPage("reglas"),
  },
  {
    slug: "changelog",
    title: "Changelog",
    description: `Todas las versiones, hasta la ${pkg.version}.`,
    body: loadRepoDoc("CHANGELOG.md"),
  },
]

// ── 5. Navegación y búsqueda ─────────────────────────────────────────────────
const nav = [
  { id: "sistema", title: "Sistema", items: pages.map((page) => ({ title: page.title, href: `/docs/${page.slug}` })) },
  ...GROUPS.map((group) => ({
    id: group.id,
    title: group.title,
    items: components
      .filter((component) => component.group === group.id)
      .map((component) => ({ title: component.title, href: `/docs/components/${component.slug}` })),
  })),
]

const search = [
  ...pages.map((page) => ({
    title: page.title,
    href: `/docs/${page.slug}`,
    group: "Sistema",
    description: page.description,
    keywords: page.body
      .split("\n")
      .filter((line) => line.startsWith("## "))
      .map((line) => line.slice(3))
      .join(" "),
  })),
  ...components.map((component) => ({
    title: component.title,
    href: `/docs/components/${component.slug}`,
    group: GROUPS.find((group) => group.id === component.group).title,
    description: component.description,
    keywords: [component.slug, ...component.exports.map((exported) => exported.name), ...component.related].join(" "),
  })),
]

// ── 6. Escribir ──────────────────────────────────────────────────────────────
const generated = join(here, ".generated")
mkdirSync(generated, { recursive: true })
writeFileSync(
  join(generated, "site.json"),
  JSON.stringify({ version: pkg.version, site: SITE, blurb: BLURB, groups: GROUPS, components, pages, nav }, null, 2)
)
writeFileSync(join(generated, "search.json"), JSON.stringify(search, null, 2))

// Registro de demos: id → componente. Lo escribe el generador para que no haya
// una lista a mano que se desactualice al agregar una demo.
const registryLines = [
  "// Generado por scripts/generate.mjs. No editar.",
  ...demoFiles.map((file) => `import * as ${varName(basename(file, ".tsx"))} from "./${basename(file, ".tsx")}"`),
  "",
  "export const DEMOS: Record<string, () => React.JSX.Element> = {",
  ...[...examplesBySlug.entries()].flatMap(([slug, examples]) =>
    examples.map((example) => `  ${JSON.stringify(example.id)}: ${varName(slug)}.${example.component},`)
  ),
  "}",
  "",
]
writeFileSync(join(demosDir, "registry.ts"), registryLines.join("\n"))

/** `toggle-group` → `demoToggleGroup`. El prefijo evita chocar con palabras reservadas (`switch`). */
function varName(slug) {
  const camel = slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  return `demo${camel[0].toUpperCase()}${camel.slice(1)}`
}

// Markdown plano, uno por página.
const publicDir = join(here, "public")
rmSync(join(publicDir, "docs"), { recursive: true, force: true })
rmSync(join(publicDir, "r"), { recursive: true, force: true })
mkdirSync(join(publicDir, "docs/components"), { recursive: true })
mkdirSync(join(publicDir, "r"), { recursive: true })

const markdowns = []
for (const page of pages) {
  const text = pageMarkdown(page)
  markdowns.push({ href: `/docs/${page.slug}`, title: page.title, description: page.description, text })
  writeFileSync(join(publicDir, `docs/${page.slug}.md`), text)
}
for (const component of components) {
  const text = componentMarkdown(component)
  markdowns.push({
    href: `/docs/components/${component.slug}`,
    title: component.title,
    description: component.description,
    text,
  })
  writeFileSync(join(publicDir, `docs/components/${component.slug}.md`), text)
}

// llms.txt + llms-full.txt
writeFileSync(
  join(publicDir, "llms.txt"),
  llmsTxt({
    site: SITE,
    blurb: BLURB,
    sections: [
      { title: "Sistema", items: pages.map((page) => ({ ...page, href: `/docs/${page.slug}` })) },
      ...GROUPS.map((group) => ({
        title: group.title,
        items: components
          .filter((component) => component.group === group.id)
          .map((component) => ({
            title: component.title,
            description: component.description,
            href: `/docs/components/${component.slug}`,
          })),
      })),
      {
        title: "Opcional",
        items: [
          {
            title: "Registry",
            description: "Índice de ítems con formato shadcn, para `shadcn add <url>/r/<item>.json`.",
            // `/registry` y `/registry.md` nunca existieron: el archivo que se
            // sirve es este, y es el que hay que linkear.
            url: `${SITE}/r/registry.json`,
          },
        ],
      },
    ],
  })
)

writeFileSync(
  join(publicDir, "llms-full.txt"),
  [
    `# sebs7n-ui ${pkg.version}`,
    "",
    `> ${BLURB}`,
    "",
    `Generado de ${SITE}. Cada sección es una página del sitio; la misma URL + ".md" devuelve solo esa sección.`,
    "",
    ...markdowns.map((entry) => ["---", "", `Fuente: ${SITE}${entry.href}`, "", entry.text].join("\n")),
  ].join("\n")
)

// Registry
const registry = buildRegistry({
  root,
  site: SITE,
  author: AUTHOR,
  components: components.map((component) => ({
    slug: component.slug,
    title: component.title,
    description: component.description,
  })),
})
writeFileSync(join(here, "registry.json"), JSON.stringify(registry, null, 2))
writeFileSync(
  join(publicDir, "r/registry.json"),
  JSON.stringify({ ...registry, items: registry.items.map(({ files, ...rest }) => rest) }, null, 2)
)
for (const item of registry.items) {
  writeFileSync(join(publicDir, `r/${item.name}.json`), JSON.stringify(item, null, 2))
}

console.log(
  `[generate] ${components.length} componentes · ${pages.length} páginas de sistema · ` +
    `${markdowns.length} .md · ${registry.items.length} ítems de registry`
)
