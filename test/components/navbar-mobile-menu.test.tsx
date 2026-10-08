import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { NavbarMobileMenu } from "../../src/components/navbar-mobile-menu"

const items = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#precios", label: "Precios", active: true },
]

describe("NavbarMobileMenu", () => {
  it("el botón tiene nombre y abre una hoja con título y links", async () => {
    render(<NavbarMobileMenu footer={<a href="#registro">Empezar</a>} items={items} title="Menú" />)
    const trigger = screen.getByRole("button", { name: "Abrir menú" })
    expect(trigger).toHaveClass("md:hidden")
    await userEvent.click(trigger)
    const dialog = await screen.findByRole("dialog", { name: "Menú" })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole("navigation", { name: "Secciones" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Beneficios" })).toHaveClass("min-h-11")
    expect(screen.getByRole("link", { name: "Precios" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("link", { name: "Empezar" })).toBeInTheDocument()
  })

  it("elegir un link cierra la hoja", async () => {
    render(<NavbarMobileMenu items={items} title="Menú" />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await userEvent.click(await screen.findByRole("link", { name: "Beneficios" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })

  it("Escape cierra y el foco vuelve al botón", async () => {
    render(<NavbarMobileMenu items={items} title="Menú" />)
    const trigger = screen.getByRole("button", { name: "Abrir menú" })
    await userEvent.click(trigger)
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("showTheme suma la fila del tema; sin ella no hay", async () => {
    const { unmount } = render(<NavbarMobileMenu items={items} showTheme title="Menú" />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await screen.findByRole("dialog")
    expect(screen.getByText("Tema")).toBeInTheDocument()
    unmount()
    render(<NavbarMobileMenu items={items} title="Menú" />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir menú" }))
    await screen.findByRole("dialog")
    expect(screen.queryByText("Tema")).toBeNull()
  })

  it("los textos se traducen con labels", () => {
    render(<NavbarMobileMenu items={items} labels={{ open: "Open menu" }} title="Menu" />)
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument()
  })
})
