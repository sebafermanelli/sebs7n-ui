import { readFileSync } from "node:fs"

import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { describe, expect, it, onTestFinished, vi } from "vitest"

import { floatingSheetGapClassName, overlayCloseClassName, tooltipSurfaceClassName } from "../../src/variants/overlay"

import { Button } from "../../src/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../src/components/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../src/components/dropdown-menu"
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "../../src/components/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../src/components/select"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "../../src/components/sheet"
import { Toaster } from "../../src/components/sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../src/components/tooltip"

describe("Tooltip", () => {
  it("aparece al enfocar el trigger, de vidrio denso", async () => {
    render(
      <TooltipProvider delay={0}>
        <Tooltip>
          <TooltipTrigger render={<Button />}>Copiar</TooltipTrigger>
          <TooltipContent>Copiar al portapapeles</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    await userEvent.tab()
    const tip = await screen.findByText("Copiar al portapapeles")
    expect(tip.closest("[data-slot=tooltip-content]")).toHaveClass("material-popover", "text-gray-1000", "shadow-tooltip", "rounded-control")
    // En claro el vidrio denso es casi blanco: sobre una página blanca, sin un filo no se separa.
    expect(tip.closest("[data-slot=tooltip-content]")).toHaveClass("border", "border-gray-alpha-400")
    for (const clase of tooltipSurfaceClassName.split(" ")) expect(tip.closest("[data-slot=tooltip-content]")).toHaveClass(clase)
  })
})

describe("Popover", () => {
  it("abre con click, panel con shadow-menu y sin border", async () => {
    render(
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Filtros</PopoverTrigger>
        <PopoverContent>contenido</PopoverContent>
      </Popover>
    )
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    const panel = (await screen.findByText("contenido")).closest("[data-slot=popover-content]")!
    expect(panel).toHaveClass("shadow-menu", "rounded-surface", "material-popover")
    expect(panel.className).not.toMatch(/\bborder\b/)
  })

  // Un popover de solo texto no tiene nada tabulable adentro, así que Base UI
  // enfoca el popup mismo. Con `outline-none` y sin reemplazo eso era foco
  // invisible (WCAG 2.4.7).
  it("el panel enfocado tiene anillo, no outline-none pelado", async () => {
    render(
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>Filtros</PopoverTrigger>
        <PopoverContent>contenido</PopoverContent>
      </Popover>
    )
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }))
    const panel = (await screen.findByText("contenido")).closest<HTMLElement>("[data-slot=popover-content]")!
    expect(panel).toHaveClass("focus-visible:focus-ring")
    await waitFor(() => expect(panel).toHaveFocus())
  })
})

describe("DropdownMenu", () => {
  it("ítems de 24px con el resaltado en acento sólido; el destructivo, igual que los demás", async () => {
    const onClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Acciones</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onClick}>Editar</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    await userEvent.click(screen.getByRole("button", { name: "Acciones" }))
    const edit = await screen.findByRole("menuitem", { name: "Editar" })
    expect(edit).toHaveClass("h-6", "rounded-menu-item", "data-highlighted:bg-selection", "data-highlighted:text-on-selection", "active:bg-selection", "data-disabled:text-gray-700", "data-disabled:data-highlighted:bg-transparent")
    // Como el «Eliminar» de Mail: texto común, y resaltado en el mismo acento. El peligro lo
    // muestra la alerta que confirma, no el ítem.
    const eliminar = screen.getByRole("menuitem", { name: "Eliminar" })
    expect(eliminar.className).not.toMatch(/red|error/)
    expect(eliminar.className).toBe(edit.className)
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toHaveAttribute("data-variant", "destructive")
    await userEvent.click(edit)
    expect(onClick).toHaveBeenCalled()
  })
  it("el label de grupo va dentro de DropdownMenuGroup (Base UI lo exige)", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>Más</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Viaje</DropdownMenuLabel>
            <DropdownMenuItem>Editar</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    await userEvent.click(screen.getByRole("button", { name: "Más" }))
    expect(await screen.findByText("Viaje")).toHaveClass("text-callout", "font-semibold", "text-gray-900")
  })
})

