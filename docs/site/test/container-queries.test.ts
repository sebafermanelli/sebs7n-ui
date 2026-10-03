// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

// Dentro de un AppShell el layout responde al ancho del contenido (container queries), no al de la ventana.
// Si volviera un `lg:grid-cols-…` en un template, un panel lateral abierto dejaría la grilla en el diseño ancho.
const root = new URL("../app/templates", import.meta.url).pathname
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? files(path) : /\.tsx$/.test(name) ? [path] : []
  })

// Pantalla completa o superposiciones: siguen con la ventana.
const FULL_SCREEN = /\/(landing|blog|login)\//
const OVERLAYS = /(dialog|sheet|sidebar)/i

describe.each(["dashboard", "console"])("template %s: layout por ancho del contenido", (name) => {
  const sources = files(join(root, name)).filter((file) => !FULL_SCREEN.test(file) && !OVERLAYS.test(file))

  it("ninguna grilla ni columna usa breakpoints de la ventana", () => {
    const offenders = sources.flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, index) => (/(?<![\w@-])(max-)?(sm|md|lg|xl|2xl):(grid|col-|flex-|w-|hidden|block|max-h|-mx|px|ml-|\[&)/.test(line) ? [`${relative(root, file)}:${index + 1}`] : []))
    )
    expect(offenders).toEqual([])
  })

  it("las pantallas viven dentro de AppShellContent (el ancestro que resuelve las consultas)", () => {
    const pages = sources.filter((file) => /\/page\.tsx$/.test(file))
    expect(pages.length).toBeGreaterThan(0)
    for (const file of pages) expect(readFileSync(file, "utf8"), relative(root, file)).toMatch(/AppShellContent|SplitView|redirect\(/)
  })
})

describe("grillas de los templates: el umbral de cada una", () => {
  const read = (path: string) => readFileSync(join(root, path), "utf8")
  it.each([
    ["dashboard/_components/invoices-board.tsx", "@3xl:grid-cols-3"],
    ["dashboard/_components/plan-card.tsx", "@3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"],
    ["dashboard/customers/[id]/page.tsx", "@4xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"],
    ["console/alerts/page.tsx", "@3xl:grid-cols-2"],
    ["console/_components/plan-card.tsx", "@3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"],
    ["console/resources/page.tsx", "@4xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"],
  ])("%s usa %s", (file, cls) => {
    expect(read(file)).toContain(cls)
  })
})

// El panel de widgets (Inicio del dashboard, Resumen de la consola) vive en el paquete: su grilla es por ancho
// del contenedor (1 → 2 desde @xl → 4 desde @4xl), y los tamaños de cada widget son las columnas que ocupa.
describe("panel de widgets: grilla por container query, sin breakpoints de ventana", () => {
  const pkg = new URL("../../../src", import.meta.url).pathname
  const parts = readFileSync(join(pkg, "internal/widget-board-parts.tsx"), "utf8")

  it("la grilla y los tamaños fijan sus umbrales", () => {
    expect(parts).toContain('"grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-4"')
    expect(parts).toContain('md: "@xl:col-span-2"')
    expect(parts).toContain('lg: "@xl:col-span-2 @4xl:col-span-4"')
  })

  it.each(["internal/widget-board-parts.tsx", "internal/widget-board-editor.tsx", "components/widget-board.tsx"])("%s no usa breakpoints de la ventana", (file) => {
    expect(readFileSync(join(pkg, file), "utf8")).not.toMatch(/(?<![\w@-])(max-)?(sm|md|lg|xl|2xl):(grid|col-|flex-|w-|hidden|block)/)
  })

  it.each([
    ["dashboard/page.tsx", "WidgetBoardEditButton", "<WidgetBoard"],
    ["console/page.tsx", "WidgetBoardEditButton", "<WidgetBoard"],
  ])("%s usa el panel del paquete, con «Editar» y sin armar su propia grilla", (file, ...needles) => {
    const src = readFileSync(join(root, file), "utf8")
    for (const needle of needles) expect(src).toContain(needle)
    expect(src).not.toMatch(/grid-cols-/)
    expect(src).not.toContain("sebs7n-ui/sortable")
  })

  it("«Editar» es secundario: en la cabecera el único Button sin variante es la acción primaria", () => {
    for (const file of ["dashboard/page.tsx", "console/page.tsx"]) expect(readFileSync(join(root, file), "utf8")).not.toMatch(/<WidgetBoardEditButton[^>]*variant=/)
    expect(readFileSync(join(pkg, "components/widget-board.tsx"), "utf8")).toContain('variant="secondary"')
  })
})

