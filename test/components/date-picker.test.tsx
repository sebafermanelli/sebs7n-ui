import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DatePicker } from "../../src/components/date-picker"
import { fromISODate, toISODate, type DateRange } from "../../src/lib/dates"
import { LabelsProvider } from "../../src/lib/labels"

const d = (iso: string) => fromISODate(iso)!
const dia = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!

describe("DatePicker", () => {
  it("es un botón con el cuerpo de un Input, y vacío dice qué hacer", () => {
    render(<DatePicker aria-label="Vencimiento" />)
    const campo = screen.getByRole("button", { name: "Vencimiento" })
    expect(campo).toHaveTextContent("Elegí una fecha")
    expect(campo).toHaveAttribute("data-placeholder")
    expect(campo).toHaveClass("rounded-field", "glass-control", "border-gray-alpha-400", "data-[size=md]:h-10", "px-4", "focus-visible:focus-border")
  })

  it("muestra la fecha en el idioma de la app, no en el del navegador", () => {
    render(<DatePicker aria-label="Vencimiento" defaultValue={d("2026-09-27")} />)
    const campo = screen.getByRole("button", { name: "Vencimiento" })
    expect(campo).toHaveTextContent("27 sept 2026")
    expect(campo).not.toHaveAttribute("data-placeholder")
  })

  it("abre un calendario de vidrio, elige y se cierra solo", async () => {
    const onValueChange = vi.fn()
    render(<DatePicker aria-label="Vencimiento" defaultValue={d("2026-09-27")} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    const panel = await screen.findByRole("dialog", { name: "Calendario" })
    expect(panel).toHaveClass("glass", "rounded-surface", "shadow-menu")
    await userEvent.click(dia("2026-09-15"))
    expect(toISODate(onValueChange.mock.calls[0]![0])).toBe("2026-09-15")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByRole("button", { name: "Vencimiento" })).toHaveTextContent("15 sept 2026")
  })

  it("con name, la fecha viaja en el formulario como ISO", async () => {
    const { container } = render(
      <form>
        <DatePicker aria-label="Vencimiento" defaultValue={d("2026-09-27")} name="vence" />
      </form>
    )
    expect(new FormData(container.querySelector("form")!).get("vence")).toBe("2026-09-27")
  })

  it("el panel se apila como capa propia en z-50: adentro de un Sheet o un Drawer queda encima", async () => {
    render(<DatePicker aria-label="Vencimiento" />)
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    const panel = await screen.findByRole("dialog", { name: "Calendario" })
    // El z-index va en el Positioner, que es lo que el portal posiciona. En el Popup no sirve:
    // el Positioner lleva un transform, arma su propio contexto de apilamiento en z auto y el
    // velo del Drawer (z-50) le queda encima.
    expect(panel.parentElement).toHaveClass("isolate", "z-50")
  })

  it("deshabilitado no abre", async () => {
    render(<DatePicker aria-label="Vencimiento" disabled />)
    const campo = screen.getByRole("button", { name: "Vencimiento" })
    expect(campo).toBeDisabled()
    await userEvent.click(campo)
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("no acepta required: no valida, y no finge que sí", () => {
    // @ts-expect-error `required` no existe en el tipo, a propósito.
    render(<DatePicker aria-label="Vencimiento" required />)
    expect(screen.getByRole("button", { name: "Vencimiento" })).toBeInTheDocument()
  })

  it("sin clearable no hay forma de vaciarlo", async () => {
    render(<DatePicker aria-label="Vencimiento" defaultValue={d("2026-09-27")} />)
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    await screen.findByRole("dialog")
    expect(screen.queryByRole("button", { name: "Limpiar" })).toBeNull()
  })

  it("clearable: vacío no ofrece Limpiar, porque no hay nada que sacar", async () => {
    render(<DatePicker aria-label="Vencimiento" clearable />)
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    await screen.findByRole("dialog")
    expect(screen.queryByRole("button", { name: "Limpiar" })).toBeNull()
  })

  it("clearable: Limpiar vacía la fecha, el formulario y cierra el calendario", async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <form>
        <DatePicker aria-label="Vencimiento" clearable defaultValue={d("2026-09-27")} name="vence" onValueChange={onValueChange} />
      </form>
    )
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: "Limpiar" }))
    expect(onValueChange).toHaveBeenCalledWith(null)
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(screen.getByRole("button", { name: "Vencimiento" })).toHaveTextContent("Elegí una fecha")
    expect(new FormData(container.querySelector("form")!).get("vence")).toBe("")
  })

  it("los textos salen del LabelsProvider", () => {
    render(
      <LabelsProvider value={{ datePicker: { placeholder: "Pick a date" } }}>
        <DatePicker aria-label="Due" locale="en-US" />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Due" })).toHaveTextContent("Pick a date")
  })
})

describe("DatePicker mode=range", () => {
  it("se queda abierto después del desde y se cierra con el hasta", async () => {
    const onValueChange = vi.fn()
    render(<DatePicker aria-label="Período" mode="range" name="periodo" onValueChange={onValueChange} open={undefined} />)
    const campo = screen.getByRole("button", { name: "Período" })
    expect(campo).toHaveTextContent("Elegí un rango")
    await userEvent.click(campo)
    await screen.findByRole("dialog")
    const hoy = new Date()
    const iso = (n: number) => toISODate(new Date(hoy.getFullYear(), hoy.getMonth(), n))
    await userEvent.click(dia(iso(10)))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await userEvent.click(dia(iso(14)))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    const rango = onValueChange.mock.calls.at(-1)![0] as DateRange
    expect([toISODate(rango.from!), toISODate(rango.to!)]).toEqual([iso(10), iso(14)])
    expect(campo.textContent).toContain(" – ")
  })

  it("clearable: Limpiar vacía el desde y el hasta", async () => {
    const onValueChange = vi.fn()
    const { container } = render(
      <form>
        <DatePicker
          aria-label="Período"
          clearable
          defaultValue={{ from: d("2026-09-10"), to: d("2026-09-14") }}
          labels={{ clear: "Borrar" }}
          mode="range"
          name="periodo"
          onValueChange={onValueChange}
        />
      </form>
    )
    await userEvent.click(screen.getByRole("button", { name: "Período" }))
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: "Borrar" }))
    expect(onValueChange).toHaveBeenCalledWith({ from: null, to: null })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    const datos = new FormData(container.querySelector("form")!)
    expect([datos.get("periodo-desde"), datos.get("periodo-hasta")]).toEqual(["", ""])
  })

  it("con name salen dos campos: desde y hasta", () => {
    const { container } = render(
      <form>
        <DatePicker aria-label="Período" defaultValue={{ from: d("2026-09-10"), to: d("2026-09-14") }} mode="range" name="periodo" />
      </form>
    )
    const datos = new FormData(container.querySelector("form")!)
    expect(datos.get("periodo-desde")).toBe("2026-09-10")
    expect(datos.get("periodo-hasta")).toBe("2026-09-14")
  })
})
