// Registry con el formato de shadcn, verificado contra
// https://ui.shadcn.com/r/styles/new-york-v4/button.json y contra
// https://ui.shadcn.com/schema/registry-item.json (los dos esquemas están
// vendorizados en docs/site/schemas/).
//
// Sirve para `pnpm dlx shadcn@latest add https://ui.sebastianfermanelli.com/r/button.json`,
// que copia el archivo al repo de la app. No es la forma recomendada de usar
// sebs7n-ui —para eso está el paquete—, pero permite sacar un componente y editarlo.
//
// Los imports relativos del paquete se reescriben a los alias que el CLI de
// shadcn resuelve con el components.json de la app:
//   ../lib/utils.js      → @/lib/utils
//   ../lib/x.js          → @/lib/sebs7n-ui/x-helpers
//   ../internal/x.js     → @/lib/sebs7n-ui/x-helpers
//   ../variants/x.js     → @/lib/sebs7n-ui/x-variants
//   ./button.js          → @/components/ui/button
//
// Los sufijos no son decoración. El CLI de shadcn, al copiar los archivos,
// reescribe cada import buscándolo entre los archivos de ESE mismo `add`
// (update-files.ts, función `resolveImport`): primero por ruta exacta y, si no,
// **por basename**, y en el desempate gana la extensión `.tsx` sobre `.ts`.
// Con `variants/button.ts` copiado como `button.ts`, el basename `button`
// también matcheaba `components/ui/button.tsx`, ganaba el `.tsx` y el
// componente terminaba importándose a sí mismo:
// `TS2303 Circular definition of import alias 'buttonVariants'`.
// Ocho de las nueve variantes y `lib/pagination` chocaban así. Con el sufijo
// ningún basename se repite, y `assertBasenamesUnique` corta el build si
// alguna vez vuelve a pasar.
import { readdirSync, readFileSync } from "node:fs"
import { basename, extname, join } from "node:path"

const NPM = new Set(["@base-ui/react", "class-variance-authority", "clsx", "lucide-react", "next-themes", "react", "sonner", "tailwind-merge"])

/** `pagination` → `pagination-helpers`; `utils` se queda con el alias estándar de shadcn. */
const libFile = (name) => (name === "utils" ? "utils" : `${name}-helpers`)
const variantsFile = (name) => `${name}-variants`

export function rewriteImports(source) {
  return source
    .replace(/from "\.\.\/lib\/utils\.js"/g, 'from "@/lib/utils"')
    .replace(/from "\.\.\/(?:lib|internal)\/([a-z0-9-]+)\.js"/g, (_, name) => `from "@/lib/sebs7n-ui/${libFile(name)}"`)
    .replace(/from "\.\.\/variants\/([a-z0-9-]+)\.js"/g, (_, name) => `from "@/lib/sebs7n-ui/${variantsFile(name)}"`)
    .replace(/from "\.\/([a-z0-9-]+)\.js"/g, 'from "@/components/ui/$1"')
}

/** Dependencias npm: el paquete raíz de cada import externo. */
export function npmDependencies(source) {
  const deps = new Set()
  for (const [, specifier] of source.matchAll(/from "([^".][^"]*)"/g)) {
    const root = specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]
    if (NPM.has(root) && root !== "react") deps.add(root)
  }
  return [...deps].sort()
}

/**
 * Ítems del registry de los que depende este archivo, como URLs absolutas.
 *
 * El tema va en todos: un componente copiado a un proyecto que no tiene los
 * tokens compila pero se ve sin estilo, que es el peor de los dos fallos.
 */
function registryDependencies(source, site) {
  const deps = new Set([`${site}/r/theme.json`])
  if (/from "\.\.\/lib\/utils\.js"/.test(source)) deps.add(`${site}/r/utils.json`)
  for (const [, name] of source.matchAll(/from "\.\.\/(?:lib|internal)\/([a-z0-9-]+)\.js"/g)) {
    if (name !== "utils") deps.add(`${site}/r/lib-${name}.json`)
  }
  for (const [, name] of source.matchAll(/from "\.\.\/variants\/([a-z0-9-]+)\.js"/g)) deps.add(`${site}/r/variants-${name}.json`)
  for (const [, name] of source.matchAll(/from "\.\/([a-z0-9-]+)\.js"/g)) deps.add(`${site}/r/${name}.json`)
  return [...deps].sort()
}

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

/** Los módulos `.ts` de `src/<dir>`, en orden alfabético. */
/**
 * Los módulos de una carpeta de `src`, con su extensión.
 *
 * `.tsx` además de `.ts` porque `lib/labels.tsx` trae el `LabelsProvider`, que
 * es JSX. Mientras solo miraba `.ts`, el primer componente que lo importó
 * generó una `registryDependency` a un ítem que no existía.
 */
function modules(root, dir) {
  return readdirSync(join(root, "src", dir))
    .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
    .map((file) => [basename(file, extname(file)), extname(file)])
    .sort(([a], [b]) => a.localeCompare(b))
}

