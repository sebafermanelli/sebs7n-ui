import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { LocaleProvider } from "../src/components/locale-provider"
import { Slider } from "../src/components/slider"
import { Tabs, TabsList, TabsTrigger } from "../src/components/tabs"

// RTL de verdad (3.0): el paquete usa propiedades lógicas (start/end) en vez de left/right, y la dirección de lectura llega a los
// componentes de Base UI por `LocaleProvider dir`. Este test es la barrera: una clase física nueva en `src/` falla acá.
const root = join(import.meta.dirname, "..", "src")
const archivos = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? archivos(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []))

// Lo que sigue siendo físico a propósito: la API habla de lados de la pantalla (`side`, `swipe-direction`, `labelSide`), el centrado
// con `left-1/2 -translate-x-1/2` es simétrico, y los gráficos (`metric-chart`) no se espejan: el tiempo corre de izquierda a derecha.
const EXENTA = /side=|data-side|swipe-direction|translate-x|labelSide|side ===|position ===|metric-chart/
const FISICA = /(?<![\w-])(-?)(ml|mr|pl|pr)-[\d\[(]|(?<![\w-])text-(left|right)(?![\w-])|(?<![\w-])border-[lr](?![a-z])|(?<![\w-])rounded-(l|r|tl|tr|bl|br)(?=-|["' `])|(?<![\w-])-?(left|right)-[\d\[(]/

describe("propiedades lógicas", () => {
  it("ninguna clase de src/ usa left/right, ml/mr, pl/pr, text-left/right, border-l/r ni rounded-l/r (salvo las exentas)", () => {
    const fallas: string[] = []
    for (const f of archivos(root)) {
      if (f.endsWith(".d.ts") || f.includes("metric-chart")) continue
      readFileSync(f, "utf8").split("\n").forEach((linea, i) => {
        if (linea.trim().startsWith("//") || linea.trim().startsWith("*") || EXENTA.test(linea)) return
        if (FISICA.test(linea)) fallas.push(`${f.slice(root.length + 1)}:${i + 1}: ${linea.trim().slice(0, 100)}`)
      })
    }
    expect(fallas).toEqual([])
  })
})

describe("dirección de lectura", () => {
  it("Tabs: con dir=rtl, ArrowLeft va a la pestaña siguiente", async () => {
    const user = userEvent.setup()
    render(
      <div dir="rtl">
        <LocaleProvider dir="rtl">
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">Uno</TabsTrigger>
              <TabsTrigger value="b">Dos</TabsTrigger>
            </TabsList>
          </Tabs>
        </LocaleProvider>
      </div>
    )
    await user.tab()
    expect(screen.getByRole("tab", { name: "Uno" })).toHaveFocus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("tab", { name: "Dos" })).toHaveFocus()
  })

  it("Slider: con dir=rtl, ArrowLeft sube el valor", async () => {
    const user = userEvent.setup()
    render(
      <div dir="rtl">
        <LocaleProvider dir="rtl">
          <Slider aria-label="Volumen" defaultValue={50} max={100} min={0} />
        </LocaleProvider>
      </div>
    )
    const thumb = screen.getByRole("slider")
    thumb.focus()
    await user.keyboard("{ArrowLeft}")
    expect(Number(thumb.getAttribute("aria-valuenow"))).toBeGreaterThan(50)
  })

  it("sin dir, ArrowRight sigue yendo a la siguiente (LTR)", async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Uno</TabsTrigger>
          <TabsTrigger value="b">Dos</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    await user.tab()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("tab", { name: "Dos" })).toHaveFocus()
  })
})
