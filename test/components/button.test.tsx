import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { buttonVariants } from "../../src/variants/button"

describe("Button", () => {
  it("es el primario negro de Vercel por defecto, tamaño md", () => {
    render(<Button>Deploy</Button>)
    const button = screen.getByRole("button", { name: "Deploy" })
    expect(button).toHaveClass("bg-label", "text-surface", "hover:bg-button-primary-hover", "h-8", "px-3")
  })

  it("tiene foco de teclado con el anillo de marca y disabled estilo Vercel", () => {
    render(<Button>Deploy</Button>)
    expect(screen.getByRole("button")).toHaveClass(
      "focus-visible:focus-ring",
      "data-disabled:bg-fill-1",
      "data-disabled:text-label-tertiary",
      "data-disabled:border-separator",
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
    expect(buttonVariants({ variant: "accent" })).toContain("bg-brand-700 text-brand-contrast hover:bg-brand-800")
  })

  it("destructive usa los valores de error de Vercel", () => {
    expect(buttonVariants({ variant: "destructive" })).toContain(
      "bg-red-800 text-button-error-fg hover:bg-button-error-hover active:bg-button-error-active"
    )
  })

  it("planos, como en iCloud: sin sombra y sin hundirse al apretar", () => {
    for (const variant of ["default", "outline", "secondary", "ghost", "accent", "destructive", "link"] as const) {
      expect(buttonVariants({ variant }), variant).not.toMatch(/shadow-|translate-y-px|sheen/)
    }
  })

  it("outline y ghost hacen hover con los rellenos de iCloud", () => {
    expect(buttonVariants({ variant: "outline" })).toContain("hover:bg-fill-1")
    expect(buttonVariants({ variant: "ghost" })).toContain("hover:bg-fill-2")
    expect(buttonVariants({ variant: "secondary" })).toContain("bg-fill-2 text-label hover:bg-fill-3")
  })

  it.each([
    ["sm", "h-6"],
    ["md", "h-8"],
    ["lg", "h-10"],
    ["icon-sm", "size-6"],
    ["icon-md", "size-8"],
    ["icon-lg", "size-10"],
  ] as const)("size %s → %s", (size, cls) => {
    expect(buttonVariants({ size }).split(" ")).toContain(cls)
  })

  it("los links usan buttonVariants() sobre <a>, no render (Base UI les pondría role=button)", () => {
    render(<a href="/docs" className={buttonVariants({ variant: "outline" })}>Docs</a>)
    expect(screen.getByRole("link", { name: "Docs" })).toHaveClass("border-separator-strong")
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
