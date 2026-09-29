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

function completion() {
  return document.querySelector("[data-slot='command-completion']")
}

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

  it("sugiere en línea el resto del resultado elegido y Tab lo acepta", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    const campo = screen.getByRole("combobox")
    await userEvent.type(campo, "Fact")
    expect(completion()).toHaveTextContent("ura 0012 — Acme S.A.")
    // Es solo visual: el valor del campo sigue siendo lo escrito y el lector no la lee.
    expect(campo).toHaveValue("Fact")
    expect(completion()?.closest("[aria-hidden='true']")).not.toBeNull()
    await userEvent.keyboard("{Tab}")
    expect(campo).toHaveValue("Factura 0012")
    expect(campo).toHaveFocus()
  })

  it("→ al final del texto también completa; sin sugerencia, Tab no se traba", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    const campo = screen.getByRole("combobox")
    await userEvent.type(campo, "fáct")
    await userEvent.keyboard("{ArrowRight}")
    expect(campo).toHaveValue("Factura 0012")

    await userEvent.clear(campo)
    // «digital» encuentra por keyword, pero el título no empieza así: no hay nada que completar.
    await userEvent.type(campo, "digital")
    expect(completion()).toBeNull()
  })

  it("con el título entero escrito no hay pista tab y Tab sale del campo", async () => {
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
    await userEvent.type(campo, "factura 0012")
    const elegido = screen.getByRole("option", { name: /Factura 0012/ })
    expect(elegido).toHaveAttribute("data-highlighted")
    // El detalle se sigue viendo, como en Spotlight, pero Tab ya no completa nada.
    expect(completion()).toHaveTextContent("— Acme S.A.")
    expect(elegido.querySelector("[data-slot='command-item-hint']")).toBeNull()
    await userEvent.keyboard("{Tab}")
    expect(campo).toHaveValue("factura 0012")
    expect(campo).not.toHaveFocus()
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

  it("la sugerencia en línea sigue al elegido", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    await userEvent.type(screen.getByRole("combobox"), "fact")
    await userEvent.keyboard("{ArrowDown}")
    expect(completion()).toHaveTextContent("ura 0013 — Nube Digital")
  })

  it("si el elegido desaparece al filtrar, la sugerencia pasa al que quedó", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    const campo = screen.getByRole("combobox")
    await userEvent.type(campo, "fact")
    await userEvent.keyboard("{ArrowDown}")
    await userEvent.type(campo, "ura 0012")
    expect(screen.getByRole("option", { name: /Factura 0012/ })).toHaveAttribute("data-highlighted")
    expect(completion()).toHaveTextContent("— Acme S.A.")
  })

  it("el elegido va en gris translúcido con la pista tab, no en acento", async () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    await userEvent.type(screen.getByRole("combobox"), "fact")
    const elegido = screen.getAllByRole("option")[0]!
    expect(elegido).toHaveAttribute("data-highlighted")
    expect(elegido.className).toMatch(/data-highlighted:bg-gray-alpha-200/)
    expect(elegido.className).not.toMatch(/bg-selection/)
    const pista = elegido.querySelector("[data-slot='command-item-hint']")
    expect(pista).toHaveTextContent("tab")
    expect(pista).toHaveAttribute("aria-hidden", "true")
    // El nombre de la opción no incluye la pista.
    expect(elegido).toHaveAccessibleName(/^Factura 0012/)
  })

  it("fila de 40 px con ícono de 32, título y descripción", () => {
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
    expect(fila).toHaveClass("h-10")
    expect(screen.getByTestId("icono").parentElement).toHaveClass("size-8")
    expect(within(fila).getByText("Factura 0012")).toHaveClass("text-body", "font-medium")
    expect(within(fila).getByText("Acme S.A.")).toHaveClass("text-callout", "text-gray-900")
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
    expect(completion()).toHaveTextContent("ura 0012 — Acme S.A.")
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

  it("el campo es la cabecera: 48 px, cuerpo grande regular y la lupa a la izquierda", () => {
    render(
      <Command>
        <CommandInput />
        {items}
      </Command>
    )
    const campo = screen.getByRole("combobox")
    // `body-large` y no `title-2 font-normal`: un rol no se pisa de peso (typography.test.ts).
    expect(campo).toHaveClass("text-body-large")
    expect(campo).toHaveAccessibleName("Buscar")
    expect(campo).toHaveAttribute("placeholder", "Buscar")
    const cabecera = campo.closest("[data-slot='command-input-wrapper']")!
    expect(cabecera).toHaveClass("h-12")
    expect(cabecera.querySelector("svg.lucide-search")).toHaveClass("size-5")
  })

  it("los chips exponen su valor y son de una sola opción", async () => {
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
    const todo = screen.getByRole("button", { name: "Todo" })
    expect(todo).toHaveAttribute("aria-pressed", "true")
    await userEvent.click(screen.getByRole("button", { name: "Facturas" }))
    expect(onValueChange).toHaveBeenLastCalledWith("facturas")
    expect(todo).toHaveAttribute("aria-pressed", "false")
    // Volver a tocar el prendido no lo apaga: siempre hay un filtro.
    await userEvent.click(screen.getByRole("button", { name: "Facturas" }))
    expect(screen.getByRole("button", { name: "Facturas" })).toHaveAttribute("aria-pressed", "true")
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

  it("se nombra con labels y va anclado arriba, en el vidrio del popover", () => {
    render(
      <CommandDialog open labels={{ dialog: "Buscar en facturación" }}>
        {contenido}
      </CommandDialog>
    )
    const dialogo = screen.getByRole("dialog", { name: "Buscar en facturación" })
    expect(dialogo).toHaveClass("top-[18vh]", "material-popover", "rounded-panel")
    expect(dialogo.className).toMatch(/w-\[min\(640px,calc\(100%-2rem\)\)\]/)
  })
})
