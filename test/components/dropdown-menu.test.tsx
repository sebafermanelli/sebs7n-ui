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
      <DropdownMenuTrigger render={<Button variant="secondary" />}>Acciones</DropdownMenuTrigger>
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

  it("el ítem destructivo va en rojo y se marca también por data-variant", async () => {
    render(<Acciones />)
    await abrir()

    const eliminar = screen.getByRole("menuitem", { name: "Eliminar" })
    expect(eliminar).toHaveAttribute("data-variant", "destructive")
    // Texto e ícono en la tinta roja (el ícono deja el acento), sobre el mismo gris al resaltarlo.
    expect(eliminar).toHaveClass("text-red-ink", "[&>svg:first-child:not([data-slot])]:text-current", "data-highlighted:bg-fill-2")
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
  it("un px-* de la app no se come la columna del tilde", async () => {
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
    expect(tildado).toHaveClass("px-3", "pr-9")
    expect(screen.getByRole("menuitemradio", { name: "Por mes" })).toHaveClass("px-3", "pr-9")
  })

  it("el tilde es el círculo de acento a la derecha, como el «View as» de iCloud", async () => {
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
    expect(tildado).toHaveClass("pr-9")
    expect(tildado.className).not.toMatch(/(^|\s)pl-7\b/)
    const indicador = tildado.querySelector("[data-slot=dropdown-menu-item-indicator]")!
    expect(indicador).toHaveClass("right-2.5")
    expect(indicador.firstElementChild).toHaveClass("size-4", "rounded-full", "bg-brand-900", "text-surface")
    const radio = screen.getByRole("menuitemradio", { name: "Por mes" })
    expect(radio).toHaveClass("pr-9")
    expect(radio.querySelector("[data-slot=dropdown-menu-item-indicator]")).toHaveClass("right-2.5")
    // `inset` alinea con el texto de los ítems que llevan ícono: 10 + 16 + 10.
    expect(screen.getByRole("menuitem", { name: "Exportar" })).toHaveClass("data-inset:pl-9")
    // Un ítem sin tilde no reserva la columna.
    expect(screen.getByRole("menuitem", { name: "Imprimir" }).className).not.toMatch(/(^|\s)pr-9\b/)
  })

  it("el título de grupo es una fila de 30, 14/600 en el color del texto (el «View as» de iCloud)", async () => {
    const titulo = menuLabelClassName.split(" ")
    expect(titulo).toEqual(expect.arrayContaining(["h-7.5", "px-2.5", "text-callout", "font-semibold", "text-label"]))
    expect(titulo).not.toContain("text-label-secondary")
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
    expect(await screen.findByText("Orden")).toHaveAttribute("data-inset")
  })

  it("el separador: 9 px de alto, línea de fill-2 con 11 de margen a los costados", () => {
    const separador = menuSeparatorClassName.split(" ")
    expect(separador).toEqual(expect.arrayContaining(["mx-2.75", "my-1", "h-px", "bg-fill-2"]))
    expect(menuSeparatorClassName).not.toMatch(/-mx-1/)
  })

  it("el panel: radio 12, 5 de padding y 208 px de mínimo, como el menú de Drive", () => {
    const panel = menuPopupClassName.split(" ")
    expect(panel).toEqual(expect.arrayContaining(["rounded-menu", "p-1.25", "min-w-52", "bg-surface", "shadow-menu"]))
    expect(menuPopupClassName).not.toContain("--radius-control")
  })

  it("el ítem: 30 de alto, 10 de lado, 14 de texto, íconos de 16 y el primero en el acento", () => {
    const item = menuItemClassName.split(" ")
    expect(item).toEqual(expect.arrayContaining(["h-7.5", "px-2.5", "gap-2.5", "text-callout", "[&>svg:first-child:not([data-slot])]:text-brand-900"]))
    expect(menuItemClassName).toContain("[&_svg:not([class*='size-'])]:size-4")
  })

  it("el acento es solo del ícono de la app: el chevron del submenú y la flecha externa llevan data-slot", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Ver</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Compartir</DropdownMenuSubTrigger>
          </DropdownMenuSub>
          <DropdownMenuItem external>Centro de ayuda</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    // Un ítem de solo texto tiene la flecha o el chevron como primer hijo: sin el data-slot, el
    // selector del ícono de la app los pintaba en el acento.
    const sub = await screen.findByRole("menuitem", { name: "Compartir" })
    expect(sub.querySelector("svg")).toHaveAttribute("data-slot", "dropdown-menu-sub-icon")
    expect(screen.getByRole("menuitem", { name: "Centro de ayuda" }).querySelector("svg")).toHaveAttribute("data-slot", "dropdown-menu-external-icon")
  })

  it("external: el texto en el acento y ↗ al final, como «Manage Apple Account ↗»", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Ayuda</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem external render={<a href="https://example.com" rel="noopener" target="_blank" />}>
            Centro de ayuda
          </DropdownMenuItem>
          <DropdownMenuItem>Atajos</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const ayuda = await screen.findByRole("menuitem", { name: "Centro de ayuda" })
    expect(ayuda.tagName).toBe("A")
    expect(ayuda).toHaveAttribute("data-external")
    expect(ayuda).toHaveClass("text-brand-ink")
    const flecha = ayuda.querySelector("svg.lucide-arrow-up-right")!
    expect(flecha).toHaveAttribute("aria-hidden", "true")
    expect(flecha).toHaveClass("ml-auto")
    expect(ayuda.lastElementChild).toBe(flecha)
    expect(screen.getByRole("menuitem", { name: "Atajos" })).not.toHaveAttribute("data-external")
  })

  it("el atajo va a la derecha, gris y en el tamaño del ítem", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Ver</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Guardar
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const atajo = (await screen.findByRole("menuitem", { name: /Guardar/ })).querySelector("[data-slot=dropdown-menu-shortcut]")
    expect(atajo).toHaveClass("ml-auto", "text-callout", "text-label-secondary")
    expect(atajo).not.toHaveClass("text-mono-callout")
  })

  it("el ítem resaltado usa el radio de ítem de menú (8 px), no el de control", () => {
    expect(menuItemClassName).toMatch(/(^|\s)rounded-menu-item(\s|$)/)
    expect(menuItemClassName).not.toMatch(/(^|\s)rounded-control(\s|$)/)
  })
})

