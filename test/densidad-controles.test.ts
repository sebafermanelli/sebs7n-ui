// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { buttonVariants } from "../src/variants/button"
import { inputControlClassName, inputPaddingClassName, inputSizeClassName } from "../src/variants/input"
import { toggleVariants } from "../src/variants/toggle"

/**
 * El tamaño del texto y el alto de los controles (revisión visual de R1).
 *
 * R1 llevó `text-body` a 17 px, el cuerpo de iCloud. iCloud usa 17 en las filas de una lista y en
 * el texto de una página; adentro de un control, un popover o un menú usa 14 (y 12 lo secundario).
 * Con 17 adentro, un campo o un HoverCard se veían desproporcionados al lado de un Badge de 12.
 *
 * Y un campo y un botón en la misma fila tienen que medir lo mismo: los campos y los botones
 * comparten una sola escala de alto —sm 28, md 36, lg 40—, la del search field de iCloud (32–36)
 * y su botón de modal (36).
 */
const root = join(import.meta.dirname, "..")
const fuente = (archivo: string) => readFileSync(join(root, "src", archivo), "utf8")

// Controles, popovers y menús: el texto principal no pasa de 15 px.
const CONTROLES = [
  "components/input.tsx",
  "components/textarea.tsx",
  "components/number-field.tsx",
  "components/otp-field.tsx",
  "components/date-picker.tsx",
  "components/color-picker.tsx",
  "components/select.tsx",
  "components/combobox.tsx",
  "components/autocomplete.tsx",
  "components/toolbar.tsx",
  "components/kbd.tsx",
  "components/tag.tsx",
  "components/badge.tsx",
  "components/tooltip.tsx",
  "components/sonner.tsx",
  "components/dropdown-menu.tsx",
  "components/context-menu.tsx",
  "components/menubar.tsx",
  "components/navigation-menu.tsx",
  "components/hover-card.tsx",
  "components/popover.tsx",
  "components/command.tsx",
  "components/chat.tsx",
  "components/calendar.tsx",
  "components/toggle.tsx",
  "components/toggle-group.tsx",
  "components/tabs.tsx",
  "components/theme-switcher.tsx",
  "components/user-menu.tsx",
  "variants/button.ts",
  "variants/input.ts",
  "variants/toggle.ts",
  "variants/tag.ts",
  "variants/badge.ts",
  "variants/menu.ts",
  "variants/command.ts",
  "variants/overlay.ts",
  "variants/segmented.ts",
]

// Los títulos que el catálogo pone por encima de 15: el de un popover (17/600) y el de la cabecera
// del chat, que es un panel. Y el campo del chat con el dedo, a 17: con menos de 16 px iOS hace zoom
// al enfocar.
const PERMITIDOS: Record<string, string[]> = {
  "components/popover.tsx": ["text-headline"],
  "components/chat.tsx": ["text-headline", "pointer-coarse:text-body-large"],
  // Los campos, con el dedo, a 17: con menos de 16 px iOS hace zoom al enfocar.
  "variants/input.ts": ["pointer-coarse:text-body-large"],
  "components/command.tsx": ["pointer-coarse:text-body-large"],
  // R4: las pestañas de línea son la navegación de una página, como las de Settings de iCloud, que
  // van en 17 (medido). La segmentada, que sí es un control, sigue en 14.
  "components/tabs.tsx": ["text-body"],
  // R5a: la cabecera de cuenta del menú de iCloud lleva el nombre en 17/600 (no es un control).
  "components/user-menu.tsx": ["text-headline"],
}

describe("el texto de un control no pasa de 15 px", () => {
  for (const archivo of CONTROLES) {
    it(archivo, () => {
      const encontrados = [...fuente(archivo).matchAll(/(?:pointer-coarse:)?text-(?:body-large|body|title-\d|large-title|headline)\b/g)].map((m) => m[0])
      const sobran = encontrados.filter((clase) => !(PERMITIDOS[archivo] ?? []).includes(clase))
      expect(sobran).toEqual([])
    })
  }
})

