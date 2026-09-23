// @vitest-environment node
import { execFileSync, execSync } from "node:child_process"
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { basename, join } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vitest"

const root = fileURLToPath(new URL("..", import.meta.url))
const read = (path: string) => readFileSync(join(root, path), "utf8")
const modules = (dir: string, ext: RegExp) =>
  readdirSync(join(root, "src", dir))
    .filter((file) => ext.test(file))
    .map((file) => basename(file).replace(ext, ""))
const components = modules("components", /\.tsx$/)
const variants = modules("variants", /\.ts$/)
const libs = modules("lib", /\.ts$/)

/** Resuelve un specifier como lo haría Node ESM desde dentro del paquete (self-reference). */
const resolve = (specifier: string) =>
  execFileSync("node", ["--input-type=module", "-e", `console.log(import.meta.resolve(${JSON.stringify(specifier)}))`], {
    cwd: root,
    encoding: "utf8",
  }).trim()

describe("build", () => {
  beforeAll(() => {
    execSync("npm run build", { cwd: root, stdio: "pipe" })
  }, 120_000)

  it("los componentes conservan \"use client\" y las variantes no lo tienen", () => {
    expect(read("dist/components/button.js").startsWith('"use client"')).toBe(true)
    expect(read("dist/components/dropdown-menu.js").startsWith('"use client"')).toBe(true)
    expect(read("dist/variants/button.js")).not.toContain("use client")
    expect(read("dist/variants/menu.js")).not.toContain("use client")
    expect(read("dist/index.js")).not.toContain("use client")
    for (const file of ["sidebar", "app-shell", "user-menu", "theme-switcher", "alert-dialog", "combobox", "autocomplete"]) {
      expect(read(`dist/components/${file}.js`).startsWith('"use client"'), file).toBe(true)
    }
    // Sin estado: se pueden usar en Server Components.
    for (const file of ["kbd", "page-header", "empty-state", "stat", "app-shell-content"]) {
      expect(read(`dist/components/${file}.js`), file).not.toContain("use client")
    }
    expect(read("dist/variants/sidebar.js")).not.toContain("use client")
    expect(read("dist/variants/input.js")).not.toContain("use client")
  })

  it("dist/styles.css trae las clases de los componentes y no la paleta de Tailwind", () => {
    const css = read("dist/styles.css")
    for (const selector of [
      ".bg-gray-1000",
      ".hover\\:bg-button-primary-hover",
      ".focus-visible\\:focus-ring",
      ".focus\\:focus-border",
      ".data-highlighted\\:bg-gray-200",
      ".shadow-menu",
      ".text-heading-20",
      ".animate-skeleton",
    ]) {
      expect(css, selector).toContain(selector)
    }
    expect(css).not.toContain("--color-red-500:")
    expect(css).not.toMatch(/\*,\s*::after,\s*::before\s*\{\s*box-sizing/)
  })

  it("exporta el tipado", () => {
    expect(read("dist/index.d.ts")).toContain("export * from \"./components/button.js\"")
    // Clases de menú e Input públicas para la lista a medida (v1.2).
    expect(read("dist/index.d.ts")).toContain('export { menuItemClassName, menuPopupClassName } from "./variants/menu.js"')
    expect(read("dist/index.d.ts")).toContain('export * from "./components/combobox.js"')
    expect(read("dist/index.d.ts")).toContain('export * from "./components/autocomplete.js"')
  })

  it("cada componente, variante y lib tiene su entry point en dist", () => {
    for (const [dir, names] of [["components", components], ["variants", variants], ["lib", libs]] as const) {
      for (const name of names) {
        for (const ext of [".js", ".d.ts"]) {
          expect(existsSync(join(root, "dist", dir, name + ext)), `dist/${dir}/${name}${ext}`).toBe(true)
        }
      }
    }
  })

  it("los subpaths resuelven por exports", () => {
    expect(resolve("sebs7n-ui")).toMatch(/\/dist\/index\.js$/)
    expect(resolve("sebs7n-ui/button")).toMatch(/\/dist\/components\/button\.js$/)
    expect(resolve("sebs7n-ui/theme-switcher")).toMatch(/\/dist\/components\/theme-switcher\.js$/)
    expect(resolve("sebs7n-ui/variants/button")).toMatch(/\/dist\/variants\/button\.js$/)
    expect(resolve("sebs7n-ui/lib/utils")).toMatch(/\/dist\/lib\/utils\.js$/)
    expect(resolve("sebs7n-ui/styles.css")).toMatch(/\/dist\/styles\.css$/)
    expect(resolve("sebs7n-ui/theme.css")).toMatch(/\/src\/styles\/theme\.css$/)
    // Los JSON de tokens tienen su patrón propio. Con el comodín `./*` solo,
    // `sebs7n-ui/tokens/geist.json` resolvía a `dist/components/tokens/geist.json.js`.
    expect(resolve("sebs7n-ui/tokens/geist.json")).toMatch(/\/tokens\/geist\.json$/)
    expect(existsSync(new URL(resolve("sebs7n-ui/tokens/brands.json")))).toBe(true)
  })

  // Un `exports` con comodines hace que "esto es interno" sea una promesa del
  // comentario y no del paquete: mientras `shell-context.ts` estuvo en `src/lib/`,
  // `import "sebs7n-ui/lib/shell-context"` resolvía y funcionaba. En
  // `src/internal/` no hay patrón que lo alcance.
  it("lo interno no es alcanzable por ningún subpath", () => {
    for (const specifier of ["sebs7n-ui/lib/shell-context", "sebs7n-ui/internal/shell-context"]) {
      let resuelto: string | null = null
      try {
        resuelto = resolve(specifier)
      } catch {
        resuelto = null
      }
      expect(resuelto === null || !existsSync(new URL(resuelto)), specifier).toBe(true)
    }
    expect(existsSync(join(root, "dist/internal/shell-context.js"))).toBe(true)
  })

  it("npm pack incluye los entry points por módulo", () => {
    const [pack] = JSON.parse(execSync("npm pack --dry-run --json --ignore-scripts", { cwd: root, encoding: "utf8" })) as [
      { files: { path: string }[] },
    ]
    const files = new Set(pack.files.map((file) => file.path))
    const expected = [
      "dist/index.js",
      "dist/index.d.ts",
      "dist/styles.css",
      "src/styles/theme.css",
      ...components.flatMap((name) => [`dist/components/${name}.js`, `dist/components/${name}.d.ts`]),
      ...variants.flatMap((name) => [`dist/variants/${name}.js`, `dist/variants/${name}.d.ts`]),
      ...libs.flatMap((name) => [`dist/lib/${name}.js`, `dist/lib/${name}.d.ts`]),
      // Interno pero publicado: los componentes del shell lo importan en runtime.
      "dist/internal/shell-context.js",
    ]
    for (const file of expected) expect(files.has(file), file).toBe(true)
  })

  it("TypeScript (moduleResolution bundler) tipa los subpaths", () => {
    // Tiene que vivir dentro del paquete para que "sebs7n-ui" resuelva por self-reference.
    const dir = mkdtempSync(join(root, ".tmp-types-"))
    try {
      writeFileSync(
        join(dir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            target: "ES2022",
            lib: ["ES2022", "DOM"],
            module: "ESNext",
            moduleResolution: "Bundler",
            jsx: "react-jsx",
            strict: true,
            noEmit: true,
            skipLibCheck: true,
            types: [],
          },
          files: ["consumer.tsx"],
        }),
      )
      writeFileSync(
        join(dir, "consumer.tsx"),
        [
          'import { Button, type ButtonProps } from "sebs7n-ui/button"',
          'import { Card, CardContent } from "sebs7n-ui/card"',
          'import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"',
          'import { buttonVariants } from "sebs7n-ui/variants/button"',
          'import { cn } from "sebs7n-ui/lib/utils"',
          'import { Button as BarrelButton } from "sebs7n-ui"',
          "",
          'const props: ButtonProps = { variant: "secondary" }',
          'const className: string = cn(buttonVariants({ variant: "outline" }), "x")',
          "export const Page = () => (",
          "  <Card><CardContent><Button {...props} className={className} /><BarrelButton /><ThemeSwitcher /></CardContent></Card>",
          ")",
          "// Si el subpath no tuviera tipos, esto sería `any` y el expect-error fallaría.",
          '// @ts-expect-error variante inexistente',
          'buttonVariants({ variant: "nope" })',
          "",
        ].join("\n"),
      )
      execFileSync(join(root, "node_modules/.bin/tsc"), ["-p", dir], { cwd: root, encoding: "utf8", stdio: "pipe" })
    } catch (error) {
      const { stdout, stderr } = error as { stdout?: string; stderr?: string }
      throw new Error(`tsc falló:\n${stdout ?? ""}${stderr ?? ""}`)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
