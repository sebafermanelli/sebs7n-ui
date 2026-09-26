import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { hydrateRoot } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "../../src/components/autocomplete"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxStatus,
  ComboboxValue,
} from "../../src/components/combobox"
import { menuItemClassName, menuPopupClassName } from "../../src/variants/menu"
import { tagRemoveClassName } from "../../src/variants/tag"

const COUNTRIES = ["Argentina", "Armenia", "Bolivia", "Brasil", "Chile", "Uruguay"]

function CountryCombobox(props: Omit<React.ComponentProps<typeof ComboboxInput>, "placeholder"> & { onValueChange?: (value: string | null) => void }) {
  const { onValueChange, ...inputProps } = props
  return (
    <Combobox items={COUNTRIES} onValueChange={onValueChange}>
      <ComboboxInput aria-label="País" placeholder="Elegí un país" {...inputProps} />
      <ComboboxContent>
        <ComboboxEmpty />
        <ComboboxList>
          {(country: string) => (
            <ComboboxItem key={country} value={country}>
              {country}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const classesOf = (value: string) => value.split(/\s+/).filter(Boolean)

describe("Combobox", () => {
  it("el input tiene el cuerpo y los estados de Input (tamaños, foco, inválido, disabled)", () => {
    render(
      <>
        <CountryCombobox data-testid="md" />
        <CountryCombobox size="sm" aria-invalid />
        <CountryCombobox size="lg" disabled />
      </>
    )
    const [md, sm, lg] = screen.getAllByRole("combobox", { name: "País" }) as [HTMLElement, HTMLElement, HTMLElement]
    const group = (input: HTMLElement) => input.closest<HTMLElement>("[data-slot=combobox-input-group]")!
    expect(group(md)).toHaveAttribute("data-size", "md")
    expect(group(md)).toHaveClass(
      "rounded-md", "border", "border-gray-400", "bg-background-100", "transition-control",
      "data-[size=sm]:h-8", "data-[size=md]:h-10", "data-[size=lg]:h-12",
      "hover:border-gray-500", "has-[input:focus]:focus-border",
      "has-[input[aria-invalid=true]]:border-red-800", "data-disabled:bg-gray-100"
    )
    expect(group(md)).toHaveClass("text-copy-14", "data-[size=lg]:text-copy-16")
    expect(md).toHaveClass("placeholder:text-gray-900", "bg-transparent", "outline-none")
    expect(group(sm)).toHaveAttribute("data-size", "sm")
    expect(sm).toHaveAttribute("aria-invalid", "true")
    expect(group(lg)).toHaveAttribute("data-size", "lg")
    expect(lg).toBeDisabled()
    expect(group(lg)).toHaveAttribute("data-disabled")
  })

  it("chevron abre la lista; el popup y los ítems usan las clases de menú", async () => {
    render(<CountryCombobox />)
    await userEvent.click(screen.getByRole("button", { name: "Abrir lista" }))
    const listbox = await screen.findByRole("listbox")
    const popup = listbox.closest<HTMLElement>("[data-slot=combobox-content]")!
    // min-w-40 lo reemplaza min-w-(--anchor-width): al menos tan ancho como el input.
    expect(popup).toHaveClass(...classesOf(menuPopupClassName).filter((c) => !c.startsWith("min-w-")), "min-w-(--anchor-width)")
    const option = within(listbox).getByRole("option", { name: "Argentina" })
    expect(option).toHaveClass(...classesOf(menuItemClassName))
    expect(within(listbox).getAllByRole("option")).toHaveLength(COUNTRIES.length)
  })

  it("teclado: escribir filtra, flechas resaltan, Enter elige y Escape cierra", async () => {
    const onValueChange = vi.fn()
    render(<CountryCombobox onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "País" })
    await userEvent.click(input)
    await userEvent.keyboard("ar")
    const listbox = await screen.findByRole("listbox")
    await waitFor(() => expect(within(listbox).getAllByRole("option").map((o) => o.textContent)).toEqual(["Argentina", "Armenia"]))
    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(within(listbox).getByRole("option", { name: "Argentina" })).toHaveAttribute("data-highlighted"))
    await userEvent.keyboard("{ArrowDown}")
    await waitFor(() => expect(within(listbox).getByRole("option", { name: "Armenia" })).toHaveAttribute("data-highlighted"))
    await userEvent.keyboard("{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith("Armenia", expect.anything())
    await waitFor(() => expect(input).toHaveValue("Armenia"))
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())

    await userEvent.keyboard("{ArrowDown}")
    expect(await screen.findByRole("listbox")).toBeInTheDocument()
    // El elegido lleva el check.
    const selected = screen.getByRole("option", { name: "Armenia" })
    expect(selected).toHaveAttribute("aria-selected", "true")
    expect(selected.querySelector("[data-slot=combobox-item-indicator] svg")).not.toBeNull()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull())
  })

  it("sin coincidencias muestra \"Sin resultados\"", async () => {
    render(<CountryCombobox />)
    await userEvent.click(screen.getByRole("combobox", { name: "País" }))
    await userEvent.keyboard("zzz")
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument()
    // Del alto de un ítem, no de tres.
    expect(screen.getByText("Sin resultados")).toHaveClass("h-8")
    expect(screen.queryAllByRole("option")).toHaveLength(0)
  })

  it("limpiar vacía la selección", async () => {
    render(<CountryCombobox />)
    const input = screen.getByRole("combobox", { name: "País" })
    expect(screen.queryByRole("button", { name: "Limpiar" })).toBeNull()
    await userEvent.click(input)
    await userEvent.keyboard("chi{ArrowDown}{Enter}")
    await waitFor(() => expect(input).toHaveValue("Chile"))
    const clear = screen.getByRole("button", { name: "Limpiar" })
    expect(clear).toHaveClass("transition-control", "hover:bg-gray-alpha-200", "focus-visible:focus-ring")
    await userEvent.click(clear)
    await waitFor(() => expect(input).toHaveValue(""))
  })

  it("grupos con label", async () => {
    const groups = [
      { value: "Sudamérica", items: ["Argentina", "Chile"] },
      { value: "Europa", items: ["España", "Italia"] },
    ]
    render(
      <Combobox items={groups}>
        <ComboboxInput aria-label="País" />
        <ComboboxContent>
          <ComboboxList>
            {(group: (typeof groups)[number]) => (
              <ComboboxGroup key={group.value} items={group.items}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(country: string) => (
                    <ComboboxItem key={country} value={country}>
                      {country}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir lista" }))
    const europa = await screen.findByRole("group", { name: "Europa" })
    expect(within(europa).getAllByRole("option").map((o) => o.textContent)).toEqual(["España", "Italia"])
    expect(screen.getByText("Europa")).toHaveClass("text-label-12", "text-gray-900")
  })

  it("búsqueda async: fila de carga con spinner, después resultados o vacío", async () => {
    // El "servidor" es una promesa que resuelve el test, no un `setTimeout(…, 20)`.
    // Con el timer esto era una carrera: si la máquina estaba cargada, los 20 ms se
    // cumplían antes de que `findByText("Buscando…")` llegara a mirar el DOM, la fila
    // de carga ya no existía y el test fallaba sin que hubiera nada roto. Así el
    // estado de carga dura exactamente hasta que el test dice.
    let responder: (() => void) | undefined
    const respuestaDelServidor = () =>
      new Promise<void>((resolve) => {
        responder = resolve
      })

    function AsyncCombobox() {
      const [items, setItems] = React.useState<string[]>([])
      const [loading, setLoading] = React.useState(false)
      return (
        <Combobox
          items={items}
          filter={null}
          onInputValueChange={(query) => {
            setLoading(true)
            respuestaDelServidor().then(() => {
              setItems(COUNTRIES.filter((c) => c.toLowerCase().startsWith(query.toLowerCase())))
              setLoading(false)
            })
          }}
        >
          <ComboboxInput aria-label="Pasajero" />
          <ComboboxContent>
            <ComboboxStatus loading={loading} />
            <ComboboxEmpty>{loading ? null : undefined}</ComboboxEmpty>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )
    }
    render(<AsyncCombobox />)
    await userEvent.click(screen.getByRole("combobox", { name: "Pasajero" }))
    await userEvent.keyboard("b")
    const row = await screen.findByText("Buscando…")
    expect(row.closest("[data-slot=combobox-loading]")!.querySelector("svg")).toHaveClass("animate-spin")
    expect(screen.queryByText("Sin resultados")).toBeNull()

    await act(async () => responder?.())
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Bolivia", "Brasil"])
    expect(screen.queryByText("Buscando…")).toBeNull()

    await userEvent.keyboard("x")
    await act(async () => responder?.())
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument()
  })

  it("múltiple: chips con estilo Badge subtle que se quitan", async () => {
    const onValueChange = vi.fn()
    render(
      <Combobox items={COUNTRIES} multiple defaultValue={["Chile"]} onValueChange={onValueChange}>
        <ComboboxChips>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((value) => (
                  <ComboboxChip key={value}>{value}</ComboboxChip>
                ))}
                <ComboboxChipsInput aria-label="Países" />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            {(country: string) => (
              <ComboboxItem key={country} value={country}>
                {country}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
    const chip = screen.getByText("Chile").closest<HTMLElement>("[data-slot=combobox-chip]")!
    expect(chip).toHaveClass("rounded-full", "border-gray-400", "bg-gray-100", "text-gray-900", "text-label-12")
    await userEvent.click(screen.getByRole("combobox", { name: "Países" }))
    await userEvent.keyboard("uru{ArrowDown}{Enter}")
    expect(onValueChange).toHaveBeenLastCalledWith(["Chile", "Uruguay"], expect.anything())
    expect(await screen.findByText("Uruguay", { selector: "[data-slot=combobox-chip] *" })).toBeInTheDocument()
    // El chip es el `Tag` del sistema: mismo cuerpo, mismo botón de quitar de 16px con el
    // `::after` de `-inset-1` que lleva el área de toque a 24 (WCAG 2.5.8). Y tiene que dejar
    // de recortar, o ese área —y el anillo de foco— quedan cortados contra el borde.
    const quitar = screen.getByRole("button", { name: "Quitar Chile" })
    expect(quitar).toHaveClass(...tagRemoveClassName.md.split(" "))
    expect(chip).toHaveClass("overflow-visible")
    await userEvent.click(quitar)
    expect(onValueChange).toHaveBeenLastCalledWith(["Uruguay"], expect.anything())
  })
})

describe("Autocomplete", () => {
  function CityAutocomplete({ onValueChange }: { onValueChange?: (value: string) => void }) {
    return (
      <Autocomplete items={["Rosario", "Roldán", "Rafaela", "Córdoba"]} onValueChange={onValueChange}>
        <AutocompleteInput aria-label="Ciudad" placeholder="Ciudad" />
        <AutocompleteContent>
          <AutocompleteEmpty />
          <AutocompleteList>
            {(city: string) => (
              <AutocompleteItem key={city} value={city}>
                {city}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    )
  }

  it("texto libre con sugerencias: filtra, Enter completa y un texto que no está en la lista vale", async () => {
    const onValueChange = vi.fn()
    render(<CityAutocomplete onValueChange={onValueChange} />)
    const input = screen.getByRole("combobox", { name: "Ciudad" })
    expect(input.closest("[data-slot=autocomplete-input-group]")).toHaveClass("has-[input:focus]:focus-border", "data-[size=md]:h-10")
    await userEvent.click(input)
    await userEvent.keyboard("ro")
    const listbox = await screen.findByRole("listbox")
    await waitFor(() => expect(within(listbox).getAllByRole("option").map((o) => o.textContent)).toEqual(["Rosario", "Roldán"]))
    expect(within(listbox).getByRole("option", { name: "Rosario" })).toHaveClass(...classesOf(menuItemClassName))
    await userEvent.keyboard("{ArrowDown}{Enter}")
    await waitFor(() => expect(input).toHaveValue("Rosario"))
    await userEvent.clear(input)
    await userEvent.keyboard("Villa Gobernador Gálvez")
    expect(input).toHaveValue("Villa Gobernador Gálvez")
    expect(onValueChange).toHaveBeenLastCalledWith("Villa Gobernador Gálvez", expect.anything())
    expect(await screen.findByText("Sin resultados")).toBeInTheDocument()
  })
})

describe("SSR", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  function Form() {
    return (
      <>
        <CountryCombobox />
        <Combobox items={COUNTRIES} multiple defaultValue={["Chile"]}>
          <ComboboxChips>
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput aria-label="Países" />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
        </Combobox>
        <Autocomplete items={["Rosario"]}>
          <AutocompleteInput aria-label="Ciudad" />
        </Autocomplete>
      </>
    )
  }

  it("hidrata sin mismatch y conserva los ids", async () => {
    const container = document.createElement("div")
    container.innerHTML = renderToString(<Form />)
    document.body.append(container)
    const before = container.innerHTML
    expect(before).toContain('role="combobox"')
    const errors = vi.spyOn(console, "error").mockImplementation(() => {})
    const recoverable = vi.fn()
    await act(async () => {
      hydrateRoot(container, <Form />, { onRecoverableError: recoverable })
    })
    expect(recoverable).not.toHaveBeenCalled()
    expect(errors.mock.calls.filter(([message]) => /hydrat|did not match/i.test(String(message)))).toEqual([])
    const ids = (html: string) => [...html.matchAll(/\s(?:id|aria-labelledby|aria-controls|for)="([^"]+)"/g)].map((m) => m[1])
    // Un solo role="combobox" por control y ningún id repetido ya en el HTML del server.
    expect(before.match(/role="combobox"/g)).toHaveLength(3)
    const serverIds = ids(before).filter((_, i, all) => all.indexOf(all[i]!) === i)
    expect([...before.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])).toEqual([...new Set([...before.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))])
    expect(serverIds.length).toBeGreaterThan(0)
    expect(ids(container.innerHTML)).toEqual(ids(before))
  })
})