describe("playground: la muestra responde al ancho de su contenedor", () => {
  const src = readFileSync(new URL("../app/_components/playground.tsx", import.meta.url).pathname, "utf8")
  it("usa container queries y no breakpoints de la ventana en sus grillas", () => {
    expect(src).toContain("@container flex flex-col gap-4")
    expect(src).toContain("@4xl:grid-cols-2")
    expect(src).not.toMatch(/(?<![\w@-])(sm|lg):grid-cols/)
  })
})

// Las pantallas del Playground viven dentro de un `AppShell` (`showcase/shell.tsx`): su layout también es por
// contenedor. El detalle (todos los archivos, la tabla de reemplazos) lo fija `playground-defaults.test.ts`.
describe("playground: las pantallas de ejemplo dentro del AppShell", () => {
  const dir = new URL("../app/_components/showcase", import.meta.url).pathname
  const read = (name: string) => readFileSync(join(dir, name), "utf8")
  it.each(["home.tsx", "files.tsx", "settings.tsx", "mail.tsx", "shell.tsx"])("%s no usa breakpoints de la ventana", (file) => {
    expect(read(file)).not.toMatch(/(?<![\w@-])(max-)?(sm|md|lg|xl|2xl):(grid|col-|flex-|w-|hidden|block|-mx|px|ml-)/)
  })
  it("Inicio y Ajustes viven dentro de AppShellContent (el ancestro que resuelve las consultas)", () => {
    expect(read("home.tsx")).toContain("<AppShellContent")
    expect(read("settings.tsx")).toContain("<AppShellContent")
    expect(read("settings.tsx")).toContain("@3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]")
  })
  it("Archivos y Correo reparten paneles con las consultas de SplitView (@…/split)", () => {
    expect(read("files.tsx")).toMatch(/@4xl\/split:/)
    expect(read("mail.tsx")).toContain("<SplitView")
  })
  it("el marco mide el alto con una variable y el contenido con el `main` del AppShell", () => {
    expect(read("shell.tsx")).toContain("[--app-shell-height:var(--showcase-height)]")
    expect(read("shell.tsx")).toContain("[data-slot=app-shell-main]")
  })
})

describe("catálogo de íconos: barra de filtros en sm con los componentes del paquete", () => {
  const src = readFileSync(new URL("../app/_components/icon-catalog.tsx", import.meta.url).pathname, "utf8")
  it("usa FilterBar y SearchField en sm, sin lupa armada a mano", () => {
    expect(src).toContain("<FilterBar")
    expect(src).toContain("<SearchField")
    expect(src).not.toMatch(/import \{[^}]*SearchIcon/) // sin lupa importada a mano
    expect(src).not.toContain("<Input")
    expect(src).toContain('size="sm"')
  })
})

describe("playground: componentes del paquete y un solo acento", () => {
  const src = readFileSync(new URL("../app/_components/playground.tsx", import.meta.url).pathname, "utf8")
  it("las métricas van en StatGrid, no en un grid armado a mano", () => {
    expect(src).toContain("<StatGrid")
    expect(src).not.toContain('from "sebs7n-ui/stat"')
  })
  it("la muestra tiene un solo Button primario", () => {
    expect(src.match(/<Button>/g)).toHaveLength(1)
    expect(src).toContain('<Button variant="secondary">Guardar</Button>')
  })
})

describe("índice de documentación: toda tarjeta tiene descripción", () => {
  const src = readFileSync(new URL("../app/docs/page.tsx", import.meta.url).pathname, "utf8")
  it("Playground e Iconos, que no tienen markdown, la traen en RUTAS", () => {
    expect(src).toContain('"/docs/playground"')
    expect(src).toContain('"/docs/iconos"')
  })
})

describe("prosa: el código en línea parte la línea en un teléfono", () => {
  it("globals.css lo declara", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url).pathname, "utf8")
    expect(css).toMatch(/\.prose :not\(pre\) > code \{\s*overflow-wrap: anywhere/)
  })
})
