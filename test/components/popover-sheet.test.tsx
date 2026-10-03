import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Popover, PopoverContent, PopoverTitle, PopoverTrigger, usePopoverSheet } from "../../src/components/popover"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../src/components/sheet"

function Mode() {
  return <p>{usePopoverSheet() ? "hoja" : "anclado"}</p>
}

describe("usePopoverSheet", () => {
  it("fuera de un Popover es false", () => {
    render(<Mode />)
    expect(screen.getByText("anclado")).toBeInTheDocument()
  })

  it("en pantalla ancha el popover está anclado", async () => {
    const user = userEvent.setup()
    render(
      <Popover>
        <PopoverTrigger>Abrir</PopoverTrigger>
        <PopoverContent collisionPadding={24}>
          <PopoverTitle>Título</PopoverTitle>
          <Mode />
        </PopoverContent>
      </Popover>
    )
    await user.click(screen.getByRole("button", { name: "Abrir" }))
    expect(await screen.findByText("anclado")).toBeInTheDocument()
  })
})

describe("Sheet y el Toaster", () => {
  it("avisa en <html data-sheet-open> el lado abierto y lo saca al cerrar", async () => {
    const user = userEvent.setup()
    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Detalle</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    expect(document.documentElement).not.toHaveAttribute("data-sheet-open")
    await user.click(screen.getByRole("button", { name: "Abrir" }))
    await screen.findByText("Detalle")
    expect(document.documentElement).toHaveAttribute("data-sheet-open", "right")
    await user.click(screen.getByRole("button", { name: "Cerrar" }))
    await vi.waitFor(() => expect(document.documentElement).not.toHaveAttribute("data-sheet-open"), { timeout: 20000 })
  }, 30000)
})
