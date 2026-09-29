import type { VariantProps } from "class-variance-authority"
import { describe, expect, expectTypeOf, it } from "vitest"

import { badgeVariants } from "../src/variants/badge"
import { buttonVariants } from "../src/variants/button"
import { cardVariants } from "../src/variants/card"
import { inputSizeClassName } from "../src/variants/input"
import { linkVariants } from "../src/variants/link"
import { menuItemClassName } from "../src/variants/menu"
import { sidebarItemVariants } from "../src/variants/sidebar"
import { toggleVariants } from "../src/variants/toggle"
import { cn } from "../src/lib/utils"

const classes = (value: string) => value.split(/\s+/)

// Las variantes exportadas se usan sobre <a>/<Link> sin pasar por el componente:
// tienen que salir ya resueltas por tailwind-merge, o la clase base le gana a la de la variante.
describe("variantes exportadas pasan por cn()", () => {
  it("buttonVariants: la clase de la variante le gana a la de la base", () => {
    const out = classes(buttonVariants({ variant: "link" }))
    expect(out).toContain("rounded-sm")
    expect(out).not.toContain("rounded-control")
  })

  it("cardVariants selected no deja el border-separator-strong del default", () => {
    const out = classes(cardVariants({ selected: true }))
    expect(out).toContain("ring-brand-700")
    expect(out).not.toContain("border-separator-strong")
  })

  it("className del llamador gana sobre la variante", () => {
    expect(classes(buttonVariants({ size: "sm", className: "px-6" }))).not.toContain("px-3")
    expect(classes(badgeVariants({ className: "h-8" }))).not.toContain("h-6")
    expect(classes(toggleVariants({ className: "h-10" }))).not.toContain("h-8")
    expect(classes(sidebarItemVariants({ className: "h-10" }))).not.toContain("h-8")
  })

  it("linkVariants: inline subraya siempre, subtle solo en hover", () => {
    const inline = classes(linkVariants({ variant: "inline" }))
    expect(inline).toContain("underline")
    expect(inline).toContain("decoration-label-tertiary")
    const subtle = classes(linkVariants({ variant: "subtle" }))
    expect(subtle).not.toContain("underline")
    expect(subtle).toContain("hover:underline")
    // Los tres usos comparten foco visible y la transición de 150ms.
    for (const v of ["inline", "subtle", "row"] as const) {
      const out = classes(linkVariants({ variant: v }))
      expect(out).toContain("focus-visible:focus-ring")
      expect(out).toContain("transition-control")
    }
    expect(classes(linkVariants({ variant: "subtle", className: "text-copy-13" }))).toContain("text-copy-13")
  })

  /**
   * La cadena entera del botón por defecto, copiada acá a mano. Son cuatro apps llamando a
   * `buttonVariants` sin argumentos: una clase de más o de menos les cambia el botón en
   * todas las pantallas, y este test lo dice con el diff, no con una captura que alguien
   * mire tres semanas después. En 1.0 cambió una sola: `rounded-md` pasó a `rounded-full`; en 2.0 (iCloud) volvió al rectángulo, `rounded-control`.
   * En 2.0, la densidad de macOS: `h-10 px-4` pasó a `h-8 px-3`, y se sumó `touch-target`,
   * que va al final porque lo pone una variante compuesta: el `link` no lo lleva. Con iCloud (R1)
   * el botón es plano: sin `shadow-button-inverted` ni hundimiento. En la revisión visual de R1 el
   * `md` pasó a `h-9`, el alto compartido con los campos. En R4 el default es el primario de iCloud
   * —el acento sólido, antes el negro— y el deshabilitado es `opacity-40`; el anillo es el inverso
   * (`focus-ring-inverse`), que `cn()` deja en lugar del de la base.
   */
  const SIN_SHAPE = {
    "default/md":
      "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border border-transparent whitespace-nowrap outline-none select-none transition-surface data-disabled:cursor-not-allowed data-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-brand-700 text-brand-contrast hover:bg-brand-800 active:bg-brand-800 focus-visible:focus-ring-inverse h-9 px-3 text-callout touch-target",
  } as const

  it("sin shape, buttonVariants emite la cadena fijada", () => {
    expect(buttonVariants()).toBe(SIN_SHAPE["default/md"])
    expect(buttonVariants({ variant: "default", size: "md" })).toBe(SIN_SHAPE["default/md"])
    expect(buttonVariants({ shape: "default" })).toBe(SIN_SHAPE["default/md"])
    // Y el botón es una cápsula en todos los tamaños, los de ícono incluidos.
    for (const size of ["sm", "md", "lg", "icon-sm", "icon-md", "icon-lg"] as const) {
      expect(classes(buttonVariants({ size })), size).toContain("rounded-control")
    }
  })

  it("shape pill suma aire horizontal y no toca el radio", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const out = classes(buttonVariants({ size, shape: "pill" }))
      expect(out.filter((c) => c.startsWith("rounded-")), size).toEqual(["rounded-control"])
    }
    // Un escalón más de padding por tamaño, y uno solo.
    const padding = (size: "sm" | "md" | "lg") =>
      classes(buttonVariants({ size, shape: "pill" })).filter((c) => /^px-\d/.test(c))
    expect(padding("sm")).toEqual(["px-4"])
    expect(padding("md")).toEqual(["px-5"])
    expect(padding("lg")).toEqual(["px-6"])
  })

  it("shape rect devuelve el rectángulo, con el radio de los controles", () => {
    for (const variant of ["default", "secondary", "plain", "ghost", "destructive", "destructive-plain"] as const) {
      const out = classes(buttonVariants({ variant, shape: "rect" }))
      // tailwind-merge tiene que haber resuelto el radio: si sobrevive el de la base, cuál
      // gana depende del orden en la hoja compilada.
      expect(out.filter((c) => c.startsWith("rounded-")), variant).toEqual(["rounded-control"])
      // La variante sigue poniendo su color: `shape` es ortogonal.
      expect(out.length, variant).toBeGreaterThan(18)
    }
  })

  it("VariantProps sigue funcionando", () => {
    expectTypeOf<VariantProps<typeof buttonVariants>["variant"]>().toEqualTypeOf<
      | "default"
      | "accent"
      | "secondary"
      | "plain"
      | "ghost"
      | "destructive"
      | "destructive-plain"
      | "link"
      | null
      | undefined
    >()
  })
})

