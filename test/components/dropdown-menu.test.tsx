import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../src/components/dropdown-menu"

// El menú de acciones de una fila, que es de lo que se usa: ítems con atajo, un
// submenú, un grupo con su encabezado, casillas y un grupo de radios.
//
// `ContextMenu` y `Menubar` ya tenían todo esto probado; `DropdownMenu`, que es el
// más usado de los tres, no tenía ni submenú, ni casilla, ni radio, ni atajo.
function Acciones({
  onGuardar = () => {},
  onColumnas = () => {},
  onDensidad = () => {},
}: { onGuardar?: () => void; onColumnas?: (v: boolean) => void; onDensidad?: (v: string) => void } = {}) {
  const [densidad, setDensidad] = React.useState("compacta")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Acciones</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onGuardar}>
          Guardar
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Exportar</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Vista</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked
            onCheckedChange={(valor: boolean) => onColumnas(valor)}
          >
            Columnas fijas
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup
            value={densidad}
            onValueChange={(valor: string) => {
              setDensidad(valor)
              onDensidad(valor)
            }}
          >
            <DropdownMenuRadioItem value="compacta">Compacta</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="comoda">Cómoda</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const abrir = async () => {
  await userEvent.click(screen.getByRole("button", { name: "Acciones" }))
  return screen.findByRole("menuitem", { name: /Guardar/ })
}

describe("DropdownMenu", () => {
  it("abre con click y el ítem ejecuta su acción", async () => {
    const onGuardar = vi.fn()
    render(<Acciones onGuardar={onGuardar} />)

    await userEvent.click(await abrir())

    expect(onGuardar).toHaveBeenCalledTimes(1)
  })

  it("el atajo va dentro del ítem y forma parte de su nombre accesible", async () => {
    render(<Acciones />)
    const guardar = await abrir()

    // El atajo es contenido, no decoración: quien navega con lector tiene que
    // enterarse de que existe, así que no es `aria-hidden`. Y va separado del
    // label con una coma sr-only: pegado se leía «Guardar⌘S» de corrido.
    expect(guardar).toHaveAccessibleName("Guardar, ⌘S")
  })

  it("→ abre el submenú y ← lo cierra sin cerrar el menú de arriba", async () => {
    render(<Acciones />)
    await abrir()

    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Guardar/ })).toHaveFocus())
    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Exportar" })).toHaveFocus())

    await userEvent.keyboard("{ArrowRight}")
    expect(await screen.findByRole("menuitem", { name: "PDF" })).toBeInTheDocument()

    await userEvent.keyboard("{ArrowLeft}")
    await waitFor(() => expect(screen.queryByRole("menuitem", { name: "PDF" })).not.toBeInTheDocument())
    expect(screen.getByRole("menuitem", { name: /Guardar/ })).toBeInTheDocument()
  })

  it("el disparador del submenú se marca abierto y deja lugar para la flecha", async () => {
    render(<Acciones />)
    await abrir()

    const exportar = screen.getByRole("menuitem", { name: "Exportar" })
    expect(exportar).toHaveAttribute("aria-haspopup", "menu")
    await userEvent.click(exportar)
    await waitFor(() => expect(exportar).toHaveAttribute("data-popup-open"))
  })

  it("la casilla se anuncia como menuitemcheckbox y avisa el valor nuevo", async () => {
    const onColumnas = vi.fn()
    render(<Acciones onColumnas={onColumnas} />)
    await abrir()

    const casilla = screen.getByRole("menuitemcheckbox", { name: "Columnas fijas" })
    expect(casilla).toHaveAttribute("aria-checked", "true")

    await userEvent.click(casilla)

    expect(onColumnas).toHaveBeenLastCalledWith(false)
  })

  it("el grupo de radios deja uno solo marcado y elegir otro lo cambia", async () => {
    const onDensidad = vi.fn()
    render(<Acciones onDensidad={onDensidad} />)
    await abrir()

    const compacta = screen.getByRole("menuitemradio", { name: "Compacta" })
    const comoda = screen.getByRole("menuitemradio", { name: "Cómoda" })
    expect(compacta).toHaveAttribute("aria-checked", "true")
    expect(comoda).toHaveAttribute("aria-checked", "false")

    await userEvent.click(comoda)

    expect(onDensidad).toHaveBeenLastCalledWith("comoda")
  })

  it("el encabezado de grupo no es un ítem y el separador no se recorre", async () => {
    render(<Acciones />)
    await abrir()

    // «Vista» es texto, no una parada del recorrido: si fuera un `menuitem`,
    // las flechas se detendrían en un título que no hace nada.
    expect(screen.getByText("Vista")).not.toHaveAttribute("role", "menuitem")
    expect(screen.getAllByRole("separator")).toHaveLength(2)
    for (const separador of screen.getAllByRole("separator")) {
      expect(separador).not.toHaveAttribute("tabindex")
    }
  })

  it("el ítem destructivo se marca por data-variant, no solo por color", async () => {
    render(<Acciones />)
    await abrir()

    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toHaveAttribute("data-variant", "destructive")
  })

  it("Escape cierra y devuelve el foco al disparador", async () => {
    render(<Acciones />)
    await abrir()

    await userEvent.keyboard("{Escape}")

    await waitFor(() => expect(screen.queryByRole("menuitem", { name: /Guardar/ })).not.toBeInTheDocument())
    await waitFor(() => expect(screen.getByRole("button", { name: "Acciones" })).toHaveFocus())
  })
})
