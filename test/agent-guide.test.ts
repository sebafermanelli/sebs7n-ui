import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { buildAgentGuide } from "../scripts/gen-agent-guide.mjs"

// Con `process.cwd()` (vitest corre desde la raíz): `readFileSync(new URL(…, import.meta.url))` falla en jsdom.
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"))

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
})
