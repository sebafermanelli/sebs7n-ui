import { describe, expect, it } from "vitest"
import { fileURLToPath } from "node:url"

import { blockRoutes, buildDashboardBlock, buildTemplateBlock, readTemplate, templateMarkdown, TEMPLATES } from "../scripts/lib/template-block.mjs"

const dir = fileURLToPath(new URL("../app/templates/dashboard", import.meta.url))
const files = readTemplate(dir)

describe("readTemplate", () => {
  it("lee los 57 archivos: primero layout y páginas, después lib, state, data y componentes", () => {
    expect(files).toHaveLength(57)
    expect(files.slice(0, 6).map((f) => f.path)).toEqual([
      "layout.tsx",
      "page.tsx",
      "invoices/page.tsx",
      "customers/page.tsx",
      "customers/[id]/page.tsx",
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
    expect(block.dependencies).toEqual(["sebs7n-ui", "@base-ui/react", "@dnd-kit/core", "sonner", "lucide-react", "recharts", "next-themes"])
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

describe("TEMPLATES", () => {
  it("dashboard, landing, consola y blog, en ese orden", () => {
    expect(TEMPLATES.map((t) => t.slug)).toEqual(["dashboard", "landing", "console", "blog"])
  })

  it("el bloque de la landing va a app/landing e instala el paquete", () => {
    const landing = TEMPLATES.find((t) => t.slug === "landing")!
    const block = buildTemplateBlock({ template: landing, files: [{ path: "page.tsx", content: "x" }], site: "https://s", author: "a" })
    expect(block.name).toBe("landing")
    expect(block.files[0]!.target).toBe("app/landing/page.tsx")
    expect(block.dependencies).toContain("sebs7n-ui")
    expect(block.docs).toContain("https://s/templates/landing.md")
  })
})

describe("consola", () => {
  const consoleDir = fileURLToPath(new URL("../app/templates/console", import.meta.url))
  const consoleFiles = readTemplate(consoleDir)
  const template = TEMPLATES.find((t) => t.slug === "console")!
  const block = buildTemplateBlock({ template, files: consoleFiles, site: "https://s", author: "a" })

  it("el bloque vive en /console y sin galería", () => {
    const routes = block.files.find((f: { target: string }) => f.target === "app/console/_lib/routes.ts")!.content
    expect(routes).toContain('export const CONSOLE_PATH = "/console"')
    expect(routes).toContain("export const GALLERY_PATH: string | null = null")
    expect(routes).not.toMatch(/^export .*\/templates/m)
  })

  it("layout y páginas primero", () => {
    expect(consoleFiles.slice(0, 7).map((f) => f.path)).toEqual(["layout.tsx", "page.tsx", "services/[id]/page.tsx", "deployments/page.tsx", "logs/page.tsx", "costs/page.tsx", "variables/page.tsx"])
  })
})

describe("blog", () => {
  const blogDir = fileURLToPath(new URL("../app/templates/blog", import.meta.url))
  const blogFiles = readTemplate(blogDir)
  const template = TEMPLATES.find((t) => t.slug === "blog")!
  const block = buildTemplateBlock({ template, files: blogFiles, site: "https://s", author: "a" })

  it("el bloque vive en /blog y sin galería", () => {
    const routes = block.files.find((f: { target: string }) => f.target === "app/blog/_lib/routes.ts")!.content
    expect(routes).toContain('export const BLOG_PATH = "/blog"')
    expect(routes).toContain("export const GALLERY_PATH: string | null = null")
    expect(routes).not.toMatch(/^export .*\/templates/m)
  })

  it("las páginas primero, con la del artículo después de la portada", () => {
    expect(blogFiles.slice(0, 2).map((f) => f.path)).toEqual(["page.tsx", "[slug]/page.tsx"])
  })
})
