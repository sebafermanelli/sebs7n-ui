// @vitest-environment node
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { buildAgentGuide } from "../scripts/gen-agent-guide.mjs"

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))

describe("la guía para agentes dentro del paquete", () => {
  const guide = buildAgentGuide({
    source: "Ver [Button](/docs/components/button) y [el template](/templates/dashboard).",
    version: "9.9.9",
    site: "https://ui.example.com",
  })

  it("lleva título con la versión y de dónde sale", () => {
    expect(guide.startsWith("# Guía para agentes — sebs7n-ui 9.9.9")).toBe(true)
    expect(guide).toContain("https://ui.example.com/docs/guia-agentes")
  })

  it("los links del sitio pasan a absolutos", () => {
    expect(guide).toContain("[Button](https://ui.example.com/docs/components/button)")
    expect(guide).toContain("[el template](https://ui.example.com/templates/dashboard)")
    expect(guide).not.toMatch(/\]\(\//)
  })

  it("viaja en el tarball y se genera antes de empacar", () => {
    expect(pkg.files).toContain("agents")
    expect(pkg.scripts.prepack).toMatch(/gen-agent-guide/)
  })

  // `docs/site/scripts/sync-ui.mjs` parsea la salida de `npm pack --json`, y el `prepack` corre
  // adentro: una línea de log en stdout rompe ese JSON y con él el build del sitio (y el deploy).
  it("el script no escribe nada en stdout", () => {
    const stdout = execFileSync("node", ["scripts/gen-agent-guide.mjs"], { encoding: "utf8" })
    expect(stdout).toBe("")
  })
})
