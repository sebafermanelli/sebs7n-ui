import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { buttonVariants } from "../../src/variants/button"

describe("Button", () => {
  it("por defecto es el primario de iCloud: el acento sólido, tamaño md", () => {
    render(<Button>Deploy</Button>)
    const button = screen.getByRole("button", { name: "Deploy" })
    expect(button).toHaveClass("bg-brand-700", "text-brand-contrast", "hover:bg-brand-800", "h-9", "px-3")
  })

  // iCloud apaga un botón con opacidad (.4 en toolbars y en los de texto), sin cambiarle el color:
  // el botón apagado se reconoce como el mismo botón.
  it("foco interior y deshabilitado a .4, como iCloud", () => {
    render(<Button>Deploy</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("focus-visible:focus-ring-inverse", "data-disabled:opacity-40", "data-disabled:cursor-not-allowed")
    expect(button.className).not.toMatch(/data-disabled:(bg|text|border)-/)
  })

  it("marca data-disabled y no dispara click cuando está deshabilitado", async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Deploy</Button>)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("data-disabled")
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("loading: muestra spinner, aria-busy y no dispara click", async () => {
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Guardar</Button>)
    const button = screen.getByRole("button", { name: "Guardar" })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button.querySelector("[data-slot=button-spinner]")).not.toBeNull()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it("loading conserva el nombre accesible (opacity, no visibility)", () => {
    render(<Button loading>Guardar</Button>)
    const label = screen.getByText("Guardar")
    expect(label).not.toHaveClass("invisible")
    expect(label).toHaveClass("opacity-0")
  })

  it("accent es un alias obsoleto de default: dibuja lo mismo", () => {
    expect(buttonVariants({ variant: "accent" })).toBe(buttonVariants({ variant: "default" }))
  })

  // El `block.secondary.destructive` de iCloud: gris con el texto rojo. iCloud no tiene rojo sólido.
  it("destructive es gris con el texto rojo; destructive-plain, el texto rojo sin fondo", () => {
    expect(buttonVariants({ variant: "destructive" })).toContain("bg-fill-2 text-red-ink hover:bg-fill-3")
    const plain = buttonVariants({ variant: "destructive-plain" }).split(" ")
    expect(plain).toEqual(expect.arrayContaining(["font-semibold", "text-red-ink", "hover:bg-fill-2"]))
    expect(plain.filter((c) => c.startsWith("bg-"))).toEqual([])
  })

  // El `push` de iCloud: texto semibold en el acento, sin fondo, `fill-2` con el puntero y el tinte
  // de la marca al apretar. El texto va en `brand-ink` (el hover es un relleno: ver el test de
  // contraste del acento) y el glifo en `brand-900`, el azul de la toolbar de Drive.
  it("plain: texto de acento sobre relleno en brand-ink, glifo en brand-900", () => {
    const plain = buttonVariants({ variant: "plain" }).split(" ")
    expect(plain).toEqual(expect.arrayContaining(["font-semibold", "text-brand-ink", "[&_svg]:text-brand-900", "hover:bg-fill-2", "active:bg-highlight"]))
    expect(plain.filter((c) => /^bg-/.test(c))).toEqual([])
  })

  it("planos, como en iCloud: sin sombra y sin hundirse al apretar", () => {
    for (const variant of ["default", "secondary", "plain", "ghost", "destructive", "destructive-plain", "link"] as const) {
      expect(buttonVariants({ variant }), variant).not.toMatch(/shadow-|translate-y-px|sheen/)
    }
  })

  it("secondary y ghost hacen hover con los rellenos de iCloud", () => {
    expect(buttonVariants({ variant: "ghost" })).toContain("text-label hover:bg-fill-2")
    expect(buttonVariants({ variant: "secondary" })).toContain("bg-fill-2 text-label hover:bg-fill-3")
  })

  // iCloud no tiene botón con borde (catálogo §2.12): la jerarquía es acento sólido → gris → texto
  // de acento → ícono. `outline` se fue en R4; su reemplazo es `secondary`.
  it("no hay botón con borde", () => {
    for (const variant of ["default", "secondary", "plain", "ghost", "destructive", "destructive-plain", "link"] as const) {
      expect(buttonVariants({ variant }), variant).not.toMatch(/border-(separator|label|gray)/)
    }
    expect(buttonVariants({ variant: "outline" } as never)).not.toMatch(/border-separator-strong/)
  })

  // Los de ícono: 28 el de la toolbar y el de cerrar (glifo 16; iCloud 17), 36 el de la barra global
  // (glifo 18), 40 con el de 20.
  it("los glifos crecen con el botón de ícono", () => {
    expect(buttonVariants({ size: "icon-sm" })).not.toMatch(/\[&_svg:not\(\[class\*='size-'\]\)\]:size-(4\.5|5)/)
    expect(buttonVariants({ size: "icon-md" })).toContain("[&_svg:not([class*='size-'])]:size-4.5")
    expect(buttonVariants({ size: "icon-lg" })).toContain("[&_svg:not([class*='size-'])]:size-5")
  })

  it.each([
    ["sm", "h-7"],
    ["md", "h-9"],
    ["lg", "h-10"],
    ["icon-sm", "size-7"],
    ["icon-md", "size-9"],
    ["icon-lg", "size-10"],
  ] as const)("size %s → %s", (size, cls) => {
    expect(buttonVariants({ size }).split(" ")).toContain(cls)
  })

  it("los links usan buttonVariants() sobre <a>, no render (Base UI les pondría role=button)", () => {
    render(<a href="/docs" className={buttonVariants({ variant: "secondary" })}>Docs</a>)
    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass("bg-fill-2")
  })

  it("el contenido se puede encoger: un hijo con `truncate` termina en puntos suspensivos", () => {
    render(
      <Button className="w-24 shrink">
        <span className="truncate">Un nombre más largo que el botón</span>
      </Button>
    )
    // Un ítem flex no mide menos que su contenido salvo que se lo permitan. El envoltorio es
    // el ítem: sin `min-w-0` en él, el `truncate` del hijo no tiene contra qué recortarse.
    expect(screen.getByText("Un nombre más largo que el botón").parentElement).toHaveClass("min-w-0")
  })
})
