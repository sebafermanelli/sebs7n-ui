// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import site from "../.generated/site.json"
import { RECETA_MARCO, RECETAS, SHOWCASES, umbralDe, UMBRALES, type Receta } from "../app/_components/showcase/catalog"
import { globalsDe, layoutDe } from "../app/_components/playground"

// El Playground es la referencia viva de los defaults: si un componente cambia de subpath, de nombre o de
// página, o si una pantalla vuelve a armar a mano algo que el paquete ya trae, esto falla acá y no en la
// cabeza de quien copia el ejemplo.
const pkgRoot = new URL("../../..", import.meta.url).pathname
const showcaseDir = new URL("../app/_components/showcase", import.meta.url).pathname
const pkg = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8")) as { exports: Record<string, unknown> }

const todas: [string, Receta][] = [...SHOWCASES.map((item) => [item.id, RECETAS[item.id]] as [string, Receta]), ["marco", RECETA_MARCO]]

/** El módulo fuente de un subpath: `exports` mapea `./*` a `components/*`, `./lib/*` a `lib/*`, etc. */
function fuenteDe(subpath: string): string | null {
  const nombre = subpath.replace(/^sebs7n-ui\//, "")
  const [base, ...resto] = nombre.split("/")
  const candidatos = base === "lib" || base === "variants" ? [`src/${nombre}.ts`, `src/${nombre}.tsx`] : [`src/components/${nombre}.tsx`, `src/components/${nombre}.ts`]
  void resto
  const hallado = candidatos.find((ruta) => existsSync(join(pkgRoot, ruta)))
  return hallado ? join(pkgRoot, hallado) : null
}

/** Los nombres que exporta un módulo: `export { A, B, type C }` y `export function/const X`. */
function exportados(archivo: string): Set<string> {
  const src = readFileSync(archivo, "utf8")
  const nombres = new Set<string>()
  for (const bloque of src.matchAll(/export\s*(?:type\s*)?\{([^}]*)\}/g)) {
    for (const parte of bloque[1]!.split(",")) {
      const nombre = parte.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()
      if (nombre) nombres.add(nombre)
    }
  }
  for (const m of src.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|type|interface)\s+(\w+)/g)) nombres.add(m[1]!)
  return nombres
}

/** Los imports de `sebs7n-ui/*` de un fragmento: [subpath, nombres]. */
function importsDe(code: string): [string, string[]][] {
  return [...code.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+"(sebs7n-ui\/[^"]+)"/g)].map((m) => [
    m[2]!,
    m[1]!.split(",").map((parte) => parte.trim().replace(/^type\s+/, "")).filter(Boolean)
  ])
}

describe("«Cómo se arma»: los fragmentos importan lo que existe", () => {
  it.each(todas)("%s: cada subpath está en `exports` y cada nombre, exportado", (_id, receta) => {
    const imports = importsDe(receta.code)
    expect(imports.length).toBeGreaterThan(0)
    // `./*` y `./lib/*` cubren a todos: lo que importa es que el módulo fuente exista.
    expect(Object.keys(pkg.exports)).toEqual(expect.arrayContaining(["./*", "./lib/*"]))
    for (const [subpath, nombres] of imports) {
      const fuente = fuenteDe(subpath)
      expect(fuente, `no existe el módulo de ${subpath}`).not.toBeNull()
      const ofrecidos = exportados(fuente!)
      for (const nombre of nombres) expect(ofrecidos.has(nombre), `${subpath} no exporta ${nombre}`).toBe(true)
    }
  })

  it.each(todas)("%s: toda pieza listada existe en su módulo y está en el código copiable", (_id, receta) => {
    for (const pieza of receta.piezas) {
      const fuente = fuenteDe(pieza.from)
      expect(fuente, pieza.from).not.toBeNull()
      expect(exportados(fuente!).has(pieza.name), `${pieza.from} no exporta ${pieza.name}`).toBe(true)
    }
  })

  it.each(todas)("%s: trae reglas y el código es corto", (_id, receta) => {
    expect(receta.reglas.length).toBeGreaterThanOrEqual(2)
    expect(receta.reglas.length).toBeLessThanOrEqual(3)
    expect(receta.code.split("\n").length).toBeLessThanOrEqual(70)
  })
})