describe("una sola escala de alto para campos y botones", () => {
  it("campos: sm 28, md 36, lg 40; con el dedo sm 36 y md 44", () => {
    expect(inputSizeClassName.split(" ")).toEqual(
      expect.arrayContaining([
        "data-[size=sm]:h-7",
        "data-[size=md]:h-9",
        "data-[size=lg]:h-10",
        "pointer-coarse:data-[size=sm]:h-9",
        "pointer-coarse:data-[size=md]:h-11",
      ])
    )
    expect(inputPaddingClassName).toEqual({ sm: "px-2.5", md: "px-3", lg: "px-3" })
  })

  it("botones: los mismos altos, texto 14 e íconos 16 en todos los tamaños", () => {
    const clases = (size: Parameters<typeof buttonVariants>[0]) => buttonVariants(size).split(" ")
    expect(clases({ size: "sm" })).toEqual(expect.arrayContaining(["h-7", "text-callout"]))
    expect(clases({ size: "md" })).toEqual(expect.arrayContaining(["h-9", "text-callout"]))
    expect(clases({ size: "lg" })).toEqual(expect.arrayContaining(["h-10", "text-callout"]))
    expect(clases({ size: "lg" }).join(" ")).not.toMatch(/size-5/)
    expect(clases({ size: "icon-sm" })).toContain("size-7")
    expect(clases({ size: "icon-md" })).toContain("size-9")
    expect(clases({ size: "icon-lg" })).toContain("size-10")
  })

  // Todos los campos de una línea salen de `inputSizeClassName` (o de `inputShellClassName`, que
  // lo trae): así un Input, un DatePicker y un Select en el mismo formulario miden lo mismo.
  it.each([
    "components/input.tsx",
    "components/date-picker.tsx",
    "components/color-picker.tsx",
    "components/select.tsx",
    "components/combobox.tsx",
    "components/autocomplete.tsx",
    "components/otp-field.tsx",
  ])("%s usa el alto compartido", (archivo) => {
    expect(fuente(archivo)).toMatch(/inputSizeClassName|inputShellClassName/)
  })

  it("las casillas del OTP son cuadrados de los mismos altos", () => {
    const otp = fuente("components/otp-field.tsx")
    for (const clase of ["data-[size=sm]:size-7", "data-[size=md]:size-9", "data-[size=lg]:size-10"]) expect(otp).toContain(clase)
  })

  it("el Combobox con chips crece desde los mismos altos", () => {
    const combobox = fuente("components/combobox.tsx")
    for (const clase of ["data-[size=sm]:min-h-7", "data-[size=md]:min-h-9", "data-[size=lg]:min-h-10"]) expect(combobox).toContain(clase)
  })

  it("en la barra de herramientas, el campo y los botones son del escalón sm (28)", () => {
    const toolbar = fuente("components/toolbar.tsx")
    expect(toolbar).toContain("h-7")
    expect(toolbar).not.toMatch(/\bh-6\b/)
  })

  it("un chip (Toggle) mide lo que un botón sm", () => {
    expect(toggleVariants().split(" ")).toContain("h-7")
  })

  it("el campo del chat mide lo que el botón de enviar (md, 36)", () => {
    expect(fuente("components/chat.tsx")).toContain("min-h-9")
  })
})

// iOS hace zoom a cualquier campo con menos de 16 px al enfocarlo, y no vuelve: con el dedo, el texto
// de todo lo que se escribe sube a 17 (`text-body-large`). Con el mouse sigue en 14.
describe("con el dedo los campos no disparan el zoom de iOS", () => {
  const CAMPOS = [
    "components/input.tsx",
    "components/textarea.tsx",
    "components/otp-field.tsx",
    "components/number-field.tsx",
    "components/date-picker.tsx",
    "components/color-picker.tsx",
    "components/select.tsx",
    "components/combobox.tsx",
    "components/autocomplete.tsx",
    "components/toolbar.tsx",
    "components/chat.tsx",
  ]

  it("el cuerpo de los campos sube a 17 con el dedo", () => {
    expect(inputControlClassName.split(" ")).toEqual(expect.arrayContaining(["text-callout", "pointer-coarse:text-body-large"]))
  })

  for (const archivo of CAMPOS) {
    it(`${archivo} usa el cuerpo de campo`, () => {
      expect(fuente(archivo)).toMatch(/inputControlClassName|inputShellClassName/)
    })
  }

  it("el campo de Command, que no usa el cuerpo de campo, también", () => {
    expect(fuente("components/command.tsx")).toMatch(/text-callout[^"]*pointer-coarse:text-body-large/)
  })
})