// ── El ítem de tema ──────────────────────────────────────────────────────────
//
// Sin esto, `shadcn add .../r/button.json` copiaba el componente a un proyecto
// que no tiene `--sf-brand-700`, `focus-ring` ni `text-button-14`: compilaba y
// se veía sin estilo. El ítem se arma leyendo los CSS del paquete, no una copia
// a mano, para que no pueda quedar desfasado del `theme.css` real.
//
// Lo que NO viaja, a propósito:
//   · los `--color-*: initial` / `--radius-*: initial` / `--shadow-*: initial`
//     de reset.css, que en la app destino borrarían su propia paleta;
//   · base.css (`body`, `html`, el reset de `border-color`), que pisaría el
//     chrome de una app que ya existe.
// Quien quiera el sistema entero instala el paquete: el registry es para
// llevarse un componente y editarlo.

/** El cuerpo de `header { … }`, contando llaves (hay `@keyframes` anidados). */
function block(css, header) {
  const start = css.indexOf(header)
  if (start === -1) return ""
  let depth = 0
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}" && --depth === 0) return css.slice(css.indexOf("{", start) + 1, i)
  }
  return ""
}

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "")

/** `--x: y;` → `{ "--x": "y" }`, sin los comodines `*: initial` de reset.css. */
function declarations(body) {
  const out = {}
  for (const [, name, value] of stripComments(body).matchAll(/(--[a-z0-9-]+)\s*:\s*([^;{}]+);/g)) {
    out[name] = value.trim().replace(/\s+/g, " ")
  }
  return out
}

/** `prop: value;` de un bloque plano → objeto, para el campo `css` de shadcn. */
function rules(body) {
  const out = {}
  for (const [, prop, value] of stripComments(body).matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
    out[prop] = value.trim().replace(/\s+/g, " ")
  }
  return out
}

