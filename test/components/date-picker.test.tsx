import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { DatePicker } from "../../src/components/date-picker"
import { Field, FieldDescription, FieldError, FieldLabel } from "../../src/components/field"
import { Form } from "../../src/components/form"
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
    expect(campo).toHaveClass("rounded-field", "bg-fill-1", "border-transparent", "data-[size=md]:h-9", "px-3", "focus-visible:focus-border")
  })

  it("muestra la fecha en el idioma de la app, no en el del navegador", () => {
    render(<DatePicker aria-label="Vencimiento" defaultValue={d("2026-09-27")} />)
    const campo = screen.getByRole("button", { name: "Vencimiento" })
    expect(campo).toHaveTextContent("27 sept 2026")
    expect(campo).not.toHaveAttribute("data-placeholder")
  })

  it("abre un calendario opaco, elige y se cierra solo", async () => {
    const onValueChange = vi.fn()
    render(<DatePicker aria-label="Vencimiento" defaultValue={d("2026-09-27")} onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole("button", { name: "Vencimiento" }))
    const panel = await screen.findByRole("dialog", { name: "Calendario" })
    expect(panel).toHaveClass("bg-surface", "rounded-menu", "shadow-menu")
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

  it("required (2.1) valida de verdad: un input requerido fuera de la vista y del Tab, vacío sin fecha", () => {
    const { container } = render(<DatePicker aria-label="Vencimiento" required />)
    expect(screen.getByRole("button", { name: "Vencimiento" })).toBeInTheDocument()
    const validation = container.querySelector<HTMLInputElement>("input[required]")!
    expect(validation).toHaveAttribute("tabindex", "-1")
    expect(validation).toHaveAttribute("aria-hidden", "true")
    expect(validation.validity.valueMissing).toBe(true)
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

describe("DatePicker: elegir mes y año", () => {
  it("Escape en la grilla de meses vuelve a los días sin cerrar el panel", async () => {
    render(<DatePicker aria-label="Fecha de alta" defaultValue={d("2026-09-27")} />)
    await userEvent.click(screen.getByRole("button", { name: "Fecha de alta" }))
    await screen.findByRole("dialog")
    await userEvent.click(screen.getByRole("button", { name: /Elegir mes y año/ }))
    expect(document.querySelector("[data-slot=calendar-picker]")).not.toBeNull()
    await userEvent.keyboard("{Escape}")
    expect(document.querySelector("[data-slot=calendar-picker]")).toBeNull()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    // El segundo Escape, ya en los días, sí cierra.
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  })
})

describe("DatePicker en Field", () => {
  it("toma la etiqueta (sin perder la fecha del nombre), la ayuda y el error del campo", () => {
    render(
      <Field invalid>
        <FieldLabel>Vencimiento</FieldLabel>
        <DatePicker defaultValue={d("2026-09-27")} />
        <FieldDescription>El día que vence la factura.</FieldDescription>
        <FieldError match>Falta la fecha.</FieldError>
      </Field>
    )
    const campo = screen.getByRole("button", { name: "Vencimiento 27 sept 2026" })
    expect(campo).toHaveAccessibleDescription(expect.stringContaining("El día que vence la factura."))
    expect(campo).toHaveAttribute("aria-invalid", "true")
  })

  it("con Form: required sin fecha no envía y enfoca el campo; con fecha, manda el ISO con el name del Field", async () => {
    const user = userEvent.setup()
    const onFormSubmit = vi.fn()
    render(
      <Form onFormSubmit={onFormSubmit}>
        <Field name="due">
          <FieldLabel>Vencimiento</FieldLabel>
          <DatePicker defaultValue={null} required />
          <FieldError />
        </Field>
        <button type="submit">Guardar</button>
      </Form>
    )
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit).not.toHaveBeenCalled()
    const campo = screen.getByRole("button", { name: /^Vencimiento/ })
    expect(campo).toHaveFocus()
    expect(campo).toHaveAttribute("aria-invalid", "true")
    await user.click(campo)
    await user.click(document.querySelector<HTMLButtonElement>("[data-date]:not([data-outside])")!)
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(onFormSubmit).toHaveBeenCalledTimes(1)
    expect(onFormSubmit.mock.calls[0]![0].due).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("el name del Field llega al input del form nativo", () => {
    const { container } = render(
      <form>
        <Field name="due">
          <FieldLabel>Vencimiento</FieldLabel>
          <DatePicker defaultValue={d("2026-09-27")} />
        </Field>
      </form>
    )
    expect(new FormData(container.querySelector("form")!).get("due")).toBe("2026-09-27")
  })

  it("Field disabled apaga el campo", () => {
    render(
      <Field disabled>
        <FieldLabel>Vencimiento</FieldLabel>
        <DatePicker />
      </Field>
    )
    expect(screen.getByRole("button", { name: /^Vencimiento/ })).toBeDisabled()
  })
})
