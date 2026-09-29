import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFilter,
  CommandFilters,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../src/components/command"
import { LabelsProvider } from "../../src/lib/labels"
import { menuLabelClassName } from "../../src/variants/menu"

describe("Command", () => {
  const items = (
    <CommandList>
      <CommandGroup heading="Facturas">
        <CommandItem value="f-0012" description="Acme S.A.">
          Factura 0012
        </CommandItem>
        <CommandItem value="f-0013" description="Nube Digital">
          Factura 0013
        </CommandItem>
      </CommandGroup>
      <CommandGroup heading="Clientes">
        <CommandItem value="c-acme" keywords={["acme"]}>
          Acme S.A.
        </CommandItem>
        <CommandItem value="c-nube" keywords={["nube", "digital"]}>
          Cliente mayorista
        </CommandItem>
      </CommandGroup>
      <CommandEmpty />
    </CommandList>
  )

  it("filtra por título y keywords, sin importar tildes", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    await userEvent.type(screen.getByRole("combobox"), "acmé")
    expect(screen.getByRole("option", { name: /Acme S\.A\./ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /Factura 0013/ })).toBeNull()

    await userEvent.clear(screen.getByRole("combobox"))
    await userEvent.type(screen.getByRole("combobox"), "digital")
    // Por keyword: el título no dice «digital».
    expect(screen.getByRole("option", { name: /Cliente mayorista/ })).toBeInTheDocument()
  })

  it("Enter ejecuta el elegido y las flechas mueven la elección", async () => {
    const abrir = vi.fn()
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem value="a" onSelect={abrir}>
            Factura 0012
          </CommandItem>
          <CommandItem value="b" onSelect={abrir}>
            Factura 0013
          </CommandItem>
        </CommandList>
      </Command>
    )
    const campo = screen.getByRole("combobox")
    await userEvent.type(campo, "fact")
    await userEvent.keyboard("{ArrowDown}{Enter}")
    expect(abrir).toHaveBeenCalledWith("b")
    // Elegir no escribe el valor interno («b») en el campo.
    expect(campo).toHaveValue("fact")
  })

  // R2: iCloud no completa en línea (eso era de Spotlight). Tab sale del campo como en cualquier
  // combobox y no hay pista `tab`.
  it("no hay sugerencia en línea: Tab no completa y sale del campo", async () => {
    render(
      <>
        <Command>
          <CommandInput />
          {items}
        </Command>
        <button type="button">Después</button>
      </>
    )
    const campo = screen.getByRole("combobox")
    await userEvent.type(campo, "Fact")
    expect(document.querySelector("[data-slot='command-completion'], [data-slot='command-item-hint']")).toBeNull()
    await userEvent.keyboard("{ArrowRight}{Tab}")
    expect(campo).toHaveValue("Fact")
    expect(campo).not.toHaveFocus()
  })

  it("el elegido va en el gris del resaltado de menú, no en acento", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    await userEvent.type(screen.getByRole("combobox"), "fact")
    const elegido = screen.getAllByRole("option")[0]!
    expect(elegido).toHaveAttribute("data-highlighted")
    expect(elegido.className).toMatch(/data-highlighted:bg-fill-2/)
    expect(elegido.className).not.toMatch(/bg-selection/)
    expect(elegido).toHaveAccessibleName(/^Factura 0012/)
  })

  // Las filas de resultados son las del menú de iCloud (§2.8): 30 px, radio 8, 14/400, ícono en una
  // caja de 30 con el glifo en el acento. Con detalle, un segundo renglón de 12 en gris.
  it("fila de menú de iCloud: 30 px, radio 8, ícono en acento, título y detalle", () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem value="a" icon={<svg data-testid="icono" />} description="Acme S.A.">
            Factura 0012
          </CommandItem>
        </CommandList>
      </Command>
    )
    const fila = screen.getByRole("option")
    expect(fila).toHaveClass("min-h-7.5", "rounded-menu-item", "px-2.5", "text-callout")
    expect(fila).not.toHaveClass("h-10")
    expect(screen.getByTestId("icono").parentElement).toHaveClass("size-7.5", "text-brand-900")
    expect(within(fila).getByText("Factura 0012")).not.toHaveClass("font-medium")
    expect(within(fila).getByText("Acme S.A.")).toHaveClass("text-footnote", "text-label-secondary")
  })

  it("los grupos llevan el título de sección de los menús", () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    const titulo = screen.getByText("Facturas")
    for (const clase of menuLabelClassName.split(" ")) expect(titulo).toHaveClass(clase)
    expect(screen.getByRole("group", { name: "Facturas" })).toBeInTheDocument()
  })

  it("sin resultados muestra el vacío", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    expect(screen.queryByText("Sin resultados")).toBeNull()
    await userEvent.type(screen.getByRole("combobox"), "zzz")
    expect(screen.getByText("Sin resultados")).toBeInTheDocument()
    expect(screen.queryAllByRole("option")).toHaveLength(0)
  })

  it("ítems que llegan tarde (índice async) quedan con el primero elegido", async () => {
    const abrir = vi.fn()
    function Tardio({ listo }: { listo: boolean }) {
      return (
        <Command shouldFilter={false}>
          <CommandInput />
          <CommandList>
            {listo && (
              <>
                <CommandItem description="Acme S.A." onSelect={abrir} value="f-0012">
                  Factura 0012
                </CommandItem>
                <CommandItem onSelect={abrir} value="f-0013">
                  Factura 0013
                </CommandItem>
              </>
            )}
          </CommandList>
          <CommandEmpty />
        </Command>
      )
    }
    const { rerender } = render(<Tardio listo={false} />)
    const campo = screen.getByRole("combobox")
    // Se escribe antes de que llegue el índice.
    await userEvent.type(campo, "fact")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
    rerender(<Tardio listo />)
    await waitFor(() => expect(screen.getAllByRole("option")[0]).toHaveAttribute("data-highlighted"))
    await userEvent.keyboard("{Enter}")
    expect(abrir).toHaveBeenCalledWith("f-0012")
  })

  it("dos ítems con el mismo value: esconder uno no borra al otro", async () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          <CommandItem value="dup">Factura A</CommandItem>
          <CommandItem value="dup">Factura B</CommandItem>
        </CommandList>
        <CommandEmpty />
      </Command>
    )
    await userEvent.type(screen.getByRole("combobox"), "factura b")
    expect(screen.getAllByRole("option")).toHaveLength(1)
    expect(screen.queryByText("Sin resultados")).toBeNull()
    expect(screen.getByRole("option")).toHaveAttribute("data-highlighted")
  })

  it("shouldFilter={false} deja los ítems como vienen, en su orden", async () => {
    render(
      <Command shouldFilter={false}>
        <CommandInput />
        <CommandList>
          <CommandItem value="b">Zeta</CommandItem>
          <CommandItem value="a">Alfa</CommandItem>
        </CommandList>
      </Command>
    )
    await userEvent.type(screen.getByRole("combobox"), "alfa")
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual([
      expect.stringContaining("Zeta"),
      expect.stringContaining("Alfa"),
    ])
  })

  // El search field de iCloud (§2.13): 36 px, radio 10, relleno fill-1, lupa de 16 y texto 14; con
  // el foco pierde el relleno y queda el anillo interior.
  it("el campo es el search field de iCloud", () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    const campo = screen.getByRole("combobox")
    expect(campo).toHaveClass("text-callout", "placeholder:text-label-tertiary")
    expect(campo).toHaveAccessibleName("Buscar")
    expect(campo).toHaveAttribute("placeholder", "Buscar")
    const caja = campo.closest("[data-slot='command-input-wrapper']")!
    expect(caja).toHaveClass("h-9", "rounded-field", "bg-fill-1", "focus-within:bg-transparent", "focus-within:focus-ring")
    expect(caja).not.toHaveClass("h-12", "border-b")
    expect(caja.querySelector("svg.lucide-search")).toHaveClass("size-4", "text-label-tertiary")
  })

  it("el nombre del campo es su placeholder si lo trae; un aria-label le gana", () => {
    const { unmount } = render(
      <Command>
        <CommandInput placeholder="Facturas, clientes…" />
      </Command>
    )
    expect(screen.getByRole("combobox")).toHaveAccessibleName("Facturas, clientes…")
    unmount()
    render(
      <Command>
        <CommandInput aria-label="Buscar en facturación" placeholder="Facturas, clientes…" />
      </Command>
    )
    expect(screen.getByRole("combobox")).toHaveAccessibleName("Buscar en facturación")
  })

  it("los chips son un radiogroup con nombre: exponen su valor y siempre hay uno", async () => {
    const onValueChange = vi.fn()
    render(
      <Command>
        <CommandInput />
        <CommandFilters defaultValue="all" onValueChange={onValueChange}>
          <CommandFilter value="all">Todo</CommandFilter>
          <CommandFilter value="facturas">Facturas</CommandFilter>
        </CommandFilters>
        {items}
      </Command>
    )
    expect(screen.getByRole("radiogroup", { name: "Filtros" })).toBeInTheDocument()
    const todo = screen.getByRole("radio", { name: "Todo" })
    expect(todo).toHaveAttribute("aria-checked", "true")
    // Son los tokens del search field de iCloud: gris, y el prendido en el acento sólido.
    expect(todo).toHaveClass("h-6", "bg-fill-1", "data-checked:bg-brand-700", "data-checked:text-brand-contrast")
    await userEvent.click(screen.getByRole("radio", { name: "Facturas" }))
    expect(onValueChange).toHaveBeenLastCalledWith("facturas")
    expect(todo).toHaveAttribute("aria-checked", "false")
    // Volver a tocar el prendido no lo apaga: siempre hay un filtro.
    await userEvent.click(screen.getByRole("radio", { name: "Facturas" }))
    expect(screen.getByRole("radio", { name: "Facturas" })).toHaveAttribute("aria-checked", "true")
  })

  it("los textos salen del LabelsProvider y la prop labels le gana", async () => {
    render(
      <LabelsProvider value={{ command: { placeholder: "Search", empty: "No results" } }}>
        <Command labels={{ empty: "Nada" }}>
          <CommandInput />
          {items}
        </Command>
      </LabelsProvider>
    )
    expect(screen.getByRole("combobox")).toHaveAttribute("placeholder", "Search")
    await userEvent.type(screen.getByRole("combobox"), "zzz")
    expect(screen.getByText("Nada")).toBeInTheDocument()
  })
})

