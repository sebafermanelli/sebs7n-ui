// Lo que `npm run generate` deja en disco. Corre después del `pretest`, así que
// mira la salida real, no una copia.
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import Ajv from "ajv"
import { describe, expect, it } from "vitest"

const here = fileURLToPath(new URL("..", import.meta.url))
const read = (path: string) => readFileSync(join(here, path), "utf8")
const site = JSON.parse(read(".generated/site.json"))
const registry = JSON.parse(read("registry.json"))

const rutas: { href: string; title: string }[] = [
  ...site.pages.map((page: { slug: string; title: string }) => ({ href: `/docs/${page.slug}`, title: page.title })),
  ...site.components.map((component: { slug: string; title: string }) => ({
    href: `/docs/components/${component.slug}`,
    title: component.title,
  })),
]

describe("markdown por página", () => {
  it("hay un .md por cada página del sitio", () => {
    const faltan = rutas.filter((ruta) => !existsSync(join(here, "public", `${ruta.href}.md`)))
    expect(faltan.map((ruta) => ruta.href)).toEqual([])
  })

  it("cada .md arranca con el título y la descripción, y no quedó vacío", () => {
    for (const ruta of rutas) {
      const texto = read(join("public", `${ruta.href}.md`))
      expect(texto.startsWith(`# ${ruta.title}\n`), ruta.href).toBe(true)
      expect(texto.split("\n")[2]?.startsWith("> "), ruta.href).toBe(true)
      expect(texto.length, ruta.href).toBeGreaterThan(200)
    }
  })

  it("ninguna página de componente quedó sin ejemplo, sin props o sin teclado", () => {
    for (const component of site.components) {
      const texto = read(join("public", `/docs/components/${component.slug}.md`))
      expect(texto, component.slug).toContain("## Ejemplos")
      expect(texto, component.slug).toContain("## Props")
      expect(texto, component.slug).toContain("## Teclado")
      expect(texto, component.slug).toContain("## Accesibilidad")
      expect(component.examples.length, component.slug).toBeGreaterThan(0)
    }
  })

  // Sin lista escrita a mano: cada página que se marca `detallado` en meta.mjs
  // agregaba un slug acá, y el test quedaba en rojo por una razón que no era un
  // problema. Lo que importa no es cuáles son, sino que los que se anuncian
  // como detallados tengan de verdad lo que eso promete.
  it("las páginas detalladas tienen ejemplos a mano y reglas de uso", () => {
    const detallados = site.components.filter((component: { detallado: boolean }) => component.detallado)
    expect(detallados.length).toBeGreaterThan(10)
    for (const component of detallados) {
      expect(component.usage.length, component.slug).toBeGreaterThan(2)
      expect(component.examples.length, component.slug).toBeGreaterThan(0)
    }
  })
})

describe("llms.txt", () => {
  const llms = read("public/llms.txt")

  it("lista todas las páginas", () => {
    const faltan = rutas.filter((ruta) => !llms.includes(`${site.site}${ruta.href}.md`))
    expect(faltan.map((ruta) => ruta.href)).toEqual([])
  })

  it("arranca con el título y la bajada", () => {
    expect(llms.startsWith("# sebs7n-ui\n\n> ")).toBe(true)
  })

  it("llms-full.txt trae el cuerpo de cada página", () => {
    const full = read("public/llms-full.txt")
    for (const ruta of rutas) {
      expect(full, ruta.href).toContain(`Fuente: ${site.site}${ruta.href}`)
    }
    expect(full.length).toBeGreaterThan(50_000)
  })
})

