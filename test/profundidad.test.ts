// @vitest-environment node
//
// La profundidad es sutil y por eso es fácil perderla en un refactor: un `shadow-card` menos no
// rompe nada, solo aplana un control. Acá queda escrito qué superficie lleva cuál sombra.
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { cardVariants } from "../src/variants/card"
import { inputControlClassName, inputDisabledClassName } from "../src/variants/input"
import { toggleVariants } from "../src/variants/toggle"

const root = join(import.meta.dirname, "..")
const src = (file: string) => readFileSync(join(root, "src", file), "utf8")

describe("profundidad", () => {
  it("lo que flota en reposo lleva shadow-card, y apagado vuelve a ser plano", () => {
    expect(inputControlClassName).toContain("shadow-card")
    expect(inputDisabledClassName).toContain("data-disabled:shadow-none")
    expect(toggleVariants()).toContain("shadow-card")
    expect(toggleVariants()).toContain("data-disabled:shadow-none")
    for (const file of [
      "components/kbd.tsx",
      "components/toolbar.tsx",
      "components/theme-switcher.tsx",
      "components/alert.tsx",
      "components/table.tsx",
      "components/app-shell.tsx",
      "components/sidebar.tsx",
    ]) {
      expect(src(file), file).toContain("shadow-card")
    }
  })

  it("checkbox y radio: vacíos flotan como un input, marcados se aprietan como un botón", () => {
    for (const file of ["components/checkbox.tsx", "components/radio-group.tsx"]) {
      const code = src(file)
      expect(code, file).toContain("shadow-card")
      expect(code, file).toContain("data-checked:shadow-button-inverted")
      expect(code, file).toContain("data-disabled:shadow-none")
    }
  })

  it("las pistas van hundidas: shadow-track en Switch, Slider, Progress, Meter y la Card subtle", () => {
    for (const file of ["components/switch.tsx", "components/slider.tsx", "components/progress.tsx", "components/meter.tsx"]) {
      expect(src(file), file).toContain("shadow-track")
    }
    expect(cardVariants({ variant: "subtle" })).toContain("shadow-track")
    expect(cardVariants({ variant: "default" })).not.toContain("shadow-track")
  })

  it("los tokens existen en los dos temas y twMerge los conoce", () => {
    const css = src("styles/theme.css")
    for (const name of ["card", "card-hover", "button", "button-inverted", "track"]) {
      expect(css.match(new RegExp(`--sf-shadow-${name}:`, "g"))?.length, name).toBe(2)
      expect(css, name).toContain(`--shadow-${name}: var(--sf-shadow-${name})`)
    }
    expect(src("lib/utils.ts")).toContain('"card", "card-hover", "button", "button-inverted", "track"')
  })
})