describe("CommandDialog", () => {
  const contenido = (
    <>
      <CommandInput />
      <CommandList>
        <CommandItem value="a">Factura 0012</CommandItem>
      </CommandList>
    </>
  )

  it("cierra con Escape y no tiene X", async () => {
    const onOpenChange = vi.fn()
    render(
      <CommandDialog open onOpenChange={onOpenChange}>
        {contenido}
      </CommandDialog>
    )
    expect(screen.queryByRole("button", { name: "Cerrar" })).toBeNull()
    // El foco inicial cae en el campo: es lo primero tabulable del panel.
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus())
    await userEvent.keyboard("{Escape}")
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it("el foco inicial va al campo aunque haya algo tabulable antes", async () => {
    render(
      <CommandDialog open>
        <button type="button">Antes</button>
        {contenido}
      </CommandDialog>
    )
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus())
  })

  it("un click afuera la cierra", async () => {
    const onOpenChange = vi.fn()
    render(
      <>
        <button type="button">Afuera</button>
        <CommandDialog open onOpenChange={onOpenChange}>
          {contenido}
        </CommandDialog>
      </>
    )
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus())
    await userEvent.click(document.body)
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it("se nombra con labels y va anclado arriba: el popover de búsqueda de iCloud", () => {
    render(
      <CommandDialog open labels={{ dialog: "Buscar en facturación" }}>
        {contenido}
      </CommandDialog>
    )
    const dialogo = screen.getByRole("dialog", { name: "Buscar en facturación" })
    expect(dialogo).toHaveClass("top-[18vh]", "bg-surface", "rounded-menu", "shadow-menu", "p-1")
    expect(dialogo).not.toHaveClass("rounded-panel", "shadow-modal")
    expect(dialogo.className).toMatch(/w-\[min\(560px,calc\(100%-2rem\)\)\]/)
  })
})
