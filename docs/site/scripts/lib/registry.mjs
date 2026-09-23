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
//   ../variants/x.js     → @/lib/sebs7n-ui/x
//   ./button.js          → @/components/ui/button
import { readFileSync } from "node:fs"
import { join } from "node:path"

const NPM = new Set(["@base-ui/react", "class-variance-authority", "clsx", "lucide-react", "next-themes", "react", "sonner", "tailwind-merge"])

export function rewriteImports(source) {
  return source
    .replace(/from "\.\.\/lib\/utils\.js"/g, 'from "@/lib/utils"')
    .replace(/from "\.\.\/lib\/([a-z0-9-]+)\.js"/g, 'from "@/lib/sebs7n-ui/$1"')
    .replace(/from "\.\.\/variants\/([a-z0-9-]+)\.js"/g, 'from "@/lib/sebs7n-ui/$1"')
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

/** Ítems del registry de los que depende este archivo, como URLs absolutas. */
function registryDependencies(source, site) {
  const deps = new Set()
  if (/from "\.\.\/lib\/utils\.js"/.test(source)) deps.add(`${site}/r/utils.json`)
  for (const [, name] of source.matchAll(/from "\.\.\/lib\/([a-z0-9-]+)\.js"/g)) {
    if (name !== "utils") deps.add(`${site}/r/lib-${name}.json`)
  }
  for (const [, name] of source.matchAll(/from "\.\.\/variants\/([a-z0-9-]+)\.js"/g)) deps.add(`${site}/r/variants-${name}.json`)
  for (const [, name] of source.matchAll(/from "\.\/([a-z0-9-]+)\.js"/g)) deps.add(`${site}/r/${name}.json`)
  return [...deps].sort()
}

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json"

export function buildRegistry({ root, site, components, author }) {
  const items = []

  const read = (path) => readFileSync(join(root, path), "utf8")

  // lib/utils va al alias estándar de shadcn; el resto de lib y las variantes, a lib/sebs7n-ui/.
  items.push({
    $schema: ITEM_SCHEMA,
    name: "utils",
    type: "registry:lib",
    title: "cn()",
    description: "clsx + tailwind-merge, con la escala tipográfica y las sombras de sebs7n-ui registradas.",
    author,
    dependencies: npmDependencies(read("src/lib/utils.ts")),
    files: [
      {
        path: "registry/sebs7n-ui/lib/utils.ts",
        type: "registry:lib",
        target: "@lib/utils.ts",
        content: rewriteImports(read("src/lib/utils.ts")),
      },
    ],
  })

  for (const name of ["shell-context"]) {
    const source = read(`src/lib/${name}.ts`)
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
        { path: `registry/sebs7n-ui/lib/sebs7n-ui/${name}.ts`, type: "registry:lib", target: `@lib/sebs7n-ui/${name}.ts`, content: rewriteImports(source) },
      ],
    })
  }

  for (const name of ["badge", "button", "card", "input", "link", "menu", "sidebar", "toggle"]) {
    const source = read(`src/variants/${name}.ts`)
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
        { path: `registry/sebs7n-ui/lib/sebs7n-ui/${name}.ts`, type: "registry:lib", target: `@lib/sebs7n-ui/${name}.ts`, content: rewriteImports(source) },
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

  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "sebs7n-ui",
    homepage: site,
    items,
  }

  return registry
}
