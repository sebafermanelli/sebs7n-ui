import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../../src/components/context-menu"

function Archivo({ onRenombrar = () => {}, focusable = true }: { onRenombrar?: () => void; focusable?: boolean }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger focusable={focusable}>portada-marzo.jpg</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuLabel>portada-marzo.jpg</ContextMenuLabel>
          <ContextMenuItem onClick={onRenombrar}>
            Renombrar
            <ContextMenuShortcut>F2</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>Copiar enlace</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Descargar como</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>Original</ContextMenuItem>
              <ContextMenuItem>WebP 1200px</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem defaultChecked>Marcada como favorita</ContextMenuCheckboxItem>
        <ContextMenuItem variant="destructive">Mover a la papelera</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

const trigger = () => screen.getByText("portada-marzo.jpg", { selector: "[data-slot=context-menu-trigger]" })
const abrirConClickDerecho = () => fireEvent.contextMenu(trigger(), { clientX: 24, clientY: 24 })

describe("ContextMenu", () => {
  it("abre con click derecho y emite el menú del sistema", async () => {
    render(<Archivo />)
    abrirConClickDerecho()

    const menu = await screen.findByRole("menu")
    expect(menu).toHaveAttribute("data-slot", "context-menu-content")
    expect(await screen.findByRole("menuitem", { name: /Renombrar/ })).toBeInTheDocument()
  })

  // Lo que Base UI no trae: su trigger es un <div> sin tabIndex, así que la tecla
  // de menú contextual nunca tiene sobre qué disparar. Estos dos tests son la red
  // de la única parte del componente que no es un wrapper.
  it("abre con la tecla de menú contextual, con el foco en el área", async () => {
    render(<Archivo />)
    await userEvent.tab()
    expect(trigger()).toHaveFocus()

    await userEvent.keyboard("{ContextMenu}")

    expect(await screen.findByRole("menuitem", { name: /Renombrar/ })).toBeInTheDocument()
  })

  it("abre con Shift+F10", async () => {
    render(<Archivo />)
    trigger().focus()

    fireEvent.keyDown(trigger(), { key: "F10", shiftKey: true })

    expect(await screen.findByRole("menuitem", { name: /Renombrar/ })).toBeInTheDocument()
  })

  it("el área es una parada de tabulación y anuncia el atajo; focusable={false} la saca", () => {
    const { unmount } = render(<Archivo />)
    expect(trigger()).toHaveAttribute("tabindex", "0")
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger()).toHaveAttribute("aria-keyshortcuts", "Shift+F10")
    unmount()

    render(<Archivo focusable={false} />)
    expect(trigger()).not.toHaveAttribute("tabindex")
    expect(trigger()).not.toHaveAttribute("aria-keyshortcuts")
  })

  it("se recorre con las flechas y Enter ejecuta el ítem", async () => {
    const onRenombrar = vi.fn()
    render(<Archivo onRenombrar={onRenombrar} />)
    abrirConClickDerecho()
    await screen.findByRole("menu")

    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Renombrar/ })).toHaveFocus())
    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Copiar enlace" })).toHaveFocus())

    await userEvent.keyboard("{ArrowUp}{Enter}")
    expect(onRenombrar).toHaveBeenCalledTimes(1)
  })

  it("→ abre el submenú y ← vuelve", async () => {
    render(<Archivo />)
    abrirConClickDerecho()
    await screen.findByRole("menu")

    const sub = screen.getByRole("menuitem", { name: /Descargar como/ })
    await userEvent.click(sub)
    expect(await screen.findByRole("menuitem", { name: "WebP 1200px" })).toBeInTheDocument()

    await userEvent.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "WebP 1200px" })).not.toBeInTheDocument())
  })

  it("Escape cierra y devuelve el foco al área", async () => {
    render(<Archivo />)
    trigger().focus()
    abrirConClickDerecho()
    await screen.findByRole("menu")

    await userEvent.keyboard("{Escape}")

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument())
    await waitFor(() => expect(trigger()).toHaveFocus())
  })

  it("usa la misma pastilla que DropdownMenu y marca el destructivo en rojo", async () => {
    render(<Archivo />)
    abrirConClickDerecho()

    const menu = await screen.findByRole("menu")
    expect(menu).toHaveClass("shadow-menu", "rounded-xl", "bg-background-100")
    expect(menu.className).not.toMatch(/\bborder\b/)

    const item = screen.getByRole("menuitem", { name: /Renombrar/ })
    expect(item).toHaveClass("h-8", "rounded-md", "data-highlighted:bg-gray-200")

    const borrar = screen.getByRole("menuitem", { name: "Mover a la papelera" })
    expect(borrar).toHaveAttribute("data-variant", "destructive")
    expect(borrar).toHaveClass("data-[variant=destructive]:text-red-900")
  })

  it("el checkbox se lee como menuitemcheckbox y no cierra el menú", async () => {
    render(<Archivo />)
    abrirConClickDerecho()

    const favorita = await screen.findByRole("menuitemcheckbox", { name: "Marcada como favorita" })
    expect(favorita).toHaveAttribute("aria-checked", "true")

    await userEvent.click(favorita)
    await waitFor(() => expect(screen.getByRole("menuitemcheckbox")).toHaveAttribute("aria-checked", "false"))
    expect(screen.getByRole("menu")).toBeInTheDocument()
  })
})
