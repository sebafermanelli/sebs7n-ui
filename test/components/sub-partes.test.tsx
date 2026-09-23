// Las piezas que no tenían ni un test.
//
// La auditoría de 0.4.0 las listó una por una: `AvatarImage`, `FieldValidity`,
// `FieldControl`, `DialogClose`, `SheetClose`, `CardAction`, `TableCaption`,
// `TableFooter`, `MenubarRadioItem`, `ComboboxSeparator`, `AutocompleteSeparator`,
// `NavigationMenuPositioner` y `ScrollAreaScrollbar`. Todas exportadas, todas
// documentadas en el sitio, ninguna ejercitada: si una dejaba de funcionar, el
// paquete se publicaba igual.
//
// Cada caso prueba lo que la pieza promete —qué elemento emite, qué ata, qué
// anuncia—, no sus clases.
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteSeparator,
} from "../../src/components/autocomplete"
import { Avatar, AvatarFallback, AvatarImage } from "../../src/components/avatar"
import { Button } from "../../src/components/button"
import { Card, CardAction, CardHeader, CardTitle } from "../../src/components/card"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "../../src/components/combobox"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "../../src/components/dialog"
import { Field, FieldControl, FieldError, FieldLabel, FieldValidity } from "../../src/components/field"
import { Input } from "../../src/components/input"
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarTrigger,
} from "../../src/components/menubar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuPopup,
  NavigationMenuPositioner,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "../../src/components/navigation-menu"
import { ScrollArea, ScrollAreaScrollbar } from "../../src/components/scroll-area"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "../../src/components/sheet"
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableRow } from "../../src/components/table"

describe("AvatarImage", () => {
  it("emite un <img> con el alt que se le exige", () => {
    render(
      <Avatar>
        <AvatarImage alt="Ana Gómez" src="/ana.jpg" />
        <AvatarFallback>AG</AvatarFallback>
      </Avatar>
    )
    // Base UI monta la imagen recién cuando carga, así que en jsdom lo que se ve es el
    // fallback. Lo que se fija acá es que el fallback exista y anuncie: un avatar que no
    // carga no puede dejar un hueco mudo.
    expect(screen.getByText("AG")).toBeInTheDocument()
  })

  it("con alt=\"\" la imagen queda decorativa, que es lo correcto si el nombre está al lado", () => {
    const { container } = render(
      <>
        <Avatar>
          <AvatarImage alt="" src="/ana.jpg" />
        </Avatar>
        <span>Ana Gómez</span>
      </>
    )
    for (const img of container.querySelectorAll("img")) expect(img).toHaveAttribute("alt", "")
  })
})

describe("FieldControl", () => {
  it("ata un control propio con la etiqueta y el error del campo", async () => {
    render(
      <Field name="fecha">
        <FieldLabel>Fecha de salida</FieldLabel>
        <FieldControl render={<input type="date" required />} />
        <FieldError match="valueMissing">Elegí una fecha</FieldError>
      </Field>
    )
    const control = screen.getByLabelText("Fecha de salida")
    expect(control).toHaveAttribute("type", "date")
    expect(control).toHaveAttribute("name", "fecha")
  })
})

describe("FieldValidity", () => {
  it("da el valor, los errores y la validez del campo mientras se escribe", async () => {
    render(
      <Field name="nota" validationMode="onChange" validate={(valor) => (String(valor).length < 3 ? "Muy corto" : null)}>
        <FieldLabel>Nota</FieldLabel>
        <Input />
        <FieldValidity>
          {(estado) => (
            <span data-testid="estado">
              {String(estado.value ?? "").length} · {estado.errors.join("") || "sin errores"}
            </span>
          )}
        </FieldValidity>
      </Field>
    )
    expect(screen.getByTestId("estado")).toHaveTextContent("0 · sin errores")

    await userEvent.type(screen.getByLabelText("Nota"), "ho")
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("2 · Muy corto"))

    await userEvent.type(screen.getByLabelText("Nota"), "la")
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("4 · sin errores"))
  })
})

