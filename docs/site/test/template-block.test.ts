import { describe, expect, it } from "vitest"
import { fileURLToPath } from "node:url"

import { blockRoutes, buildDashboardBlock, readTemplate, templateMarkdown } from "../scripts/lib/template-block.mjs"

const dir = fileURLToPath(new URL("../app/templates/dashboard", import.meta.url))
const files = readTemplate(dir)

describe("readTemplate", () => {
  it("lee los 23 archivos: primero layout y páginas, después lib, state, data y componentes", () => {
    expect(files).toHaveLength(23)
    expect(files.slice(0, 5).map((f) => f.path)).toEqual([
      "layout.tsx",
      "page.tsx",
      "invoices/page.tsx",
      "customers/page.tsx",
      "settings/page.tsx",
    ])
    expect(files.every((f) => f.content.length > 0)).toBe(true)
  })
})

describe("blockRoutes", () => {
  it("el bloque vive en /dashboard y sin galería", () => {
    const routes = blockRoutes(files.find((f) => f.path === "_lib/routes.ts")!.content)
    expect(routes).toContain('export const DASHBOARD_PATH = "/dashboard"')
    expect(routes).toContain("export const GALLERY_PATH: string | null = null")
    expect(routes).not.toMatch(/^export .*\/templates/m)
  })

  it("si el archivo cambia y el reemplazo no encuentra qué cambiar, corta", () => {
    expect(() => blockRoutes("export const X = 1")).toThrow(/routes\.ts/)
  })
})

describe("templateMarkdown", () => {
  it("pone el texto a mano y después cada archivo con su ruta y su código", () => {
    const md = templateMarkdown({ intro: "# Dashboard\n\nIntro.", files })
    expect(md.startsWith("# Dashboard")).toBe(true)
    for (const f of files) {
      expect(md).toContain(`### \`${f.path}\``)
      expect(md).toContain(f.content.trim().split("\n")[0]!)
    }
  })
})

describe("buildDashboardBlock", () => {
  const block = buildDashboardBlock({ files, site: "https://ui.example.com", author: "yo" })

  it("es un registry:block que instala el paquete y no copia componentes", () => {
    expect(block.name).toBe("dashboard")
    expect(block.type).toBe("registry:block")
    expect(block.dependencies).toEqual(["sebs7n-ui", "@base-ui/react", "sonner", "lucide-react", "recharts", "next-themes"])
    expect(block.registryDependencies).toBeUndefined()
  })

  it("cada archivo va a app/dashboard con la misma estructura", () => {
    expect(block.files.map((f: { target: string }) => f.target)).toContain("app/dashboard/invoices/page.tsx")
    for (const f of block.files) {
      expect(f.type).toBe("registry:file")
      expect(f.target.startsWith("app/dashboard/")).toBe(true)
    }
  })

  it("ningún archivo apunta al sitio ni a componentes copiados", () => {
    for (const f of block.files) {
      expect(f.content, f.target).not.toMatch(/(href=|from )"\/?[^"]*\/templates|@\/components\/ui|@\/\.generated/)
    }
  })
})
