// @vitest-environment node
//
// Dos reglas de imports, y la razón por la que son un test y no un linter.
//
// La auditoría pedía `@biomejs/biome` con `organizeImports` o
// `eslint-plugin-simple-import-sort`, y a la vez pedía **no** agregar reglas que
// reformateen todo el código y no tocar el orden del barrel. Las dos cosas no
// entran juntas: el `organizeImports` de Biome 2 ordena también los `export { … }`
// y el `src/index.ts`, así que correrlo tocaba 45 archivos y deshacía dos
// convenciones escritas a propósito —los valores antes que los tipos en cada
// export, y el barrel agrupado por `lib`, `variants` y `components`—.
//
// Lo que había que arreglar eran dos cosas concretas: seis archivos con el import
// de React fuera del primer lugar y un `React.ComponentProps` sin React importado
// (`textarea.tsx`, que compilaba de casualidad por los tipos globales de JSX). Se
// arreglaron a mano, y acá queda la red, que es como el resto del repo sostiene
// sus reglas: `despersonalizacion.test.ts`, `subpaths.test.ts`, `api-publica.test.ts`.
import { readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = fileURLToPath(new URL("..", import.meta.url))

function recorrer(dir: string, salida: string[] = []): string[] {
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada)
    if (statSync(ruta).isDirectory()) recorrer(ruta, salida)
    else if ([".ts", ".tsx"].includes(extname(entrada))) salida.push(ruta)
  }
  return salida
}

const archivos = recorrer(join(root, "src"))

describe("imports", () => {
  it("mira todo src/", () => {
    expect(archivos.length).toBeGreaterThan(60)
  })

  // React primero es la convención de los 52 archivos que ya la cumplían: leer el
  // encabezado y saber de una si el módulo es de React o de Base UI.
  it("el import de React va primero", () => {
    const fuera = archivos.filter((archivo) => {
      const lineas = readFileSync(archivo, "utf8").split("\n")
      const imports = lineas.map((linea, indice) => [linea, indice] as const).filter(([linea]) => linea.startsWith("import "))
      const react = imports.findIndex(([linea]) => /from "react"$/.test(linea.trim()))
      return react > 0
    })
    expect(fuera.map((archivo) => relative(root, archivo))).toEqual([])
  })

  // `textarea.tsx` usaba `React.ComponentProps` sin importar React: compilaba por
  // los tipos globales de JSX, que es una casualidad y no una garantía.
  it("quien usa `React.` lo importa", () => {
    const sinImport = archivos.filter((archivo) => {
      const fuente = readFileSync(archivo, "utf8")
      return /\bReact\.[A-Za-z]/.test(fuente) && !/from "react"/.test(fuente)
    })
    expect(sinImport.map((archivo) => relative(root, archivo))).toEqual([])
  })
})
