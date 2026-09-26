import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { buttonVariants } from "../../src/variants/button"

describe("Button", () => {
  it("es el primario negro de Vercel por defecto, tamaño md", () => {
    render(<Button>Deploy</Button>)
    const button = screen.getByRole("button", { name: "Deploy" })
    expect(button).toHaveClass("bg-gray-1000", "text-background-100", "hover:bg-button-primary-hover", "h-10", "px-4")
  })

  it("tiene foco de teclado con el anillo de marca y disabled estilo Vercel", () => {
    render(<Button>Deploy</Button>)
    expect(screen.getByRole("button")).toHaveClass(
      "focus-visible:focus-ring",
      "data-disabled:bg-gray-100",
      "data-disabled:text-gray-700",
      "data-disabled:border-gray-400",
      "data-disabled:cursor-not-allowed"
    )
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

  it("accent usa la marca con su color de contraste", () => {
    expect(buttonVariants({ variant: "accent" })).toContain("bg-brand-700 text-brand-contrast shadow-button hover:bg-brand-800")
  })

  it("destructive usa los valores de error de Vercel", () => {
    expect(buttonVariants({ variant: "destructive" })).toContain(
      "bg-red-800 text-button-error-fg shadow-button hover:bg-button-error-hover active:translate-y-px active:bg-button-error-active"
    )
  })

  it("profundidad sutil: los sólidos llevan shadow-button y se hunden al apretar; ghost y link quedan planos", () => {
    // `default` es gray-1000 (blanco en oscuro): lleva la sombra invertida, con el filo gris.
    expect(buttonVariants({ variant: "default" })).toContain("shadow-button-inverted")
    for (const variant of ["accent", "destructive"] as const) {
      expect(buttonVariants({ variant }), variant).toMatch(/\bshadow-button\b/)
      expect(buttonVariants({ variant }), variant).toContain("active:translate-y-px")
      // Apagado, plano: la sombra dice «se puede apretar», y un botón deshabilitado no se puede.
      expect(buttonVariants({ variant }), variant).toContain("data-disabled:shadow-none")
    }
    // Las dos superficies que no son sólidas flotan con el 1px de las cards.
    for (const variant of ["outline", "secondary"] as const) {
      expect(buttonVariants({ variant }), variant).toContain("shadow-card")
      expect(buttonVariants({ variant }), variant).toContain("data-disabled:shadow-none")
    }
    for (const variant of ["ghost", "link"] as const) {
      expect(buttonVariants({ variant }), variant).not.toMatch(/shadow-(button|card)/)
      expect(buttonVariants({ variant }), variant).not.toContain("active:translate-y-px")
    }
  })

  it("outline y ghost hacen hover con gray-alpha-200", () => {
    expect(buttonVariants({ variant: "outline" })).toContain("hover:bg-gray-alpha-200")
    expect(buttonVariants({ variant: "ghost" })).toContain("hover:bg-gray-alpha-200")
  })

  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
    ["icon-sm", "size-8"],
    ["icon-md", "size-10"],
    ["icon-lg", "size-12"],
  ] as const)("size %s → %s", (size, cls) => {
    expect(buttonVariants({ size }).split(" ")).toContain(cls)
  })

  it("los links usan buttonVariants() sobre <a>, no render (Base UI les pondría role=button)", () => {
    render(<a href="/docs" className={buttonVariants({ variant: "outline" })}>Docs</a>)
    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass("border-gray-alpha-400")
  })
})
