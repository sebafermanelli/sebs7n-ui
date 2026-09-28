import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { toast } from "sonner"
import { describe, expect, it, vi } from "vitest"

import { tooltipSurfaceClassName } from "../../src/variants/overlay"

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
import { Popover, PopoverContent, PopoverTrigger } from "../../src/components/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/select"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../../src/components/sheet"
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
  it("ítems de 24px con el resaltado en acento sólido; destructivo en rojo", async () => {
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
    expect(edit).toHaveClass("h-6", "rounded-control", "data-highlighted:bg-selection", "data-highlighted:text-on-selection", "active:bg-selection", "data-disabled:text-gray-700", "data-disabled:data-highlighted:bg-transparent")
    expect(screen.getByRole("menuitem", { name: "Eliminar" })).toHaveClass("data-[variant=destructive]:data-highlighted:not-data-disabled:bg-red-800")
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
    expect(await screen.findByText("Viaje")).toHaveClass("text-callout", "text-gray-900")
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

  it("va de punta a punta: sin esquinas redondeadas contra el borde de la pantalla", async () => {
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Abrir</SheetTrigger>
        <SheetContent side="bottom">
          <SheetTitle>Acciones</SheetTitle>
        </SheetContent>
      </Sheet>
    )
    await userEvent.click(screen.getByRole("button", { name: "Abrir" }))
    expect((await screen.findByRole("dialog")).className).not.toMatch(/rounded-(t|b|l|r)-/)
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