describe("Select", () => {
  it("elige una opción y el trigger comparte estados con Input", async () => {
    const onValueChange = vi.fn()
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger aria-label="Moneda">
          <SelectValue placeholder="Elegí" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ars">ARS</SelectItem>
          <SelectItem value="usd">USD</SelectItem>
        </SelectContent>
      </Select>
    )
    const trigger = screen.getByRole("combobox", { name: "Moneda" })
    expect(trigger).toHaveClass("border-gray-alpha-400", "hover:border-gray-alpha-500", "focus-visible:focus-border", "data-placeholder:text-gray-900", "data-[size=md]:h-8")
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole("option", { name: "USD" }))
    expect(onValueChange).toHaveBeenCalledWith("usd", expect.anything())
  })

  it("macOS (2.0): el tilde de la opción elegida va a la izquierda y todas reservan la canaleta", async () => {
    render(
      <Select defaultValue="ars" defaultOpen items={{ ars: "Pesos", usd: "Dólares" }}>
        <SelectTrigger aria-label="Moneda">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Monedas</SelectLabel>
            <SelectItem value="ars">Pesos</SelectItem>
            <SelectItem value="usd">Dólares</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    const elegida = await screen.findByRole("option", { name: "Pesos" })
    const otra = screen.getByRole("option", { name: "Dólares" })
    expect(elegida).toHaveClass("pl-7")
    expect(otra).toHaveClass("pl-7")
    expect(elegida.className).not.toMatch(/\bpr-8\b/)
    expect(elegida.querySelector("[data-slot=select-item-indicator]")).toHaveClass("left-2")
    // El título alinea con el texto de las opciones, no con el tilde.
    expect(screen.getByText("Monedas")).toHaveClass("pl-7")
  })
})

describe("Select como pop-up button de macOS (2.0)", () => {
  function Moneda({ alignItemWithTrigger }: { alignItemWithTrigger?: boolean }) {
    return (
      <Select defaultValue="ars" items={[{ value: "ars", label: "Pesos" }, { value: "usd", label: "Dólares" }]}>
        <SelectTrigger aria-label="Moneda">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
          <SelectItem value="ars">Pesos</SelectItem>
          <SelectItem value="usd">Dólares</SelectItem>
        </SelectContent>
      </Select>
    )
  }

  it("el disparador es el pop-up button de macOS: flechas arriba y abajo", () => {
    const { container } = render(<Moneda />)
    const icono = container.querySelector("svg.lucide-chevrons-up-down")
    expect(icono).toBeInTheDocument()
    expect(icono).toHaveClass("size-3.5", "text-gray-900")
    expect(container.querySelector("svg.lucide-chevron-down")).toBeNull()
  })

  it("la lista se abre con la opción elegida encima del disparador", async () => {
    // jsdom mide todo en 0, y con el disparador pegado al borde de la ventana Base UI cae al modo
    // menú (lo mismo que haría en un navegador). Se lo ubica en el medio de una ventana de 800.
    const alto = vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(800)
    const ancho = vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1200)
    const original = HTMLElement.prototype.getBoundingClientRect
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      return this.dataset.slot === "select-trigger" ? new DOMRect(100, 300, 240, 32) : original.call(this)
    })
    onTestFinished(() => {
      alto.mockRestore()
      ancho.mockRestore()
      rect.mockRestore()
    })
    render(<Moneda />)
    await userEvent.click(screen.getByRole("combobox", { name: "Moneda" }))
    const lista = await screen.findByRole("listbox")
    // Base UI marca `data-side="none"` cuando `alignItemWithTrigger` está activo: no hay lado,
    // la lista se superpone al disparador.
    expect(lista.closest("[data-side]")).toHaveAttribute("data-side", "none")
    expect(lista.closest("[data-slot=select-content]")).toHaveClass("min-w-(--anchor-width)")
  })

  it("el scroll es de la lista y no del panel: Base UI desplaza la lista para alinear la elegida", async () => {
    render(<Moneda />)
    await userEvent.click(screen.getByRole("combobox", { name: "Moneda" }))
    const lista = await screen.findByRole("listbox")
    const panel = lista.closest("[data-slot=select-content]")!
    expect(lista).toHaveAttribute("data-slot", "select-list")
    expect(lista).toHaveClass("overflow-y-auto", "max-h-(--available-height)", "scroll-py-6", "p-1.5")
    expect(panel).toHaveClass("overflow-hidden", "p-0")
    expect(panel.className).not.toMatch(/overflow-y-auto/)
  })

  it("un px-* de la app no se come la canaleta de las opciones", async () => {
    render(
      <Select defaultOpen defaultValue="ars" items={{ ars: "Pesos" }}>
        <SelectTrigger aria-label="Moneda">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel className="px-3">Monedas</SelectLabel>
            <SelectItem className="px-3" value="ars">
              Pesos
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    expect(await screen.findByRole("option", { name: "Pesos" })).toHaveClass("px-3", "pl-7")
    expect(screen.getByText("Monedas")).toHaveClass("px-3", "pl-7")
  })

  it("con alignItemWithTrigger={false} vuelve a bajar como un menú", async () => {
    render(<Moneda alignItemWithTrigger={false} />)
    await userEvent.click(screen.getByRole("combobox", { name: "Moneda" }))
    const lista = await screen.findByRole("listbox")
    expect(lista.closest("[data-side]")).toHaveAttribute("data-side", "bottom")
  })
})

