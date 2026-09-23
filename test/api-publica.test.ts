// @vitest-environment node
//
// El tipo de las props es parte de la API pública tanto como el componente.
// Quien envuelve un `DialogContent` en su propio componente necesita nombrar sus
// props; si el tipo no se exporta, le queda copiarlo a mano o escribir
// `React.ComponentProps<typeof DialogContent>`, que funciona pero no aparece en
// la doc ni sobrevive a un refactor.
//
// En 0.4.0 había 85 tipos `*Props` declarados y no exportados —`dialog`, `sheet`,
// `drawer`, `tabs`, `select` y los tres menús no exportaban ninguno—. Este test es
// la red: si alguien declara un tipo `*Props` y se olvida de sumarlo al `export`,
// falla acá y no en el `npm install` de la app.
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = fileURLToPath(new URL("..", import.meta.url))
const dir = join(root, "src/components")
const archivos = readdirSync(dir).filter((archivo) => archivo.endsWith(".tsx"))

/** Los nombres que el archivo saca por cualquiera de sus `export { … }`. */
function exportados(fuente: string): Set<string> {
  const nombres = new Set<string>()
  for (const bloque of fuente.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const entrada of (bloque[1] ?? "").split(",")) {
      const nombre = entrada.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0]?.trim()
      if (nombre) nombres.add(nombre)
    }
  }
  return nombres
}

describe("API pública: los tipos de props se exportan", () => {
  it("mira los 58 componentes", () => {
    expect(archivos.length).toBeGreaterThan(50)
  })

  it.each(archivos)("%s no declara ningún tipo *Props sin exportar", (archivo) => {
    const fuente = readFileSync(join(dir, archivo), "utf8")
    const publicos = exportados(fuente)
    const sinExportar = [...fuente.matchAll(/^(export\s+)?type\s+(\w+Props)\b/gm)]
      .filter((match) => !match[1] && !publicos.has(match[2] as string))
      .map((match) => match[2] as string)
    expect(sinExportar).toEqual([])
  })

  // El barrel es la única forma de llegar a `cn`, `validate` o `tagVariants` sin conocer la
  // ruta, y hasta 0.5.0 se mantenía a mano: `lib/render`, `lib/schema` —que `form.tsx`
  // documenta como públicos— y cuatro constantes de `variants/` no salían por ahí, así que
  // existían para quien ya sabía el subpath y para nadie más.
  //
  // El orden del archivo no se toca: agrupa `lib`, `variants` y componentes, y dentro de cada
  // grupo es el de `ls`. Lo que se verifica es que no falte nada, no cómo está ordenado.
  it("el barrel exporta todo lo público de lib/ y variants/", () => {
    const barrel = readFileSync(join(root, "src/index.ts"), "utf8")
    const faltan: string[] = []
    for (const carpeta of ["lib", "variants"]) {
      const ruta = join(root, "src", carpeta)
      for (const archivo of readdirSync(ruta)) {
        const fuente = readFileSync(join(ruta, archivo), "utf8")
        const nombres = new Set<string>()
        for (const match of fuente.matchAll(/^export (?:async )?(?:function|const|type|interface)\s+(\w+)/gm)) {
          nombres.add(match[1] as string)
        }
        for (const bloque of fuente.matchAll(/^export \{([^}]*)\}/gm)) {
          for (const entrada of (bloque[1] ?? "").split(",")) {
            const nombre = entrada.trim().replace(/^type\s+/, "").split(/\s+as\s+/).pop()?.trim()
            if (nombre) nombres.add(nombre)
          }
        }
        for (const nombre of nombres) {
          if (!new RegExp(`\\b${nombre}\\b`).test(barrel)) faltan.push(`${carpeta}/${archivo}: ${nombre}`)
        }
      }
    }
    expect(faltan).toEqual([])
  })

  // Un tipo declarado dos veces con el mismo nombre en dos componentes distintos no
  // se puede exportar: el barrel hace `export *` de los 58 y el nombre choca. Pasó con
  // `InsetProps`, que estaba tres veces —DropdownMenu, ContextMenu y Menubar— y terminó
  // siendo `MenuInsetProps` en `variants/menu.ts`.
  it("ningún tipo *Props se llama igual en dos componentes", () => {
    const donde = new Map<string, string[]>()
    for (const archivo of archivos) {
      const fuente = readFileSync(join(dir, archivo), "utf8")
      for (const match of fuente.matchAll(/^(?:export\s+)?type\s+(\w+Props)\b/gm)) {
        const nombre = match[1] as string
        donde.set(nombre, [...(donde.get(nombre) ?? []), archivo])
      }
    }
    const repetidos = [...donde.entries()].filter(([, archivos]) => archivos.length > 1)
    expect(Object.fromEntries(repetidos)).toEqual({})
  })
})
