import type { VariantProps } from "class-variance-authority"
import { describe, expect, expectTypeOf, it } from "vitest"

import { badgeVariants } from "../src/variants/badge"
import { buttonVariants } from "../src/variants/button"
import { cardVariants } from "../src/variants/card"
import { linkVariants } from "../src/variants/link"
import { sidebarItemVariants } from "../src/variants/sidebar"
import { toggleVariants } from "../src/variants/toggle"

const classes = (value: string) => value.split(/\s+/)

// Las variantes exportadas se usan sobre <a>/<Link> sin pasar por el componente:
// tienen que salir ya resueltas por tailwind-merge, o la clase base le gana a la de la variante.
describe("variantes exportadas pasan por cn()", () => {
  it("buttonVariants outline no deja el border-transparent de la base", () => {
    const out = classes(buttonVariants({ variant: "outline" }))
    expect(out).toContain("border-gray-alpha-400")
    expect(out).not.toContain("border-transparent")
  })

  it("cardVariants selected no deja el border-gray-400 del default", () => {
    const out = classes(cardVariants({ selected: true }))
    expect(out).toContain("border-brand-700")
    expect(out).not.toContain("border-gray-400")
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
    expect(inline).toContain("decoration-gray-alpha-500")
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
   * `shape` es una variante opcional y no puede mover nada de lo que ya existía:
   * son cuatro apps llamando a `buttonVariants` sin pasarlo, y una clase de más
   * o de menos les cambia el botón en todas las pantallas. La cadena entera,
   * copiada acá a mano: si el default cambia, este test lo dice con el diff, no
   * con una captura que alguien mire tres semanas después.
   */
  const SIN_SHAPE = {
    "default/md":
      "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent whitespace-nowrap outline-none select-none transition-surface focus-visible:focus-ring data-disabled:cursor-not-allowed data-disabled:border-gray-400 data-disabled:bg-gray-100 data-disabled:text-gray-700 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 bg-gray-1000 text-background-100 shadow-button hover:bg-button-primary-hover active:translate-y-px active:shadow-none data-disabled:shadow-none h-10 px-4 text-button-14",
  } as const

  it("sin shape, buttonVariants emite exactamente la misma cadena que antes de que existiera", () => {
    expect(buttonVariants()).toBe(SIN_SHAPE["default/md"])
    expect(buttonVariants({ variant: "default", size: "md" })).toBe(SIN_SHAPE["default/md"])
    expect(buttonVariants({ shape: "default" })).toBe(SIN_SHAPE["default/md"])
    // Y el radio sigue siendo el del sistema en todos los tamaños.
    for (const size of ["sm", "md", "lg"] as const) {
      expect(classes(buttonVariants({ size })), size).toContain("rounded-md")
    }
  })

  it("shape pill pisa el radio de la base y suma aire horizontal", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const out = classes(buttonVariants({ size, shape: "pill" }))
      expect(out, size).toContain("rounded-full")
      // tailwind-merge tiene que haber resuelto el radio: si sobrevive el de la
      // base, cuál gana depende del orden en la hoja compilada.
      expect(out, size).not.toContain("rounded-md")
      expect(out.filter((c) => c.startsWith("rounded-")), size).toHaveLength(1)
    }
    // Un escalón más de padding por tamaño, y uno solo.
    const padding = (size: "sm" | "md" | "lg") =>
      classes(buttonVariants({ size, shape: "pill" })).filter((c) => /^px-\d/.test(c))
    expect(padding("sm")).toEqual(["px-5"])
    expect(padding("md")).toEqual(["px-6"])
    expect(padding("lg")).toEqual(["px-7"])
  })

  it("pill funciona con todas las variantes y se ignora en los de ícono", () => {
    for (const variant of ["default", "outline", "secondary", "ghost", "accent", "destructive"] as const) {
      const out = classes(buttonVariants({ variant, shape: "pill" }))
      expect(out, variant).toContain("rounded-full")
      // La variante sigue poniendo su color: `shape` es ortogonal.
      expect(out.length, variant).toBeGreaterThan(20)
    }
    // Un botón de ícono ya es cuadrado con su propio radio.
    for (const size of ["icon-sm", "icon-md", "icon-lg"] as const) {
      const out = classes(buttonVariants({ size, shape: "pill" }))
      expect(out, size).toContain("rounded-md")
      expect(out, size).not.toContain("rounded-full")
    }
  })

  it("VariantProps sigue funcionando", () => {
    expectTypeOf<VariantProps<typeof buttonVariants>["variant"]>().toEqualTypeOf<
      "default" | "outline" | "secondary" | "ghost" | "accent" | "destructive" | "link" | null | undefined
    >()
  })
})
