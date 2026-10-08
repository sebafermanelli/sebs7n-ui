// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

// El sitio de documentación es el primer usuario del sistema: lo que el paquete ya trae no se arma a mano.
// Alcance: todo docs/site/app, salvo los templates (aprobados), las demos de componente y el Playground/catálogo
// de íconos (los fija `playground-defaults.test.ts`).
const app = new URL("../app", import.meta.url).pathname
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return /^(_demos|showcase)$/.test(name) || (dir === app && name === "templates") ? [] : walk(path)
    return /\.tsx$/.test(name) ? [path] : []
  })
const files = [...walk(app), ...walk(join(app, "templates", "_components")).filter((f) => /template-card/.test(f)), join(app, "templates/page.tsx")]
const rel = (f: string) => relative(app, f)
const read = (f: string) => readFileSync(f, "utf8")
const hit = (re: RegExp, except: RegExp[] = []) => files.filter((f) => !except.some((e) => e.test(rel(f)))).filter((f) => re.test(read(f))).map(rel)

describe("sitio: tabla de reemplazos (a mano → componente del paquete)", () => {
  it("sin <table> suelto: las tablas son `Table`", () => expect(hit(/<table[\s>]/)).toEqual([]))
  it("sin `<Input` + lupa: los campos de búsqueda son `SearchField`", () => expect(hit(/<Input[\s>][\s\S]{0,200}SearchIcon|SearchIcon[\s\S]{0,200}<Input[\s>]/)).toEqual([]))
  it("sin tarjetas armadas con border + bg-surface + shadow: son `Card`", () => expect(hit(/rounded-surface[^"]*border[^"]*bg-surface|bg-surface[^"]*rounded-surface[^"]*border/, [/code-block/, /icon-catalog/])).toEqual([]))
  // La home tiñe el ícono de sus cards con `text-brand-900`, igual que `features.tsx` de la landing: no es un link.
  it("sin links de texto con color de acento a mano: son `TextLink`", () => expect(hit(/className="[^"]*(text-brand-900|underline underline-offset-4)/, [/^page\.tsx$/])).toEqual([]))
  it("sin botones armados a mano con border + px + py: `buttonVariants` o `Button`", () => expect(hit(/rounded-control border border-separator[^"]*px-3/)).toEqual([]))
  it("sin <footer> ni <hr> ni líneas border-t sueltas: `Footer` y `Separator`", () => {
    expect(hit(/<footer[\s>]|<hr[\s/>]/)).toEqual([])
    expect(hit(/className="[^"]*\bborder-t border-separator/)).toEqual([])
  })
  it("sin grids de cards a mano: `CardGrid`", () => expect(hit(/className="grid gap-\d (sm|md|lg):grid-cols/)).toEqual([]))
  it("el copiar código usa `CopyButton`, no un navigator.clipboard propio", () => {
    expect(hit(/navigator\.clipboard/, [/icon-catalog/])).toEqual([])
    expect(read(join(app, "_components/code-block.tsx"))).toContain("<CopyButton")
  })
  it("los encabezados de página usan `PageHeader`", () => {
    for (const f of ["docs/page.tsx", "docs/[slug]/page.tsx", "docs/components/[slug]/page.tsx", "docs/iconos/page.tsx", "templates/page.tsx"]) expect(read(join(app, f)), f).toContain("<PageHeader")
    expect(hit(/<h1[\s>]/, [/^page\.tsx$/, /^docs\/components\/\[slug\]/])).toEqual([])
  })
})

describe("sitio: layout dentro del AppShell por ancho del contenedor", () => {
  // La documentación vive en el AppShell (docs/layout.tsx): su contenido consulta a `AppShellContent` (@container).
  // Excepciones, con razón: la home y /templates son páginas completas (ventana); `docs-shell.tsx` es el chrome del
  // AppShell, que cambia a mobile por la ventana; `search*.tsx` es el disparador del header y un diálogo a pantalla
  // completa; `site-header.tsx`, `site-nav*.tsx`, `mobile-menu*.tsx` y `site-footer.tsx` son la barra y el pie de la home (misma receta que la landing).
  const contenido = files.filter((f) => !/^(page\.tsx|templates\/|_components\/(docs-shell|search|search-dialog|site-header|site-footer|site-nav|mobile-menu|docs-nav)\.tsx)/.test(rel(f)))
  it("sin sm:/md:/lg:/xl: de layout en el contenido de /docs", () => {
    const re = /(?<![\w@-])(max-)?(sm|md|lg|xl|2xl):(grid|col-|flex-|w-|hidden|block|inline|-mx|px|ml-|\[&)/
    expect(contenido.filter((f) => re.test(read(f))).map(rel)).toEqual([])
  })
  it("el índice de la página aparece por @container", () => {
    const src = read(join(app, "_components/page-nav.tsx"))
    expect(src).toContain("@5xl:block")
    expect(src).not.toMatch(/(?<![\w@-])xl:block/)
  })
})

describe("sitio: las grillas de cards comparten filas", () => {
  // La home ya no usa cards en grilla (3.0): es una escena con RuledList y DefinitionList (`home-structure.test.ts`).
  it.each(["docs/page.tsx"])("%s usa CardGrid", (f) => expect(read(join(app, f))).toContain("<CardGrid"))
})
