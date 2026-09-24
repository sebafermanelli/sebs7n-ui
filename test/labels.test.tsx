import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { beforeEach, describe, expect, it } from "vitest"

import { Combobox, ComboboxChip, ComboboxChips, ComboboxInput } from "../src/components/combobox.js"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../src/components/dialog.js"
import { NumberField } from "../src/components/number-field.js"
import { PageHeader, PageHeaderTitle } from "../src/components/page-header.js"
import { defaultLabels, LabelsProvider, useLabels } from "../src/lib/labels.js"

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

  // El agujero que abrió la 0.5.0: `breadcrumbLabel` tenía default en español y era un
  // `aria-label`, así que una app traducida lo dejaba en español sin que nadie lo notara.
  it("el nombre del <nav> de las migas de PageHeader sale del provider", () => {
    render(
      <LabelsProvider value={{ pageHeader: { breadcrumb: "Breadcrumb" } }}>
        <PageHeader breadcrumb={<span>Trips</span>}>
          <PageHeaderTitle>Trips</PageHeaderTitle>
        </PageHeader>
      </LabelsProvider>
    )
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveAttribute("data-slot", "page-header-breadcrumb")
  })

  it("`breadcrumbLabel` le gana al provider, como cualquier prop `labels`", () => {
    render(
      <LabelsProvider value={{ pageHeader: { breadcrumb: "Breadcrumb" } }}>
        <PageHeader breadcrumb={<span>Trips</span>} breadcrumbLabel="Where you are">
          <PageHeaderTitle>Trips</PageHeaderTitle>
        </PageHeader>
      </LabelsProvider>
    )
    expect(screen.getByRole("navigation", { name: "Where you are" })).toBeInTheDocument()
  })

  // El caso real: el `value` lo arma un componente con i18n, así que es un objeto nuevo
  // en cada render. Si el provider memoizara contra la identidad, cada render del layout
  // re-renderizaría a todos los consumidores del contexto, que es toda la app.
  describe("memoiza contra el contenido, no contra la identidad de `value`", () => {
    let renders = 0
    const Consumidor = React.memo(function Consumidor() {
      renders += 1
      return <span>{useLabels().dialog.close}</span>
    })
    // `value` se escribe inline, como saldría de un `useTranslations()`: objeto nuevo cada vez.
    const App = ({ cerrar }: { cerrar: string }) => (
      <LabelsProvider value={{ dialog: { close: cerrar }, sheet: { close: cerrar } }}>
        <Consumidor />
      </LabelsProvider>
    )

    beforeEach(() => {
      renders = 0
    })

    it("un `value` nuevo con los mismos textos no vuelve a renderizar al consumidor", () => {
      const { rerender } = render(<App cerrar="Close" />)
      expect(renders).toBe(1)
      for (let i = 0; i < 5; i++) rerender(<App cerrar="Close" />)
      expect(renders).toBe(1)
      expect(screen.getByText("Close")).toBeInTheDocument()
    })

    it("y un texto distinto sí llega", () => {
      const { rerender } = render(<App cerrar="Close" />)
      rerender(<App cerrar="Fermer" />)
      expect(renders).toBe(2)
      expect(screen.getByText("Fermer")).toBeInTheDocument()
    })
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
      "pageHeader",
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
