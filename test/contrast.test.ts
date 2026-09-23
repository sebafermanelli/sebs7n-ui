// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { contrastRatio, luminanceOfHex } from "./color"

// Los valores salen de los CSS del paquete, no de una copia: si alguien cambia
// un token, cambia el número que se verifica acá. Los pares son los que la
// auditoría de 0.4.0 encontró abajo de AA, más sus vecinos, para que la
// corrección no se pierda en el próximo retoque de color.
const root = join(import.meta.dirname, "..")
const read = (file: string) => readFileSync(join(root, "src/styles", file), "utf8")

/** `#fff` → `#ffffff`: la fórmula de color.ts lee de a dos caracteres. */
const expandir = (hex: string) => (hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join("")}` : hex)

/** `--x: #aabbcc;` dentro del bloque `:root` (claro) o `.dark` (oscuro). */
function tokens(file: string, theme: "light" | "dark"): Record<string, string> {
  const css = read(file)
  const inicio = css.indexOf(theme === "light" ? ":root {" : ".dark {")
  const cuerpo = css.slice(inicio, css.indexOf("\n  }", inicio))
  return Object.fromEntries(
    [...cuerpo.matchAll(/(--sf-[a-z0-9-]+):\s*(#[0-9a-f]{3,8});/g)].map(([, name, value]) => [name, expandir(value!)])
  )
}

const paleta = {
  light: { ...tokens("colors.css", "light"), ...tokens("theme.css", "light") },
  dark: { ...tokens("colors.css", "dark"), ...tokens("theme.css", "dark") },
}

/**
 * `--sf-button-error-*` se declara una sola vez, en `:root`: es igual en los dos
 * temas a propósito (ver el comentario en theme.css). Lo que sí cambia por tema
 * es el fondo de reposo, `bg-red-800`.
 */
const heredado = (theme: "light" | "dark", token: string) => paleta[theme][token] ?? paleta.light[token]!

const ratio = (fg: string, bg: string) => contrastRatio(luminanceOfHex(fg), luminanceOfHex(bg))

describe("Button variant=\"destructive\" (WCAG 1.4.3, texto normal)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = heredado(theme, "--sf-button-error-fg")
    const estados = {
      reposo: paleta[theme]["--sf-red-800"]!,
      hover: heredado(theme, "--sf-button-error-hover"),
      active: heredado(theme, "--sf-button-error-active"),
    }
    for (const [estado, bg] of Object.entries(estados)) {
      it(`${theme} · ${estado}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// Los atajos de DropdownMenu, ContextMenu y Menubar son contenido informativo,
// no decoración: enseñan el otro camino a la misma acción. En `gray-700` daban
// 3,23:1 sobre la superficie del popup y 2,71:1 sobre el ítem resaltado.
describe("Atajo de menú sobre el popup (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-900"]!
    const fondos = {
      popup: paleta[theme]["--sf-background-100"]!,
      "ítem resaltado": paleta[theme]["--sf-gray-200"]!,
      "ítem apretado": paleta[theme]["--sf-gray-300"]!,
    }
    for (const [fondo, bg] of Object.entries(fondos)) {
      it(`${theme} · ${fondo}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// El placeholder es texto, no decoración: en un formulario largo es lo único
// que dice qué espera el campo hasta que alguien escribe. En `gray-700` —el
// tono de Geist— daba 3,23:1 en claro. Un solo tono para los dos temas: el
// mismo `gray-900` del texto secundario pasa en los dos.
describe("Placeholder sobre la superficie del campo (WCAG 1.4.3)", () => {
  for (const theme of ["light", "dark"] as const) {
    const fg = paleta[theme]["--sf-gray-900"]!
    const bg = paleta[theme]["--sf-background-100"]!
    it(`${theme}: ${fg} sobre ${bg} llega a 4.5:1`, () => {
      expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5)
    })
  }
})
