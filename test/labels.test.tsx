import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Combobox, ComboboxChip, ComboboxChips, ComboboxInput } from "../src/components/combobox.js"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../src/components/dialog.js"
import { NumberField } from "../src/components/number-field.js"
import { defaultLabels, LabelsProvider } from "../src/lib/labels.js"

/**
 * El «Cerrar» de Dialog, Sheet y Drawer era el único texto del paquete que no se
 * podía cambiar de ninguna forma. Ahora hay dos caminos y el orden entre ellos
 * importa: el provider traduce toda la app, la prop `labels` es la excepción de
 * una pantalla.
 */
describe("LabelsProvider", () => {
  it("traduce el botón de cerrar de Dialog, que antes no tenía forma de cambiarse", async () => {
    render(
      <LabelsProvider value={{ dialog: { close: "Close" } }}>
        <Dialog>
          <DialogTrigger>Abrir</DialogTrigger>
          <DialogContent>
            <DialogTitle>Borrar la factura</DialogTitle>
          </DialogContent>
        </Dialog>
      </LabelsProvider>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(await screen.findByRole("button", { name: "Close" })).toBeInTheDocument()
  })

  it("la prop `labels` le gana al provider: es la excepción, no la traducción", async () => {
    render(
      <LabelsProvider value={{ dialog: { close: "Close" } }}>
        <Dialog>
          <DialogTrigger>Abrir</DialogTrigger>
          <DialogContent labels={{ close: "Descartar el borrador" }}>
            <DialogTitle>Borrador</DialogTitle>
          </DialogContent>
        </Dialog>
      </LabelsProvider>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect(await screen.findByRole("button", { name: "Descartar el borrador" })).toBeInTheDocument()
  })

  it("traducir una clave de un grupo deja las otras en su idioma", () => {
    render(
      <LabelsProvider value={{ numberField: { increment: "Increase" } }}>
        <NumberField aria-label="Cantidad" />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: defaultLabels.numberField.decrement })).toBeInTheDocument()
  })

  it("un provider adentro de otro se suma, no reemplaza", () => {
    render(
      <LabelsProvider value={{ numberField: { increment: "Increase" } }}>
        <LabelsProvider value={{ numberField: { decrement: "Decrease" } }}>
          <NumberField aria-label="Cantidad" />
        </LabelsProvider>
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Increase" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Decrease" })).toBeInTheDocument()
  })

  it("sin provider, todo sigue en español", () => {
    render(<NumberField aria-label="Cantidad" />)
    expect(screen.getByRole("button", { name: "Aumentar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Disminuir" })).toBeInTheDocument()
  })

  it("el prefijo de quitar un chip sale del provider", () => {
    render(
      <LabelsProvider value={{ combobox: { remove: "Remove" } }}>
        <Combobox multiple defaultValue={["Chile"]} items={["Chile", "Uruguay"]}>
          <ComboboxChips>
            <ComboboxChip>Chile</ComboboxChip>
            <ComboboxInput aria-label="Países" />
          </ComboboxChips>
        </Combobox>
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Remove Chile" })).toBeInTheDocument()
  })

  // Sin esto, armar una traducción con `{ ...defaultLabels, ...en }` no serviría
  // de nada: TypeScript no podría marcar lo que falta.
  it("defaultLabels trae todos los grupos con todas sus claves", () => {
    expect(Object.keys(defaultLabels).sort()).toEqual([
      "appShell",
      "autocomplete",
      "combobox",
      "dialog",
      "drawer",
      "numberField",
      "sheet",
      "sidebar",
      "themeSwitcher",
      "userMenu",
    ])
    for (const grupo of Object.values(defaultLabels)) {
      for (const texto of Object.values(grupo)) expect(texto).not.toBe("")
    }
  })
})