describe("Dialog", () => {
  it("abre, tiene shadow-modal y se cierra con el botón Cerrar", async () => {
    render(
      <Dialog>
        <DialogTrigger render={<Button />}>Nuevo viaje</DialogTrigger>
        <DialogContent>
          <DialogTitle>Nuevo viaje</DialogTitle>
          <DialogDescription>Cargá los datos.</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    await userEvent.click(screen.getByRole("button", { name: "Nuevo viaje" }))
    const dialog = await screen.findByRole("dialog")
    expect(dialog).toHaveClass("shadow-modal", "rounded-panel", "p-5", "gap-4", "material-modal")
    expect(screen.getByText("Cargá los datos.")).toHaveClass("text-gray-900")
    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})

describe("hoja de macOS (2.0)", () => {
  it("el pie no tiene línea ni márgenes negativos y alinea a la derecha", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Factura 0012</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="accent">Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    const pie = (await screen.findByRole("dialog")).querySelector('[data-slot="dialog-footer"]')!
    expect(pie).not.toHaveClass("border-t")
    expect(pie.className).not.toMatch(/-mx-6/)
    expect(pie).toHaveClass("sm:justify-end")
  })

  // Mismo argumento que la alerta: invertir con CSS hace que Tab recorra al revés de como se ve
  // (WCAG 1.3.2 y 2.4.3). En mobile los botones se apilan en el orden del DOM, con 12 px para
  // que las áreas de 44 no se pisen.
  it("en mobile se apila en el orden del DOM, sin invertir, con gap-3", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Factura 0012</DialogTitle>
          <DialogFooter>
            <Button variant="secondary">Cancelar</Button>
            <Button variant="accent">Listo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    const pie = (await screen.findByRole("dialog")).querySelector('[data-slot="dialog-footer"]')!
    expect(pie).toHaveClass("flex", "flex-col", "gap-3", "sm:flex-row")
    expect(pie.className).not.toMatch(/reverse/)
  })

  it("sigue teniendo la X, a la altura del título", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Factura 0012</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    // Con `p-5` el renglón del título (20 px de alto) está centrado a 30 px del borde; la X mide
    // 24, así que va a 18 px (`4.5`) para que su centro caiga en la misma línea.
    expect(await screen.findByRole("button", { name: "Cerrar" })).toHaveClass("top-4.5", "right-4.5")
  })

  it("el título es el de una hoja: title-3", async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Factura 0012</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(await screen.findByRole("heading", { name: "Factura 0012" })).toHaveClass("text-title-3")
  })
})