describe("densidad macOS (2.0)", () => {
  it("botones: sm 24, md 32, lg 40; los de ícono, cuadrados de lo mismo", () => {
    expect(classes(buttonVariants({ size: "sm" }))).toContain("h-7")
    expect(classes(buttonVariants({ size: "md" }))).toContain("h-9")
    expect(classes(buttonVariants({ size: "lg" }))).toContain("h-10")
    expect(classes(buttonVariants({ size: "icon-sm" }))).toContain("size-7")
    expect(classes(buttonVariants({ size: "icon-md" }))).toContain("size-9")
    expect(classes(buttonVariants({ size: "icon-lg" }))).toContain("size-10")
  })

  it("campos: sm 24, md 32, lg 40", () => {
    const out = classes(inputSizeClassName)
    expect(out).toContain("data-[size=sm]:h-7")
    expect(out).toContain("data-[size=md]:h-9")
    expect(out).toContain("data-[size=lg]:h-10")
  })

  it("ítems de menú a 30 y del sidebar a 32 (iCloud)", () => {
    expect(classes(menuItemClassName)).toContain("h-7.5")
    expect(classes(sidebarItemVariants())).toContain("h-8")
  })

  it("área táctil: el botón agranda su área con el dedo y el campo sube de alto", () => {
    for (const variant of ["default", "secondary", "plain", "ghost", "destructive", "destructive-plain"] as const) {
      expect(classes(buttonVariants({ variant })), variant).toContain("touch-target")
    }
    expect(classes(toggleVariants())).toContain("touch-target")
    // Un <input> no admite pseudo-elementos: en táctil vuelve a los altos de 1.x.
    expect(classes(inputSizeClassName)).toEqual(
      expect.arrayContaining(["pointer-coarse:data-[size=sm]:h-9", "pointer-coarse:data-[size=md]:h-11"])
    )
    // Los ítems de una lista están pegados: un `::after` de 44 px taparía la mitad del de al
    // lado, así que en táctil crecen de verdad.
    expect(classes(menuItemClassName)).toContain("pointer-coarse:h-11")
    expect(classes(sidebarItemVariants())).toContain("pointer-coarse:h-11")
  })

  // El link es texto adentro de un párrafo: un área de 44 px taparía la línea de arriba y la de
  // abajo, y el toque en una palabra vecina abriría el link.
  it("el botón `link` no agranda su área: vive adentro del texto", () => {
    expect(classes(buttonVariants({ variant: "link" }))).not.toContain("touch-target")
  })

  it("touch-target-y reemplaza a touch-target con cn()", () => {
    const out = classes(cn(buttonVariants({ variant: "ghost", size: "icon-md" }), "touch-target-y"))
    expect(out).toContain("touch-target-y")
    expect(out).not.toContain("touch-target")
  })
})

// iCloud no tiene botón teñido (catálogo §2.12: fill accent → texto accent → ícono). `tinted` y
// `destructive-tinted` eran de la fase 2 y no llegaron a publicarse: se fueron en R2.
describe("sin variantes tintadas (R2)", () => {
  it("tinted y destructive-tinted no existen", () => {
    for (const variant of ["tinted", "destructive-tinted"]) {
      const c = classes(buttonVariants({ variant } as never))
      expect(c.join(" "), variant).not.toMatch(/tint|-ink/)
    }
  })
})