// Revisión de R3: el primer ícono de un ítem va en el acento por `[&>svg:first-child]`. El tilde
// iba antes de `children` y Base UI lo desmonta al desmarcar, así que marcar el ítem cambiaba cuál
// era el primer hijo y el ícono perdía el acento. El tilde va después: es absoluto a la derecha,
// el orden del DOM no mueve nada.
describe("el ícono de un ítem marcable no cambia de color al marcarlo", () => {
  it("el ícono es el primer hijo marcado y desmarcado", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Vista</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem>
            <svg data-testid="icono" />
            Barra lateral
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const item = await screen.findByRole("menuitemcheckbox", { name: "Barra lateral" })
    expect(item.firstElementChild).toBe(screen.getByTestId("icono"))
    await userEvent.click(item)
    await waitFor(() => expect(item).toHaveAttribute("data-checked"))
    expect(item.querySelector("[data-slot=dropdown-menu-item-indicator]")).not.toBeNull()
    expect(item.firstElementChild).toBe(screen.getByTestId("icono"))
  })

  it.each(["dropdown-menu.tsx", "context-menu.tsx", "menubar.tsx"])("%s pone el tilde después de children", async (archivo) => {
    const { readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    const fuente = readFileSync(join(import.meta.dirname, "../../src/components", archivo), "utf8")
    expect(fuente).not.toMatch(/ItemIndicator>\s*\{children\}/)
    expect(fuente.match(/\{children\}\s*<\w+\.(Checkbox|Radio)ItemIndicator/g)).toHaveLength(2)
  })
})

// Revisión de R3: en un menú que mezcla ítems con ícono y con tilde, el marcable también tiene que
// poder alinear su texto con la columna del ícono.
describe("inset en los ítems marcables", () => {
  it("CheckboxItem y RadioItem aceptan inset y alinean con la columna del ícono", async () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Vista</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem inset>Barra lateral</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem inset value="a">
              Lista
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    for (const item of [await screen.findByRole("menuitemcheckbox", { name: "Barra lateral" }), screen.getByRole("menuitemradio", { name: "Lista" })]) {
      expect(item).toHaveAttribute("data-inset")
      expect(item).toHaveClass("data-inset:pl-9", "pr-9")
    }
  })

  it.each(["context-menu.tsx", "menubar.tsx"])("%s: CheckboxItem y RadioItem aceptan inset", async (archivo) => {
    const { readFileSync } = await import("node:fs")
    const { join } = await import("node:path")
    const fuente = readFileSync(join(import.meta.dirname, "../../src/components", archivo), "utf8")
    expect(fuente).toMatch(/(Checkbox)ItemProps = WithClassName<[^>]+> & MenuInsetProps/)
    expect(fuente).toMatch(/(Radio)ItemProps = WithClassName<[^>]+> & MenuInsetProps/)
  })
})
