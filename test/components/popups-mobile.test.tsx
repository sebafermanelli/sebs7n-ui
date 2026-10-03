import { readFileSync } from "node:fs"

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Button } from "../../src/components/button"
import { ColorPicker } from "../../src/components/color-picker"
import { DatePicker } from "../../src/components/date-picker"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "../../src/components/popover"
import { lateralCollision } from "../../src/internal/collision"
import { floatingPopupClassName } from "../../src/variants/overlay"
import { menuPopupClassName } from "../../src/variants/menu"

/**
 * Los popups de contenido en una pantalla angosta (< 40rem, el `sm` de Tailwind) se presentan como
 * la hoja de abajo (`Drawer`), como el popover de iOS en ancho compacto. Lo que se prueba acá es el
 * contrato: misma API, otro contenedor, y el teclado, el foco y el nombre funcionando igual.
 *
 * El gesto de arrastrar y la posición real no se pueden probar en jsdom (no hay layout): se miran
 * en el navegador a 320, 390 y 768 px.
 */

const original = window.matchMedia
function viewport(compacto: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: compacto && /max-width/.test(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
afterEach(() => {
  window.matchMedia = original
})

function Avisos(props: { mobile?: "drawer" | "popover"; conTitulo?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <Popover mobile={props.mobile} onOpenChange={props.onOpenChange}>
      <PopoverTrigger render={<Button variant="secondary" />}>Avisos</PopoverTrigger>
      <PopoverContent className="w-80" side="right">
        {props.conTitulo !== false && (
          <PopoverHeader>
            <PopoverTitle>Últimos avisos</PopoverTitle>
            <PopoverDescription>Lo que pasó con las facturas.</PopoverDescription>
          </PopoverHeader>
        )}
        <button type="button">Factura 0012 vencida</button>
      </PopoverContent>
    </Popover>
  )
}

describe("Popover en pantalla angosta", () => {
  beforeEach(() => viewport(true))

  it("se abre como la hoja de abajo, modal, con el título como nombre", async () => {
    const onOpenChange = vi.fn()
    render(<Avisos onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole("button", { name: "Avisos" })
    await userEvent.click(trigger)
    const hoja = await screen.findByRole("dialog", { name: "Últimos avisos" })
    expect(hoja).toHaveAttribute("data-swipe-direction", "down")
    expect(hoja).toHaveAccessibleDescription("Lo que pasó con las facturas.")
    // El ancho del popover no viaja a la hoja: la hoja ocupa el ancho de la pantalla.
    expect(hoja.querySelector("[data-slot=popover-content]")).not.toHaveClass("w-80")
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(onOpenChange).toHaveBeenLastCalledWith(true, expect.anything())
    // La X visible: arrastrar no es la única forma de cerrar.
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument()
  })

  it("Escape cierra y el foco vuelve al disparador", async () => {
    const onOpenChange = vi.fn()
    render(<Avisos onOpenChange={onOpenChange} />)
    const trigger = screen.getByRole("button", { name: "Avisos" })
    await userEvent.click(trigger)
    await screen.findByRole("dialog")
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
    await waitFor(() => expect(trigger).toHaveFocus())
    expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  it("sin PopoverTitle, la hoja se llama como el disparador", async () => {
    render(<Avisos conTitulo={false} />)
    await userEvent.click(screen.getByRole("button", { name: "Avisos" }))
    expect(await screen.findByRole("dialog", { name: "Avisos" })).toBeInTheDocument()
  })

  it('`mobile="popover"` lo deja anclado', async () => {
    render(<Avisos mobile="popover" />)
    await userEvent.click(screen.getByRole("button", { name: "Avisos" }))
    const panel = (await screen.findByText("Factura 0012 vencida")).closest("[data-slot=popover-content]")!
    expect(panel).not.toHaveAttribute("data-swipe-direction")
    expect(panel).toHaveClass("w-80")
  })

  it("DatePicker: el calendario en la hoja, y elegir un día la cierra", async () => {
    const onValueChange = vi.fn()
    render(<DatePicker aria-label="Vencimiento" defaultValue={new Date(2026, 8, 10)} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    const hoja = await screen.findByRole("dialog", { name: "Calendario" })
    expect(hoja).toHaveAttribute("data-swipe-direction", "down")
    await userEvent.click(screen.getByRole("button", { name: /15/ }))
    expect(onValueChange).toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  })

  it("ColorPicker: el panel en la hoja", async () => {
    render(<ColorPicker aria-label="Color de marca" />)
    await userEvent.click(screen.getByRole("button", { name: "Color de marca" }))
    const hoja = await screen.findByRole("dialog", { name: "Selector de color" })
    expect(hoja).toHaveAttribute("data-swipe-direction", "down")
    expect(screen.getByRole("tablist")).toBeInTheDocument()
  })
})

describe("Popover en pantalla ancha", () => {
  beforeEach(() => viewport(false))

  it("sigue siendo el popover anclado, sin hoja", async () => {
    render(<Avisos />)
    await userEvent.click(screen.getByRole("button", { name: "Avisos" }))
    const panel = (await screen.findByText("Factura 0012 vencida")).closest("[data-slot=popover-content]")!
    expect(panel).not.toHaveAttribute("data-swipe-direction")
    expect(panel).toHaveClass("w-80")
  })
})

describe("La hoja no pesa en desktop", () => {
  it("popover, date-picker y color-picker no importan el Drawer: se pide con import() en angosto", () => {
    for (const archivo of ["components/popover", "components/date-picker", "components/color-picker", "internal/adaptive-popover"]) {
      const fuente = readFileSync(`src/${archivo}.tsx`, "utf8")
      expect(fuente, archivo).not.toMatch(/from "@base-ui\/react\/drawer"|from "\.\.\/components\/drawer\.js"|from "\.\/drawer\.js"/)
    }
    expect(readFileSync("src/internal/adaptive-popover.tsx", "utf8")).toContain('import("../internal/adaptive-drawer.js")')
  })
})

describe("Ningún popup se sale de la pantalla", () => {
  it("popover, hover card y menús no pasan del espacio que queda (--available-*)", () => {
    for (const clase of [floatingPopupClassName, menuPopupClassName]) {
      expect(clase).toContain("max-w-(--available-width)")
      expect(clase).toContain("max-h-(--available-height)")
    }
  })

  it("el tooltip también, sin perder su tope de 20rem", () => {
    const fuente = readFileSync("src/components/tooltip.tsx", "utf8")
    expect(fuente).toContain("max-w-[min(20rem,var(--available-width))]")
  })

  it("un menú al costado puede caer arriba o abajo si al costado no entra", () => {
    // El caso del sidebar en el Sheet mobile: a la derecha del ítem no queda lugar.
    expect(lateralCollision("right")).toEqual({ fallbackAxisSide: "end" })
    expect(lateralCollision("inline-start")).toEqual({ fallbackAxisSide: "end" })
    // Arriba o abajo se queda como Base UI: un menú largo scrollea antes que irse al costado.
    expect(lateralCollision("bottom")).toBeUndefined()
    expect(lateralCollision(undefined)).toBeUndefined()
  })

  it("todos los posicionadores dejan 8 px contra el borde", () => {
    const archivos = ["internal/adaptive-popover", ...["dropdown-menu", "context-menu", "menubar", "select", "combobox", "hover-card", "tooltip"].map((c) => `components/${c}`)]
    for (const archivo of archivos) {
      const fuente = readFileSync(`src/${archivo}.tsx`, "utf8")
      // El popover adaptable lo deja configurable (`collisionPadding`), con 8 de default.
      expect(fuente, archivo).toMatch(archivo === "internal/adaptive-popover" ? /collisionPadding = 8/ : /collisionPadding=\{8\}/)
    }
  })
})