describe("Sheet", () => {
  it("abre del lado pedido", async () => {
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Menú</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Navegación</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    await userEvent.click(screen.getByRole("button", { name: "Menú" }))
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-side", "left")
  })

  // 2.0: la hoja flota, como la píldora del Sidebar. 8 px de margen en cada borde que toca (o el
  // área segura, si es más grande), las cuatro esquinas con el radio del panel, y al cerrar sale
  // entera: el desplazamiento suma el margen, o quedaba una franja de 8 px asomada.
  it.each([
    ["right", ["top-(--sheet-gap-t)", "bottom-(--sheet-gap-b)", "right-(--sheet-gap-r)"], "translate-x-[calc(100%+var(--sheet-gap-r))]"],
    ["left", ["top-(--sheet-gap-t)", "bottom-(--sheet-gap-b)", "left-(--sheet-gap-l)"], "-translate-x-[calc(100%+var(--sheet-gap-l))]"],
    ["top", ["top-(--sheet-gap-t)", "left-(--sheet-gap-l)", "right-(--sheet-gap-r)"], "-translate-y-[calc(100%+var(--sheet-gap-t))]"],
    ["bottom", ["bottom-(--sheet-gap-b)", "left-(--sheet-gap-l)", "right-(--sheet-gap-r)"], "translate-y-[calc(100%+var(--sheet-gap-b))]"],
  ] as const)("flota del lado %s: margen, las cuatro esquinas redondeadas y sale entera", async (side, bordes, fuera) => {
    render(
      <Sheet defaultOpen>
        <SheetContent side={side}>
          <SheetTitle>Acciones</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    const hoja = await screen.findByRole("dialog")
    expect(hoja).toHaveClass("rounded-panel", "shadow-modal", ...floatingSheetGapClassName.split(" "))
    for (const borde of bordes) expect(hoja).toHaveClass(`data-[side=${side}]:${borde}`)
    expect(hoja).toHaveClass(`data-[side=${side}]:data-starting-style:${fuera}`, `data-[side=${side}]:data-ending-style:${fuera}`)
    expect(hoja.className).not.toMatch(/rounded-(t|b|l|r)-|inset-(x|y)-0|(top|bottom|left|right)-0(\s|$)|translate-(x|y)-full/)
  })
})

describe("Hojas flotantes: el margen y la X", () => {
  it("el margen es 8 px o el área segura, lo que sea más grande, en los cuatro bordes", () => {
    for (const [lado, env] of [["t", "top"], ["r", "right"], ["b", "bottom"], ["l", "left"]]) {
      expect(floatingSheetGapClassName).toContain(`[--sheet-gap-${lado}:max(--spacing(2),env(safe-area-inset-${env}))]`)
    }
  })

  // La X sigue en la línea del título (`overlayCloseClassName`), pero ahora la esquina de la hoja
  // es curva: su caja, con los 4 px del anillo de foco, tiene que quedar adentro del arco del
  // radio del panel, o el anillo se corta contra la curva.
  it("la X, con su anillo de foco, queda adentro de la esquina redondeada", () => {
    const radio = Number(/--radius-panel:\s*(\d+)px;/.exec(readFileSync("src/styles/theme.css", "utf8"))![1])
    const inset = Number(/top-([\d.]+)/.exec(overlayCloseClassName)![1]) * 4
    expect(overlayCloseClassName).toContain(`right-${inset / 4}`)
    const esquina = inset - 4
    expect(Math.hypot(radio - esquina, radio - esquina)).toBeLessThanOrEqual(radio)
  })

  it("la X es hija de la hoja, que es la que la posiciona", async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Filtrar facturas</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    const hoja = await screen.findByRole("dialog")
    const x = screen.getByRole("button", { name: "Cerrar" })
    expect(x.parentElement).toBe(hoja)
    expect(x).toHaveClass(...overlayCloseClassName.split(" "))
    expect(hoja).toHaveClass("fixed")
  })
})

