import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../src/components/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "../../src/components/toggle-group"
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarInput,
  ToolbarLink,
  ToolbarSeparator,
} from "../../src/components/toolbar"

function Formato({ onEnlace = () => {} }: { onEnlace?: () => void } = {}) {
  return (
    <Toolbar aria-label="Formato del artículo">
      <ToggleGroup aria-label="Estilo">
        <ToolbarButton aria-label="Negrita" render={<ToggleGroupItem value="bold" />}>
          B
        </ToolbarButton>
        <ToolbarButton aria-label="Cursiva" render={<ToggleGroupItem value="italic" />}>
          I
        </ToolbarButton>
      </ToggleGroup>
      <ToolbarSeparator />
      <ToolbarGroup aria-label="Alineación">
        <ToolbarButton aria-label="Alinear a la izquierda">←</ToolbarButton>
        <ToolbarButton aria-label="Centrar" disabled>
          ↔
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton aria-label="Insertar enlace" onClick={onEnlace}>
        🔗
      </ToolbarButton>
      <ToolbarInput aria-label="Zoom" defaultValue="100" />
      <ToolbarLink href="#historial">Editado hace 5 min</ToolbarLink>
    </Toolbar>
  )
}

const control = (name: string) => screen.getByRole("button", { name })

describe("Toolbar", () => {
  it("emite role=toolbar con su orientación y su nombre", () => {
    render(<Formato />)
    const barra = screen.getByRole("toolbar", { name: "Formato del artículo" })
    expect(barra).toHaveAttribute("data-orientation", "horizontal")
    expect(screen.getByRole("group", { name: "Alineación" })).toBeInTheDocument()
  })

  // La razón entera del componente: siete controles, UNA parada de Tab.
  it("toda la barra es una sola parada de tabulación y las flechas mueven adentro", async () => {
    render(
      <>
        <button type="button">antes</button>
        <Formato />
        <button type="button">después</button>
      </>
    )

    await userEvent.tab()
    expect(screen.getByRole("button", { name: "antes" })).toHaveFocus()
    await userEvent.tab()
    expect(control("Negrita")).toHaveFocus()

    await userEvent.keyboard("{ArrowRight}")
    expect(control("Cursiva")).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(control("Negrita")).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole("button", { name: "después" })).toHaveFocus()
  })

  it("Home y End van al primer y al último control", async () => {
    render(<Formato />)
    await userEvent.tab()
    expect(control("Negrita")).toHaveFocus()

    await userEvent.keyboard("{End}")
    expect(screen.getByRole("link", { name: "Editado hace 5 min" })).toHaveFocus()
    await userEvent.keyboard("{Home}")
    expect(control("Negrita")).toHaveFocus()
  })

  it("un control deshabilitado sigue en el recorrido con flechas", async () => {
    render(<Formato />)
    await userEvent.tab()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}")

    expect(control("Centrar")).toHaveFocus()
    expect(control("Centrar")).toHaveAttribute("data-disabled")
  })

  it("Enter activa el control enfocado", async () => {
    const onEnlace = vi.fn()
    render(<Formato onEnlace={onEnlace} />)
    control("Insertar enlace").focus()

    await userEvent.keyboard("{Enter}")

    expect(onEnlace).toHaveBeenCalledTimes(1)
  })

  it("dentro de un ToolbarInput las flechas y Home mueven el cursor, no de control", async () => {
    render(<Formato />)
    const zoom = screen.getByRole("textbox", { name: "Zoom" }) as HTMLInputElement
    zoom.focus()
    zoom.setSelectionRange(3, 3)

    await userEvent.keyboard("{ArrowLeft}")
    expect(zoom).toHaveFocus()
    expect(zoom.selectionStart).toBe(2)

    await userEvent.keyboard("{Home}")
    expect(zoom).toHaveFocus()
  })

  it("el render pone los estilos y no hay dos juegos de clases peleando", () => {
    render(<Formato />)
    // Sin `render`: el Button del sistema en ghost.
    const suelto = control("Insertar enlace")
    expect(suelto).toHaveAttribute("data-slot", "toolbar-button")
    expect(suelto).toHaveClass("size-8", "hover:bg-gray-alpha-200")

    // Con `render={<ToggleGroupItem />}`: el chip de Toggle, sin nada del Button.
    const negrita = control("Negrita")
    expect(negrita).toHaveClass("rounded-full", "border-dashed")
    expect(negrita.className).not.toMatch(/\bsize-8\b/)
    expect(negrita.className).not.toMatch(/hover:bg-gray-alpha-200/)
  })

  it("el ToggleGroup de adentro sigue funcionando: presiona y suelta", async () => {
    render(<Formato />)
    expect(control("Negrita")).toHaveAttribute("aria-pressed", "false")

    await userEvent.click(control("Negrita"))
    await waitFor(() => expect(control("Negrita")).toHaveAttribute("aria-pressed", "true"))

    await userEvent.click(control("Negrita"))
    await waitFor(() => expect(control("Negrita")).toHaveAttribute("aria-pressed", "false"))
  })

  it("el separador toma la orientación contraria a la barra", () => {
    render(<Formato />)
    const [separador] = screen.getAllByRole("separator")
    expect(separador).toHaveAttribute("aria-orientation", "vertical")
    expect(separador).toHaveClass("data-[orientation=vertical]:w-px")
  })

  it("orientation=vertical cambia las flechas a ↑ ↓", async () => {
    render(
      <Toolbar aria-label="Herramientas" orientation="vertical">
        <ToolbarButton aria-label="Lápiz">✏️</ToolbarButton>
        <ToolbarButton aria-label="Goma">🩹</ToolbarButton>
      </Toolbar>
    )
    await userEvent.tab()
    expect(control("Lápiz")).toHaveFocus()

    await userEvent.keyboard("{ArrowDown}")
    expect(control("Goma")).toHaveFocus()
  })

  it("un DropdownMenu entra por render: abre, cierra con Escape y el foco vuelve a la barra", async () => {
    render(
      <DropdownMenu>
        <Toolbar aria-label="Herramientas del lienzo">
          <ToolbarButton render={<DropdownMenuTrigger render={<Button size="sm" variant="ghost" />} />}>
            Insertar
          </ToolbarButton>
          <ToolbarButton aria-label="Publicar">✓</ToolbarButton>
        </Toolbar>
        <DropdownMenuContent>
          <DropdownMenuItem>Imagen</DropdownMenuItem>
          <DropdownMenuItem>Tabla</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    await userEvent.tab()
    expect(control("Insertar")).toHaveFocus()

    await userEvent.keyboard("{Enter}")
    expect(await screen.findByRole("menuitem", { name: "Imagen" })).toBeInTheDocument()

    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "Imagen" })).not.toBeInTheDocument())
    await waitFor(() => expect(control("Insertar")).toHaveFocus())
  })
})
