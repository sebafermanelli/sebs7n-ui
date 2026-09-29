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
import { menuItemClassName, menuLabelClassName, menuPopupClassName, menuSeparatorClassName } from "../../src/variants/menu"

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

describe("menú de macOS (2.0)", () => {
  it("un px-* de la app no se come la canaleta del tilde", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Ver</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked className="px-3">
            Mostrar vencidas
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="mes">
            <DropdownMenuRadioItem className="px-3" value="mes">
              Por mes
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const tildado = await screen.findByRole("menuitemcheckbox", { name: "Mostrar vencidas" })
    expect(tildado).toHaveClass("px-3", "pl-7")
    expect(screen.getByRole("menuitemradio", { name: "Por mes" })).toHaveClass("px-3", "pl-7")
  })

  it("el tilde va a la izquierda y el texto alinea después de la canaleta", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Ver</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Mostrar vencidas</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="mes">
            <DropdownMenuRadioItem value="mes">Por mes</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuItem inset>Exportar</DropdownMenuItem>
          <DropdownMenuItem>Imprimir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const tildado = await screen.findByRole("menuitemcheckbox", { name: "Mostrar vencidas" })
    expect(tildado).toHaveClass("pl-7")
    expect(tildado.className).not.toMatch(/\bpr-8\b/)
    expect(tildado.querySelector("[data-slot=dropdown-menu-item-indicator]")).toHaveClass("left-2")
    const radio = screen.getByRole("menuitemradio", { name: "Por mes" })
    expect(radio).toHaveClass("pl-7")
    expect(radio.querySelector("[data-slot=dropdown-menu-item-indicator]")).toHaveClass("left-2")
    expect(screen.getByRole("menuitem", { name: "Exportar" })).toHaveClass("data-inset:pl-7")
    // Un menú sin tildes no reserva la canaleta: el ítem común se queda en `px-2`.
    expect(screen.getByRole("menuitem", { name: "Imprimir" }).className).not.toMatch(/(^|\s)pl-7\b/)
  })

  it("el título de grupo es chico, en negrita y gris; con inset alinea con la canaleta", async () => {
    expect(menuLabelClassName).toMatch(/\btext-callout\b/)
    expect(menuLabelClassName).toMatch(/\bfont-semibold\b/)
    expect(menuLabelClassName).toMatch(/\btext-gray-900\b/)
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Ver</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Orden</DropdownMenuLabel>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    expect(await screen.findByText("Orden")).toHaveClass("data-inset:pl-7")
  })

  it("el separador tiene aire a los costados", () => {
    expect(menuSeparatorClassName).toMatch(/\bmx-2\b/)
    expect(menuSeparatorClassName).not.toMatch(/-mx-1/)
  })

  it("el panel: p-1, radio concéntrico y 192 px de mínimo", () => {
    expect(menuPopupClassName).toMatch(/(^|\s)p-1(\s|$)/)
    // 8 del ítem + 4 del padding = 12, el radio de los menús de iCloud.
    expect(menuPopupClassName).toMatch(/(^|\s)rounded-menu(\s|$)/)
    expect(menuPopupClassName).not.toContain("--radius-control")
    expect(menuPopupClassName).toMatch(/(^|\s)min-w-48(\s|$)/)
  })

  it("el ítem resaltado usa el radio de ítem de menú (6 px), no el de control", () => {
    expect(menuItemClassName).toMatch(/(^|\s)rounded-menu-item(\s|$)/)
    expect(menuItemClassName).not.toMatch(/(^|\s)rounded-control(\s|$)/)
  })
})