describe("Sheet, Popover al estilo macOS (2.0)", () => {
  it("Sheet: header con el padding de la hoja, título title-3 y pie sin línea", async () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtrar facturas</SheetTitle>
          </SheetHeader>
          <SheetFooter>
            <Button variant="accent">Aplicar</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
    const hoja = await screen.findByRole("dialog")
    expect(hoja.querySelector("[data-slot=sheet-header]")).toHaveClass("p-5")
    expect(screen.getByRole("heading", { name: "Filtrar facturas" })).toHaveClass("text-title-3")
    const pie = hoja.querySelector("[data-slot=sheet-footer]")!
    expect(pie).toHaveClass("p-5", "gap-3")
    expect(pie).not.toHaveClass("border-t")
    // La X, en la línea del título: la misma posición que en Dialog.
    expect(screen.getByRole("button", { name: "Cerrar" })).toHaveClass("top-4.5", "right-4.5")
  })

  it("Popover: más angosto y con menos aire, como un popover de macOS; título headline", async () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger render={<Button variant="outline" />}>Filtros</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Rango</PopoverTitle>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
    )
    const panel = (await screen.findByText("Rango")).closest("[data-slot=popover-content]")!
    expect(panel).toHaveClass("w-64", "p-3", "gap-2", "text-callout")
    expect(panel).not.toHaveClass("w-72", "p-4")
    expect(screen.getByText("Rango")).toHaveClass("text-headline")
  })
})

describe("Sheet foco", () => {
  it("atrapa el foco adentro y lo devuelve al trigger al cerrar", async () => {
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Filtros</SheetTrigger>
        <SheetContent>
          <SheetTitle>Filtros</SheetTitle>
          <Button>Aplicar</Button>
        </SheetContent>
      </Sheet>
    )
    const trigger = screen.getByRole("button", { name: "Filtros" })
    await userEvent.click(trigger)
    const sheet = await screen.findByRole("dialog")
    await waitFor(() => expect(sheet).toContainElement(document.activeElement as HTMLElement))
    for (let i = 0; i < 4; i++) {
      await userEvent.tab()
      // Base UI usa focus guards: el foco puede pasar un instante por el guard antes de volver adentro.
      await waitFor(() => expect(sheet).toContainElement(document.activeElement as HTMLElement))
    }
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger).toHaveFocus()
  })
})

describe("Toaster", () => {
  it("se monta sin ThemeProvider", () => {
    const { container } = render(<Toaster />)
    expect(container.querySelector("section")).not.toBeNull()
  })

  // El test de antes era `expect(container).toBeTruthy()`, que pasa aunque el Toaster no
  // renderice nada. Lo que importa es que un `toast()` llegue a la pantalla y que se anuncie
  // sin interrumpir: Sonner no usa `role="status"` sino la región `aria-live="polite"` que
  // monta el Toaster, que es el mismo contrato escrito de la otra forma. Lo que no puede
  // pasar es que sea `assertive`: un toast corta lo que el lector esté diciendo y casi
  // nunca es tan urgente.
  it("toast() aparece dentro de una región viva que no interrumpe", async () => {
    render(<Toaster />)

    act(() => {
      toast("Factura enviada")
    })

    const aviso = await screen.findByText("Factura enviada")
    const region = aviso.closest("[aria-live]")!
    expect(region).toHaveAttribute("aria-live", "polite")
    expect(aviso.closest("[data-sonner-toast]")).not.toBeNull()
  })

  it("toast.success trae el ícono verde del sistema, oculto al lector", async () => {
    render(<Toaster />)

    act(() => {
      toast.success("Listo")
    })

    const aviso = await screen.findByText("Listo")
    const fila = aviso.closest("[data-sonner-toast]")!
    const icono = fila.querySelector("svg")!
    expect(icono).toHaveClass("text-green-900")
    expect(icono).toHaveAttribute("aria-hidden", "true")
  })
})
