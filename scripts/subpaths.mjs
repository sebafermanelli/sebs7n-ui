// La tabla de subpaths, generada desde `package.json#exports` y el disco.
//
// Estaba escrita a mano en dos lugares (README e instalacion.md) y decían cosas
// distintas, las dos incompletas: faltaban `lib/schema`, `lib/render` y
// `variants/tag`. Una tabla de entry points es exactamente el tipo de doc que
// nadie actualiza al agregar un archivo, así que no se mantiene: se genera.
//
//   node scripts/gen-subpaths.mjs   reescribe el bloque del README
//   test/subpaths.test.ts           falla si el README quedó desactualizado
//   docs/site: la sustitución {{subpaths}} de instalacion.md
import { readdirSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"

export const INICIO = "<!-- subpaths: generado por scripts/gen-subpaths.mjs -->"
export const FIN = "<!-- /subpaths -->"

const nombres = (root, dir, ext) =>
  readdirSync(join(root, dir))
    .filter((file) => file.endsWith(ext))
    .map((file) => basename(file, ext))
    .sort()

const lista = (items) => items.map((item) => `\`${item}\``).join(" · ")

/** Filas de la tabla, en el orden en que se leen los `exports`. */
export function subpaths(root) {
  const exports = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).exports
  const componentes = nombres(root, "src/components", ".tsx")
  const variantes = nombres(root, "src/variants", ".ts")
  const libs = nombres(root, "src/lib", ".ts")
  const tokens = nombres(root, "tokens", ".json")

  const filas = []
  const agregar = (patron, subpath, que) => {
    if (!(patron in exports)) throw new Error(`package.json#exports ya no tiene "${patron}": actualizá scripts/subpaths.mjs`)
    filas.push([subpath, que])
  }

  agregar(".", "`sebs7n-ui`", `El barrel: los ${componentes.length} componentes, las variantes y \`cn\`. Ver la nota de abajo antes de usarlo.`)
  agregar("./*", "`sebs7n-ui/<componente>`", `${componentes.length}, en kebab-case: ${lista(componentes)}`)
  agregar("./variants/*", "`sebs7n-ui/variants/<nombre>`", `Clases sin \`"use client"\`: ${lista(variantes)}`)
  agregar("./lib/*", "`sebs7n-ui/lib/<nombre>`", `Funciones puras: ${lista(libs)}`)
  agregar("./labels", "`sebs7n-ui/labels`", "`LabelsProvider`, `useLabels` y `defaultLabels`: los textos internos, para traducirlos.")
  agregar("./tokens/*.json", "`sebs7n-ui/tokens/<archivo>.json`", `Los tokens en crudo: ${lista(tokens)}`)
  agregar("./theme.css", "`sebs7n-ui/theme.css`", "Los tokens y el `@source` del `dist`. Es el único import obligatorio.")
  agregar("./styles.css", "`sebs7n-ui/styles.css`", "La hoja precompilada. Alternativa a `theme.css`, no complemento.")
  return filas
}

export function subpathsTable(root) {
  const filas = subpaths(root)
  return [
    "| Subpath | Qué trae |",
    "|---|---|",
    ...filas.map(([subpath, que]) => `| ${subpath} | ${que} |`),
  ].join("\n")
}

/** Reemplaza el bloque marcado de un markdown. Devuelve el texto nuevo. */
export function replaceBlock(text, table) {
  const inicio = text.indexOf(INICIO)
  const fin = text.indexOf(FIN)
  if (inicio === -1 || fin === -1) throw new Error(`Faltan los marcadores ${INICIO} … ${FIN}`)
  return `${text.slice(0, inicio)}${INICIO}\n\n${table}\n\n${text.slice(fin)}`
}
