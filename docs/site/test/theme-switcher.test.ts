import { ThemeProvider } from "next-themes"
import { createElement, type ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { ThemeSwitcher } from "sebs7n-ui/theme-switcher"
import { describe, expect, it } from "vitest"

import { ThemeSwitcherEstatico } from "../app/_components/theme-switcher"

// Lo que el paquete pinta en el servidor, con el mismo ThemeProvider que `providers.tsx`.
const html = (nodo: ReactNode) =>
  renderToStaticMarkup(createElement(ThemeProvider, { attribute: "class", defaultTheme: "system", enableSystem: true }, nodo))
    // Los `id` los genera React y los `<input>` ocultos son de Base UI: no se ven ni se leen.
    .replace(/ id="[^"]*"/g, "")
    .replace(/<input[^>]*\/?>/g, "")
    // next-themes agrega su script de arranque: es el mismo en los dos.
    .replace(/<script[\s\S]*?<\/script>/g, "")
    // El orden de los atributos no cambia lo que se ve: se comparan ordenados.
    .replace(/<([a-z]+)((?: [\w:-]+="[^"]*")*)(\/?)>/g, (_, tag: string, attrs: string, cierre: string) =>
      `<${tag}${(attrs.match(/ [\w:-]+="[^"]*"/g) ?? []).sort().join("")}${cierre}>`
    )

describe("ThemeSwitcherEstatico", () => {
  it("renderiza lo mismo que el ThemeSwitcher del paquete en el servidor", () => {
    expect(html(createElement(ThemeSwitcherEstatico))).toBe(html(createElement(ThemeSwitcher)))
  })
})