function buildTheme({ root, site, author }) {
  const read = (path) => readFileSync(join(root, path), "utf8")
  const reset = read("src/styles/reset.css")
  const colors = read("src/styles/colors.css")
  const theme = read("src/styles/theme.css")

  // El reparto entre `cssVars` y `css` no es gusto: cada uno es el único que
  // funciona para lo suyo en el CLI de shadcn 4.21.
  //
  // · `@theme inline` **tiene** que ir por `cssVars.theme`. En `css`, un at-rule
  //   que no sea `@utility`/`@keyframes` trata a cada hijo como un selector, no
  //   como una declaración: `--color-white: #fff` terminaba en
  //   `Unknown word #fff`.
  // · `:root` y `.dark` **tienen** que ir por `css`. Por `cssVars`, el plugin
  //   `update-theme` espeja cada variable en `@theme inline` como
  //   `--color-<x>: var(--<x>)`; con nuestros nombres largos eso agregaba 121
  //   líneas `var(----sf-…)` (no le saca el `--` al valor) y 120 utilidades
  //   `bg-sf-*` que no existen. El mapa `--color-* → --sf-*` ya lo trae el
  //   propio theme.css, así que el espejo sobra.
  //
  // Por lo mismo las claves de `cssVars.theme` van sin `--`: así el espejo
  // encuentra la declaración que ya escribió y no agrega nada.
  const themeVars = {
    // De reset.css solo los radios: los comodines `initial` borrarían la paleta
    // de la app, y `--color-white`/`--color-black` ya los trae Tailwind (además
    // de que, por ser colores literales, el espejo les inventaría un
    // `--color-color-white`).
    ...Object.fromEntries(
      Object.entries(declarations(block(reset, "@theme"))).filter(([name]) => name.startsWith("--radius-"))
    ),
    ...declarations(block(colors, "@theme inline")),
    ...declarations(block(theme, "@theme inline")),
    // Los `--animate-*` viven en el `@theme` (no inline) de theme.css, junto a
    // sus `@keyframes`; las keyframes van aparte, como at-rule suelta.
    ...Object.fromEntries(
      Object.entries(declarations(block(theme, "@theme {"))).filter(([name]) => name.startsWith("--animate-"))
    ),
  }
  const cssVars = { theme: Object.fromEntries(Object.entries(themeVars).map(([name, value]) => [name.slice(2), value])) }

  const css = {
    ":root": {
      ...declarations(block(block(colors, "@layer base"), ":root")),
      ...declarations(block(block(theme, "@layer base"), ":root")),
    },
    ".dark": {
      ...declarations(block(block(colors, "@layer base"), ".dark")),
      ...declarations(block(block(theme, "@layer base"), ".dark")),
    },
  }
  for (const [, name] of theme.matchAll(/@keyframes ([a-z-]+)\s*\{/g)) {
    const body = block(theme, `@keyframes ${name}`)
    const steps = {}
    for (const [, selector, decls] of body.matchAll(/([^{}]+)\{([^{}]*)\}/g)) steps[selector.trim().replace(/\s+/g, " ")] = rules(decls)
    css[`@keyframes ${name}`] = steps
  }
  for (const [, name] of theme.matchAll(/@utility ([a-z0-9-]+)\s*\{/g)) {
    css[`@utility ${name}`] = rules(block(theme, `@utility ${name} `))
  }

  return {
    $schema: ITEM_SCHEMA,
    name: "theme",
    type: "registry:theme",
    title: "Tokens de sebs7n-ui",
    description:
      "La paleta Geist, las cuatro variables de marca, la escala tipográfica, los radios, las sombras y las utilidades de foco. Todo componente del registry depende de este ítem.",
    author,
    docs: `${site}/docs/tokens`,
    cssVars,
    css,
  }
}

/**
 * El CLI de shadcn resuelve imports por basename cuando la ruta exacta no está
 * (ver el comentario de arriba). Dos archivos del mismo `add` con el mismo
 * basename son un import que apunta al archivo equivocado, y el síntoma —un
 * componente que se importa a sí mismo— no aparece hasta que alguien corre
 * `tsc` en el proyecto destino. Mejor que falle acá.
 */
function assertBasenamesUnique(items) {
  const vistos = new Map()
  for (const item of items) {
    for (const file of item.files ?? []) {
      const name = basename(file.path).replace(/\.(tsx?|jsx?)$/, "")
      const previo = vistos.get(name)
      if (previo) {
        throw new Error(
          `Dos archivos del registry se llaman "${name}": ${previo} y ${item.name}. ` +
            "shadcn resuelve imports por basename y uno de los dos va a terminar apuntando al otro."
        )
      }
      vistos.set(name, item.name)
    }
  }
}

export function buildRegistry({ root, site, components, author }) {
  const items = []

  const read = (path) => readFileSync(join(root, path), "utf8")

  items.push(buildTheme({ root, site, author }))
  const THEME = [`${site}/r/theme.json`]

  // lib/utils va al alias estándar de shadcn; el resto de lib y las variantes, a lib/sebs7n-ui/.
  items.push({
    $schema: ITEM_SCHEMA,
    name: "utils",
    type: "registry:lib",
    title: "cn()",
    description: "clsx + tailwind-merge, con la escala tipográfica y las sombras de sebs7n-ui registradas.",
    author,
    dependencies: npmDependencies(read("src/lib/utils.ts")),
    registryDependencies: THEME,
    files: [
      {
        path: "registry/sebs7n-ui/lib/utils.ts",
        type: "registry:lib",
        target: "@lib/utils.ts",
        content: rewriteImports(read("src/lib/utils.ts")),
      },
    ],
  })

  // `src/lib`, `src/internal` y `src/variants` se leen del disco: un helper nuevo
  // entra solo al registry. Con la lista a mano, el primer componente que
  // importara un helper nuevo generaba una registryDependency a un ítem que no
  // existía. `internal/` no se exporta del paquete, pero el registry copia
  // archivos: el componente que lo importa lo necesita igual.
  const helpers = [
    ...modules(root, "lib").filter(([name]) => name !== "utils").map(([name, ext]) => ["lib", name, ext]),
    ...modules(root, "internal").map(([name, ext]) => ["internal", name, ext]),
  ].sort(([, a], [, b]) => a.localeCompare(b))
  for (const [dir, name, ext] of helpers) {
    const source = read(`src/${dir}/${name}${ext}`)
    items.push({
      $schema: ITEM_SCHEMA,
      name: `lib-${name}`,
      type: "registry:lib",
      title: name,
      description: `Helper interno de sebs7n-ui: ${name}.`,
      author,
      dependencies: npmDependencies(source),
      registryDependencies: registryDependencies(source, site),
      files: [
        {
          path: `registry/sebs7n-ui/lib/sebs7n-ui/${libFile(name)}${ext}`,
          type: "registry:lib",
          target: `@lib/sebs7n-ui/${libFile(name)}${ext}`,
          content: rewriteImports(source),
        },
      ],
    })
  }

  for (const [name, ext] of modules(root, "variants")) {
    const source = read(`src/variants/${name}${ext}`)
    items.push({
      $schema: ITEM_SCHEMA,
      name: `variants-${name}`,
      type: "registry:lib",
      title: `${name}Variants`,
      description: `Clases de ${name}. Sin "use client": sirve en un Server Component.`,
      author,
      dependencies: npmDependencies(source),
      registryDependencies: registryDependencies(source, site),
      files: [
        {
          path: `registry/sebs7n-ui/lib/sebs7n-ui/${variantsFile(name)}${ext}`,
          type: "registry:lib",
          target: `@lib/sebs7n-ui/${variantsFile(name)}${ext}`,
          content: rewriteImports(source),
        },
      ],
    })
  }

  for (const component of components) {
    const source = read(`src/components/${component.slug}.tsx`)
    items.push({
      $schema: ITEM_SCHEMA,
      name: component.slug,
      type: "registry:ui",
      title: component.title,
      description: component.description,
      author,
      dependencies: npmDependencies(source),
      registryDependencies: registryDependencies(source, site),
      files: [{ path: `registry/sebs7n-ui/ui/${component.slug}.tsx`, type: "registry:ui", content: rewriteImports(source) }],
      docs: `${site}/docs/components/${component.slug}`,
    })
  }

  assertBasenamesUnique(items)

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "sebs7n-ui",
    homepage: site,
    items,
  }

  return registry
}
