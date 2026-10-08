// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const theme = readFileSync(fileURLToPath(new URL("../src/styles/theme.css", import.meta.url)), "utf8")

describe("font-display", () => {
  it("el token sale de --font-heading, que pone la app, y cae en la sans si no lo pone", () => {
    const decl = theme.match(/^\s*--font-display:\s*([^;]+);/m)?.[1]
    expect(decl).toBeDefined()
    expect(decl).toMatch(/^var\(--font-heading, /)
    expect(decl).toContain("--font-inter")
  })

  it("el paquete no carga fuentes", () => {
    expect(theme).not.toMatch(/@font-face|@import url\(.*fonts/)
  })
})