describe("registry", () => {
  // Los esquemas de shadcn declaran el meta-schema draft-07 por https; ajv lo
  // registra por http. No se valida el esquema contra su meta-schema, así que
  // se saca la clave y listo.
  const cargar = (archivo: string) => {
    const { $schema, ...resto } = JSON.parse(read(`schemas/${archivo}`))
    void $schema
    return resto
  }
  const ajv = new Ajv({ strict: false, allErrors: true })
  ajv.addSchema(cargar("registry-item.schema.json"), "https://ui.shadcn.com/schema/registry-item.json")
  const validarItem = ajv.getSchema("https://ui.shadcn.com/schema/registry-item.json")!
  const validarRegistry = ajv.compile(cargar("registry.schema.json"))

  it("el registry completo valida contra el esquema de shadcn", () => {
    const ok = validarRegistry(registry)
    expect(validarRegistry.errors ?? []).toEqual([])
    expect(ok).toBe(true)
  })

  it("cada ítem valida por separado", () => {
    for (const item of registry.items) {
      const ok = validarItem(item)
      expect(validarItem.errors ?? [], item.name).toEqual([])
      expect(ok, item.name).toBe(true)
    }
  })

  it("hay un public/r/<name>.json por ítem, más el índice", () => {
    const archivos = new Set(readdirSync(join(here, "public/r")))
    expect(archivos.has("registry.json")).toBe(true)
    for (const item of registry.items) expect(archivos.has(`${item.name}.json`), item.name).toBe(true)
    expect(archivos.size).toBe(registry.items.length + 1)
  })

  it("hay un ítem por componente, más utils, las variantes y el helper del shell", () => {
    const nombres = registry.items.map((item: { name: string }) => item.name)
    for (const component of site.components) expect(nombres, component.slug).toContain(component.slug)
    expect(nombres).toContain("utils")
    expect(nombres).toContain("variants-button")
    expect(nombres).toContain("lib-shell-context")
  })

  // El hallazgo que hacía que `shadcn add .../r/button.json` no compilara: el CLI
  // resuelve un import por basename cuando no da con la ruta exacta, y entre dos
  // archivos del mismo `add` con el mismo nombre gana el `.tsx`. `button.ts` de
  // las variantes y `button.tsx` del componente chocaban, y el componente
  // terminaba importándose a sí mismo (TS2303).
  it("ningún archivo del registry repite basename con otro", () => {
    const porBasename = new Map<string, string[]>()
    for (const item of registry.items) {
      for (const file of item.files ?? []) {
        const nombre = (file.path as string).split("/").pop()!.replace(/\.(tsx?|jsx?)$/, "")
        porBasename.set(nombre, [...(porBasename.get(nombre) ?? []), item.name])
      }
    }
    const repetidos = [...porBasename.entries()].filter(([, items]) => items.length > 1)
    expect(repetidos).toEqual([])
  })

  it("el tema viaja como ítem registry:theme y todo componente depende de él", () => {
    const tema = registry.items.find((item: { name: string }) => item.name === "theme")
    expect(tema.type).toBe("registry:theme")
    // Los tokens que la auditoría encontró faltando en el proyecto destino.
    // `@theme inline` por cssVars y con las claves sin `--`; `:root`/`.dark` por
    // `css`. El porqué de cada uno está en registry.mjs.
    expect(tema.cssVars.theme["color-brand-700"]).toBe("var(--sf-brand-700)")
    expect(Object.keys(tema.cssVars.theme).some((clave) => clave.startsWith("--"))).toBe(false)
    expect(tema.cssVars.light).toBeUndefined()
    expect(tema.css[":root"]["--brand-base"]).toBeTruthy()
    expect(tema.css[".dark"]["--sf-background"]).toBe("#000000")
    expect(tema.css["@utility focus-ring"]["box-shadow"]).toContain("--color-brand-700")
    expect(tema.css["@utility text-button-14"]["font-size"]).toBe("14px")
    // Y nada de reset.css/base.css, que pisarían el chrome de la app destino:
    // de reset.css entran los radios y nada más.
    expect(tema.cssVars.theme["radius-md"]).toBe("6px")
    expect(tema.cssVars.theme["color-white"]).toBeUndefined()
    expect(tema.cssVars.theme["color-*"]).toBeUndefined()
    for (const component of site.components) {
      const item = registry.items.find((otro: { name: string }) => otro.name === component.slug)
      expect(item.registryDependencies, component.slug).toContain(`${site.site}/r/theme.json`)
    }
  })

  it("el contenido no tiene imports relativos del paquete: todos pasan por un alias", () => {
    for (const item of registry.items) {
      for (const file of item.files ?? []) {
        expect(file.content, `${item.name}/${file.path}`).not.toMatch(/from "\.\.?\//)
        expect(file.content, `${item.name}/${file.path}`).not.toMatch(/\.js"/)
      }
    }
  })

  it("las registryDependencies apuntan a URLs de este sitio", () => {
    for (const item of registry.items) {
      for (const dependency of item.registryDependencies ?? []) {
        expect(dependency.startsWith(`${site.site}/r/`), `${item.name} → ${dependency}`).toBe(true)
        const nombre = dependency.slice(`${site.site}/r/`.length, -".json".length)
        expect(
          registry.items.some((otro: { name: string }) => otro.name === nombre),
          `${item.name} depende de ${nombre}, que no está en el registry`
        ).toBe(true)
      }
    }
  })

  it("mantiene la forma del ítem de referencia de shadcn (button)", () => {
    const button = registry.items.find((item: { name: string }) => item.name === "button")
    expect(button.$schema).toBe("https://ui.shadcn.com/schema/registry-item.json")
    expect(button.type).toBe("registry:ui")
    expect(button.files[0].type).toBe("registry:ui")
    expect(button.files[0].path).toMatch(/^registry\/sebs7n-ui\/ui\/button\.tsx$/)
    expect(button.dependencies).toContain("@base-ui/react")
    expect(button.files[0].content).toContain('import { cn } from "@/lib/utils"')
  })
})

describe("despersonalización del sitio", () => {
  // Mismos nombres internos que el test del paquete, menos el del dominio del
  // propio sitio, que acá es intencional. En base64 por la misma razón: el repo
  // es público y este archivo no puede ser la lista.
  const PROHIBIDOS = ["bXVuZG90dXJpc21v", "cmVudG9yYQ==", "cGRmLWNvbnZlcnQ=", "YnJhdWx0"].map((codificado) =>
    Buffer.from(codificado, "base64").toString("utf8")
  )

  const archivos: string[] = []
  const recorrer = (dir: string) => {
    for (const entrada of readdirSync(join(here, dir), { withFileTypes: true })) {
      if (entrada.name.startsWith(".") || entrada.name === "node_modules") continue
      const ruta = `${dir}/${entrada.name}`
      if (entrada.isDirectory()) recorrer(ruta)
      else if (/\.(ts|tsx|mjs|css|json|md)$/.test(entrada.name)) archivos.push(ruta)
    }
  }
  for (const dir of ["app", "content", "scripts", "test"]) recorrer(dir)

  it("mira una lista de archivos no vacía", () => {
    expect(archivos.length).toBeGreaterThan(50)
  })

  PROHIBIDOS.forEach((nombre, indice) => {
    it(`el nombre interno #${indice + 1} no aparece en el sitio`, () => {
      const hits = archivos.filter((archivo) => read(archivo).toLowerCase().includes(nombre))
      expect(hits).toEqual([])
    })
  })
})