describe("«Cómo se arma»: los links llegan a páginas que existen", () => {
  const slugs = new Set((site as { components: { slug: string }[] }).components.map((c) => c.slug))
  it.each(todas)("%s: cada pieza enlaza a /docs/components/<slug> generado", (_id, receta) => {
    for (const pieza of receta.piezas) expect(slugs.has(pieza.slug), `${pieza.name}: no hay /docs/components/${pieza.slug}`).toBe(true)
  })

  it("el link sale del dato y no de texto suelto", () => {
    const src = readFileSync(join(showcaseDir, "como-se-arma.tsx"), "utf8")
    expect(src).toContain("`/docs/components/${slug}`")
    expect(src).toContain("href={hrefDe(pieza.slug)}")
  })

  it("el panel es un Collapsible con CopyButton del paquete", () => {
    const src = readFileSync(join(showcaseDir, "como-se-arma.tsx"), "utf8")
    expect(src).toContain('from "sebs7n-ui/collapsible"')
    expect(src).toContain("<CopyButton")
  })
})

/** Los archivos de pantalla: lo que arma contenido dentro del AppShell. */
const pantallas = ["home", "files", "settings", "mail"].map((nombre) => [nombre, readFileSync(join(showcaseDir, `${nombre}.tsx`), "utf8")] as const)

