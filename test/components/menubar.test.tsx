import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../../src/components/menubar"

function Editor({ onGuardar = () => {} }: { onGuardar?: () => void } = {}) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Archivo</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Nuevo informe
            <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={onGuardar}>
            Guardar
            <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Exportar</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>CSV</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive">Descartar borrador</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Editar</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Deshacer</MenubarItem>
          <MenubarItem>Rehacer</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger>Ver</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Paneles</MenubarLabel>
            <MenubarCheckboxItem defaultChecked>Barra lateral</MenubarCheckboxItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}

const titulo = (name: string) => screen.getByRole("menuitem", { name })

describe("Menubar", () => {
  it("emite role=menubar con los tres títulos adentro", () => {
    render(<Editor />)
    const barra = screen.getByRole("menubar")
    expect(barra).toHaveAttribute("aria-orientation", "horizontal")
    for (const name of ["Archivo", "Editar", "Ver"]) expect(barra).toContainElement(titulo(name))
  })

  it("abre el menú con click y ejecuta el ítem", async () => {
    const onGuardar = vi.fn()
    render(<Editor onGuardar={onGuardar} />)

    await userEvent.click(titulo("Archivo"))
    await userEvent.click(await screen.findByRole("menuitem", { name: /Guardar/ }))

    expect(onGuardar).toHaveBeenCalledTimes(1)
  })

  // Lo propio de la barra: los tres títulos ocupan UNA parada de tabulación,
  // no tres. Sin esto sería un DropdownMenu repetido.
  it("la barra entera es una sola parada de tabulación y las flechas cambian de título", async () => {
    render(
      <>
        <button type="button">antes</button>
        <Editor />
        <button type="button">después</button>
      </>
    )

    await userEvent.tab()
    expect(screen.getByRole("button", { name: "antes" })).toHaveFocus()
    await userEvent.tab()
    expect(titulo("Archivo")).toHaveFocus()

    await userEvent.keyboard("{ArrowRight}")
    expect(titulo("Editar")).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(titulo("Ver")).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(titulo("Archivo")).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole("button", { name: "después" })).toHaveFocus()
  })

  it("con un menú abierto, pasar al título de al lado abre ese", async () => {
    render(<Editor />)
    await userEvent.click(titulo("Archivo"))
    await screen.findByRole("menuitem", { name: /Nuevo informe/ })

    await userEvent.keyboard("{ArrowRight}")

    expect(await screen.findByRole("menuitem", { name: "Deshacer" })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: /Nuevo informe/ })).not.toBeInTheDocument())
  })

  it("↓ ↑ recorren los ítems y → ← entran y salen del submenú", async () => {
    render(<Editor />)
    await userEvent.click(titulo("Archivo"))
    await screen.findByRole("menuitem", { name: /Nuevo informe/ })

    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Nuevo informe/ })).toHaveFocus())
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Exportar" })).toHaveFocus())

    await userEvent.keyboard("{ArrowRight}")
    expect(await screen.findByRole("menuitem", { name: "PDF" })).toBeInTheDocument()

    await userEvent.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "PDF" })).not.toBeInTheDocument())
    expect(screen.getByRole("menuitem", { name: /Nuevo informe/ })).toBeInTheDocument()
  })

  it("Escape cierra y devuelve el foco al título", async () => {
    render(<Editor />)
    await userEvent.click(titulo("Editar"))
    await screen.findByRole("menuitem", { name: "Deshacer" })

    await userEvent.keyboard("{Escape}")

    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Deshacer" })).not.toBeInTheDocument())
    await waitFor(() => expect(titulo("Editar")).toHaveFocus())
  })

  it("el tilde va a la izquierda, del lado contrario al atajo", async () => {
    render(<Editor />)
    await userEvent.click(titulo("Ver"))

    const check = await screen.findByRole("menuitemcheckbox", { name: "Barra lateral" })
    expect(check).toHaveAttribute("aria-checked", "true")
    expect(check).toHaveClass("pl-8")
    expect(check.className).not.toMatch(/\bpr-8\b/)
  })

  it("el título abierto se marca con fondo y comparte la pastilla del sistema", async () => {
    render(<Editor />)
    expect(titulo("Archivo")).toHaveClass("h-8", "rounded-md", "data-popup-open:bg-gray-200")

    await userEvent.click(titulo("Archivo"))

    const panel = await screen.findByRole("menu")
    expect(panel).toHaveClass("shadow-menu", "rounded-xl", "bg-background-100")
    expect(titulo("Archivo")).toHaveAttribute("data-popup-open")
  })
})