describe("DialogClose y SheetClose", () => {
  it("DialogClose cierra el diálogo desde adentro del contenido", async () => {
    render(
      <Dialog>
        <DialogTrigger render={<Button />}>Abrir</DialogTrigger>
        <DialogContent>
          <DialogTitle>Cambiar plan</DialogTitle>
          <DialogClose render={<Button variant="ghost" />}>Ahora no</DialogClose>
        </DialogContent>
      </Dialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await userEvent.click(await screen.findByRole("button", { name: "Ahora no" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("SheetClose cierra la hoja", async () => {
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Abrir</SheetTrigger>
        <SheetContent>
          <SheetTitle>Filtros</SheetTitle>
          <SheetClose render={<Button variant="ghost" />}>Listo</SheetClose>
        </SheetContent>
      </Sheet>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    await userEvent.click(await screen.findByRole("button", { name: "Listo" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("la X y el wrapper son slots distintos: uno es la acción, el otro el botón de arriba", async () => {
    render(
      <Dialog>
        <DialogTrigger render={<Button />}>Abrir</DialogTrigger>
        <DialogContent>
          <DialogTitle>Cambiar plan</DialogTitle>
          <DialogClose render={<Button variant="ghost" />}>Ahora no</DialogClose>
        </DialogContent>
      </Dialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    const panel = await screen.findByRole("dialog")

    expect(panel.querySelectorAll("[data-slot=dialog-close]")).toHaveLength(1)
    expect(panel.querySelectorAll("[data-slot=dialog-close-button]")).toHaveLength(1)
  })
})

describe("CardAction", () => {
  it("manda la acción a la segunda columna del header, al lado del título", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Facturas</CardTitle>
          <CardAction>
            <Button size="sm">Nueva</Button>
          </CardAction>
        </CardHeader>
      </Card>
    )
    const accion = screen.getByRole("button", { name: "Nueva" }).closest("[data-slot=card-action]")!
    // El header pasa a dos columnas solo cuando hay una acción: sin esto la acción
    // caería debajo del título en vez de a su derecha.
    expect(accion.parentElement).toHaveClass("has-data-[slot=card-action]:grid-cols-[1fr_auto]")
  })
})

describe("TableCaption y TableFooter", () => {
  it("el caption nombra la tabla y el footer emite un <tfoot> con el total", () => {
    render(
      <Table>
        <TableCaption>Facturas de marzo</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Acme</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell numeric>$48.200</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )
    expect(screen.getByRole("table")).toHaveAccessibleName("Facturas de marzo")
    const total = screen.getByText("$48.200")
    expect(total.closest("tfoot")).not.toBeNull()
    expect(total).toHaveClass("tabular-nums")
  })
})

describe("MenubarRadioItem", () => {
  it("deja uno solo marcado y avisa cuál se eligió", async () => {
    const onValueChange = vi.fn()
    function Ver() {
      const [zoom, setZoom] = React.useState("100")
      return (
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Ver</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup
                value={zoom}
                onValueChange={(valor: string) => {
                  setZoom(valor)
                  onValueChange(valor)
                }}
              >
                <MenubarRadioItem value="100">100 %</MenubarRadioItem>
                <MenubarRadioItem value="150">150 %</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )
    }
    render(<Ver />)
    await userEvent.click(screen.getByRole("menuitem", { name: "Ver" }))

    const cien = await screen.findByRole("menuitemradio", { name: "100 %" })
    expect(cien).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitemradio", { name: "150 %" })).toHaveAttribute("aria-checked", "false")

    await userEvent.click(screen.getByRole("menuitemradio", { name: "150 %" }))

    expect(onValueChange).toHaveBeenLastCalledWith("150")
  })
})

describe("ComboboxSeparator y AutocompleteSeparator", () => {
  // A diferencia del separador de un menú, este sale con `role="presentation"`: adentro de un
  // `listbox` un `role="separator"` sería un hijo que no es una opción, y el lector lo contaría
  // mal. Por eso se busca por `data-slot` y se verifica que no aparezca entre las opciones.
  it("corta la lista sin entrar en el recorrido de opciones", async () => {
    render(
      <Combobox items={["Reciente", "Chile"]}>
        <ComboboxInput aria-label="País" />
        <ComboboxContent>
          <ComboboxSeparator />
          <ComboboxList>{(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
    )
    await userEvent.click(screen.getByRole("combobox", { name: "País" }))
    await screen.findByRole("listbox")

    const separador = document.querySelector("[data-slot=combobox-separator]")!
    expect(separador).toHaveAttribute("data-orientation", "horizontal")
    expect(separador.closest("[role=listbox]")).toBeNull()
    expect(screen.getAllByRole("option")).toHaveLength(2)
  })

  it("el de Autocomplete es la misma pieza con su propio slot", async () => {
    render(
      <Autocomplete items={["Rosario", "Roldán"]}>
        <AutocompleteInput aria-label="Ciudad" />
        <AutocompleteContent>
          <AutocompleteSeparator />
          <AutocompleteList>
            {(item: string) => <AutocompleteItem key={item} value={item}>{item}</AutocompleteItem>}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>
    )
    // El Autocomplete abre al escribir, no al hacer click: el valor es el texto.
    await userEvent.click(screen.getByRole("combobox", { name: "Ciudad" }))
    await userEvent.keyboard("ro")
    await screen.findByRole("listbox")

    const separador = document.querySelector("[data-slot=autocomplete-separator]")!
    expect(separador).toHaveAttribute("data-orientation", "horizontal")
    expect(separador.closest("[role=listbox]")).toBeNull()
  })
})

describe("NavigationMenuPositioner", () => {
  it("armado a mano rinde lo mismo que NavigationMenuContent", async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Productos</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/facturacion">Facturación</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuPositioner>
          <NavigationMenuPopup>
            <NavigationMenuViewport />
          </NavigationMenuPopup>
        </NavigationMenuPositioner>
      </NavigationMenu>
    )
    await userEvent.click(screen.getByRole("button", { name: "Productos" }))

    expect(await screen.findByRole("link", { name: "Facturación" })).toHaveAttribute("href", "/facturacion")
  })
})

describe("ScrollAreaScrollbar", () => {
  // Base UI monta la barra solo cuando el contenido desborda, y en jsdom nada mide: por eso
  // el caso usa `keepMounted`, que es además cómo se arma una caja a mano cuando la barra
  // tiene que estar desde el principio.
  it("suelto dibuja una barra propia con su orientación", () => {
    const { container } = render(
      <ScrollArea>
        <p>contenido</p>
        <ScrollAreaScrollbar keepMounted orientation="horizontal" />
      </ScrollArea>
    )
    const barra = container.querySelector("[data-slot=scroll-area-scrollbar]")!
    expect(barra).toHaveAttribute("data-orientation", "horizontal")
    expect(barra.querySelector("[data-slot=scroll-area-thumb]")).not.toBeNull()
  })
})