describe("pantallas: nada armado a mano si el paquete ya lo trae", () => {
  // Cada fila: lo que no se debe escribir a mano → el componente que lo reemplaza.
  const REEMPLAZOS: { patron: RegExp; usar: string; excepto?: string[] }[] = [
    { patron: /from "sebs7n-ui\/input"/, usar: "SearchField (o Field + Input en un formulario, no en una barra de filtros)" },
    { patron: /\bSearchIcon\b/, usar: "SearchField, que trae su lupa" },
    { patron: /<Stat\b[\s\S]{0,400}?<Stat\b/, usar: "StatGrid en vez de varios Stat en una grilla", excepto: ["home"] },
    { patron: /from "sebs7n-ui\/sortable-grid"/, usar: "WidgetBoard + useWidgetLayout" },
    { patron: /from "sebs7n-ui\/navbar"/, usar: "la barra del AppShell (header y mobileBar)" },
    { patron: /grid-cols-\d[^"]*gap[^"]*>\s*<Card\b/, usar: "CardGrid / SettingsGrid / StatGrid" },
    { patron: /<Toolbar\b[^>]*aria-label="(?:Filtros|Barra de filtros)/, usar: "FilterBar" }
  ]
  it.each(REEMPLAZOS.map((r) => [r.usar, r] as const))("no usa: %s", (_usar, regla) => {
    for (const [nombre, src] of pantallas) {
      if (regla.excepto?.includes(nombre)) continue
      expect(regla.patron.test(src), `${nombre}.tsx arma a mano algo que cubre ${regla.usar}`).toBe(false)
    }
  })

  it("Archivos y Correo usan la barra de filtros del paquete, en sm, con sus controles", () => {
    for (const nombre of ["files", "mail"]) {
      const src = pantallas.find(([n]) => n === nombre)![1]
      for (const necesario of ["<FilterBar", "<SearchField", "<ToggleGroup", "<BulkActionsBar", 'size="sm"']) expect(src, `${nombre}: ${necesario}`).toContain(necesario)
    }
  })

  it("Inicio usa StatGrid, MetricChart/Sparkline y el panel de widgets del paquete", () => {
    const src = pantallas.find(([n]) => n === "home")![1]
    for (const necesario of ["<StatGrid", "<MetricChart", "<Sparkline", "<WidgetBoard", "<WidgetBoardEditButton", "useWidgetLayout"]) expect(src).toContain(necesario)
  })

  it("Ajustes usa SettingsSection y la card de plan con uso (PromoCard + Meter)", () => {
    const src = pantallas.find(([n]) => n === "settings")![1]
    for (const necesario of ["<SettingsGrid", "<SettingsSection", "<PromoCard", "<Meter"]) expect(src).toContain(necesario)
  })

  it("el marco usa AppShell con aside, el asistente en Chat, NotificationsPopover, ShortcutsDialog, CommandPalette y useKeySequence", () => {
    const shell = readFileSync(join(showcaseDir, "shell.tsx"), "utf8")
    for (const necesario of ["<AppShell", "aside=", "asideOpen=", "<NotificationsPopover", "<AiButton", "useKeySequence(", "CommandPalette", "ShortcutsDialog"]) expect(shell).toContain(necesario)
    expect(readFileSync(join(showcaseDir, "assistant.tsx"), "utf8")).toContain("<Chat")
  })

  it("las pantallas tienen un solo Button primario (sin variante)", () => {
    for (const [nombre, src] of pantallas) {
      const sinVariante = src.match(/<Button(?![A-Za-z])(?![^>]*variant=)(?![^>]*size="icon)[^>]*>/g) ?? []
      expect(sinVariante.length, `${nombre}.tsx`).toBeLessThanOrEqual(1)
    }
  })
})

describe("pantallas: el layout responde al contenedor, no a la ventana", () => {
  // `sm:`/`md:`/`lg:`/`xl:`/`2xl:` de layout (grilla, columnas, ancho, visibilidad): solo `@…` dentro del AppShell.
  // El marco que hospeda el AppShell (`index.tsx`) está afuera de él y puede seguir a la ventana.
  const VIEWPORT = /(?<![\w@-])(max-)?(sm|md|lg|xl|2xl):(grid|col-|flex|w-|hidden|block|max-h|-mx|px|ml-|\[&|inline)/
  const dentro = [...pantallas, ["shell", readFileSync(join(showcaseDir, "shell.tsx"), "utf8")] as const, ["assistant", readFileSync(join(showcaseDir, "assistant.tsx"), "utf8")] as const, ["parts", readFileSync(join(showcaseDir, "parts.tsx"), "utf8")] as const, ["como-se-arma", readFileSync(join(showcaseDir, "como-se-arma.tsx"), "utf8")] as const]

  it.each(dentro)("%s no usa breakpoints de viewport de layout", (nombre, src) => {
    const infractores = src.split("\n").flatMap((linea, i) => (VIEWPORT.test(linea) ? [`${nombre}.tsx:${i + 1}: ${linea.trim()}`] : []))
    expect(infractores).toEqual([])
  })

  it("todos los archivos de la carpeta están cubiertos por la regla (salvo catalog, index y recetas de texto)", () => {
    const archivos = readdirSync(showcaseDir).filter((nombre) => /\.tsx$/.test(nombre))
    const cubiertos = new Set([...dentro.map(([n]) => `${n}.tsx`), "index.tsx"])
    expect(archivos.filter((a) => !cubiertos.has(a))).toEqual([])
  })

  it("el alto del marco llega a las pantallas con paneles por variable, sin números sueltos", () => {
    const shell = readFileSync(join(showcaseDir, "shell.tsx"), "utf8")
    expect(shell).toContain("[--app-shell-height:var(--showcase-height)]")
    for (const nombre of ["files", "mail"]) expect(pantallas.find(([n]) => n === nombre)![1]).toContain("h-[var(--showcase-split,100%)]")
  })
})

describe("el indicador del ancho nombra los umbrales de Tailwind", () => {
  it("devuelve el más alto que se alcanza", () => {
    expect(umbralDe(300)).toBeNull()
    expect(umbralDe(320)).toBe("@xs")
    expect(umbralDe(575)).toBe("@lg")
    expect(umbralDe(576)).toBe("@xl")
    expect(umbralDe(926)).toBe("@4xl")
    expect(umbralDe(2000)).toBe("@5xl")
  })
  it("los umbrales son los de rem × 16 de Tailwind v4", () => {
    expect(UMBRALES.map(([, px]) => px)).toEqual([20, 24, 28, 32, 36, 42, 48, 56, 64].map((rem) => rem * 16))
  })
})

describe("controles del Playground = cómo se configura el sistema", () => {
  it("el globals.css copiable lleva los @import de la instalación, en orden", () => {
    const css = globalsDe({ "--brand-base": "oklch(0.6 0.2 30)", "--ambient": "0.5" })
    expect(css.indexOf('@import "tailwindcss"')).toBeGreaterThanOrEqual(0)
    expect(css.indexOf('@import "sebs7n-ui/theme.css"')).toBeGreaterThan(css.indexOf('@import "tailwindcss"'))
    expect(css).toContain("--brand-base:")
    expect(css).toContain("--ambient:")
  })

  it("el layout copiable refleja el wallpaper y el panel", () => {
    expect(layoutDe({ ambient: true }, false)).toContain("ambient")
    expect(layoutDe({ ambient: false }, false)).not.toContain("ambient")
    const conPanel = layoutDe({ ambient: true }, true)
    for (const parte of ["ThemeProvider", 'attribute="class"', "aside=", "asideOpen={open}"]) expect(conPanel).toContain(parte)
    expect(layoutDe({ ambient: true }, false)).not.toContain("aside=")
  })

  it("las variables que el sitio pisa son las que documenta la instalación (theme.css)", () => {
    const glass = readFileSync(new URL("../app/_components/glass-config.tsx", import.meta.url).pathname, "utf8")
    const theme = readFileSync(join(pkgRoot, "src/styles/theme.css"), "utf8")
    for (const variable of ["--brand-base", "--brand-contrast", "--brand-base-dark", "--brand-contrast-dark", "--ambient"]) {
      expect(glass).toContain(`"${variable}"`)
      expect(theme).toContain(`${variable}:`)
    }
  })
})
