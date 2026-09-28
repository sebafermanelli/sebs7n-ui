import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Calendar } from "../../src/components/calendar"
import { fromISODate, toISODate, type DateRange } from "../../src/lib/dates"
import { LabelsProvider } from "../../src/lib/labels"

const d = (iso: string) => fromISODate(iso)!
const dia = (iso: string) => document.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!
const titulo = () => document.querySelector("[data-slot=calendar-title]")!

describe("Calendar", () => {
  it("es una grilla con nombre, en español, con la semana empezando el lunes", () => {
    render(<Calendar defaultValue={d("2026-09-27")} />)
    const grilla = screen.getByRole("grid", { name: "septiembre de 2026" })
    const columnas = within(grilla).getAllByRole("columnheader")
    expect(columnas.map((c) => c.textContent)).toEqual(["lu", "ma", "mi", "ju", "vi", "sá", "do"])
    // El nombre entero va en `abbr`: dos letras no le dicen nada a un lector de pantalla.
    expect(columnas[0]).toHaveAttribute("abbr", "lunes")
    expect(dia("2026-09-27")).toHaveAccessibleName("domingo, 27 de septiembre de 2026")
  })

  it("siempre dibuja seis semanas, y los días de otro mes no se pueden elegir ni enfocar", () => {
    render(<Calendar defaultMonth={d("2027-02-01")} />)
    expect(document.querySelectorAll("tbody tr")).toHaveLength(6)
    expect(document.querySelectorAll("[data-slot=calendar-day]")).toHaveLength(28)
    const vecinos = document.querySelectorAll("[data-outside]")
    expect(vecinos).toHaveLength(14)
    for (const vecino of vecinos) {
      expect(vecino).toHaveAttribute("aria-hidden", "true")
      expect(vecino.querySelector("button")).toBeNull()
    }
  })

  it("una sola parada de tabulación: la fecha elegida", () => {
    render(<Calendar defaultValue={d("2026-09-27")} />)
    const paradas = [...document.querySelectorAll("[data-slot=calendar-day]")].filter((b) => b.getAttribute("tabindex") === "0")
    expect(paradas).toHaveLength(1)
    expect(paradas[0]).toHaveAttribute("data-date", "2026-09-27")
    expect(dia("2026-09-27").closest("td")).toHaveAttribute("aria-selected", "true")
  })

  it("elegir avisa la fecha y la marca con el brand", async () => {
    const onValueChange = vi.fn()
    render(<Calendar defaultMonth={d("2026-09-01")} onValueChange={onValueChange} />)
    await userEvent.click(dia("2026-09-15"))
    expect(toISODate(onValueChange.mock.calls[0]![0])).toBe("2026-09-15")
    expect(dia("2026-09-15")).toHaveAttribute("data-selected")
    expect(dia("2026-09-15")).toHaveClass("data-selected:bg-brand-700", "data-selected:text-brand-contrast", "rounded-full")
  })

  it("las flechas mueven el foco; al salir del mes, el mes cambia con él", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar defaultValue={d("2026-09-29")} onMonthChange={onMonthChange} />)
    dia("2026-09-29").focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(dia("2026-09-30")).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(titulo()).toHaveTextContent("octubre de 2026")
    expect(dia("2026-10-01")).toHaveFocus()
    expect(toISODate(onMonthChange.mock.calls[0]![0])).toBe("2026-10-01")
    await userEvent.keyboard("{ArrowUp}")
    expect(dia("2026-09-24")).toHaveFocus()
  })

  it("Inicio y Fin van a los extremos de la semana; Re Pág y Av Pág, de mes y de año", async () => {
    render(<Calendar defaultValue={d("2026-09-16")} />)
    dia("2026-09-16").focus()
    await userEvent.keyboard("{Home}")
    expect(dia("2026-09-14")).toHaveFocus()
    await userEvent.keyboard("{End}")
    expect(dia("2026-09-20")).toHaveFocus()
    await userEvent.keyboard("{PageDown}")
    expect(dia("2026-10-20")).toHaveFocus()
    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}")
    expect(dia("2025-10-20")).toHaveFocus()
  })

  it("Av Pág desde el 31 cae en el último día del mes siguiente, no en el otro", async () => {
    render(<Calendar defaultValue={d("2026-01-31")} />)
    dia("2026-01-31").focus()
    await userEvent.keyboard("{PageDown}")
    expect(dia("2026-02-28")).toHaveFocus()
  })

  it("los botones cambian de mes sin robarle el foco al que los apretó", async () => {
    render(<Calendar defaultValue={d("2026-09-27")} />)
    const siguiente = screen.getByRole("button", { name: "Mes siguiente" })
    await userEvent.click(siguiente)
    expect(titulo()).toHaveTextContent("octubre de 2026")
    expect(siguiente).toHaveFocus()
    // La parada de tabulación se corrió al mismo día del mes nuevo: la grilla sigue siendo alcanzable.
    expect(dia("2026-10-27")).toHaveAttribute("tabindex", "0")
    await userEvent.click(screen.getByRole("button", { name: "Mes anterior" }))
    expect(titulo()).toHaveTextContent("septiembre de 2026")
  })

  it("min y max apagan fechas, frenan el teclado y apagan los botones de mes", async () => {
    const onValueChange = vi.fn()
    render(<Calendar defaultValue={d("2026-09-12")} max={d("2026-09-20")} min={d("2026-09-10")} onValueChange={onValueChange} />)
    expect(dia("2026-09-09")).toHaveAttribute("aria-disabled", "true")
    expect(dia("2026-09-21")).toHaveAttribute("aria-disabled", "true")
    await userEvent.click(dia("2026-09-09"))
    expect(onValueChange).not.toHaveBeenCalled()
    dia("2026-09-12").focus()
    await userEvent.keyboard("{ArrowUp}")
    expect(dia("2026-09-10")).toHaveFocus()
    expect(screen.getByRole("button", { name: "Mes anterior" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Mes siguiente" })).toBeDisabled()
  })

  it("isDateDisabled apaga fechas sueltas, que siguen siendo enfocables", async () => {
    const onValueChange = vi.fn()
    render(<Calendar defaultMonth={d("2026-09-01")} isDateDisabled={(fecha) => fecha.getDay() === 0} onValueChange={onValueChange} />)
    expect(dia("2026-09-27")).toHaveAttribute("aria-disabled", "true")
    // `aria-disabled` y no `disabled`: un botón `disabled` no recibe foco, y el teclado que
    // pasa por arriba de un domingo se quedaría sin dónde pararse.
    expect(dia("2026-09-27")).not.toBeDisabled()
    await userEvent.click(dia("2026-09-27"))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  // Las flechas de mes miden 24 y van pegadas: en táctil se separan 20 para que sus áreas de 44
  // no se pisen.
  it("en táctil las flechas de mes se separan", () => {
    render(<Calendar defaultValue={d("2026-09-27")} />)
    const flechas = screen.getByRole("button", { name: "Mes anterior" }).parentElement
    expect(flechas).toHaveClass("pointer-coarse:gap-5")
    expect(flechas).toContainElement(screen.getByRole("button", { name: "Mes siguiente" }))
  })

  it("hoy se anuncia con aria-current", () => {
    vi.useFakeTimers({ now: new Date(2026, 8, 27, 15, 0), toFake: ["Date"] })
    render(<Calendar />)
    vi.useRealTimers()
    expect(dia("2026-09-27")).toHaveAttribute("aria-current", "date")
    expect(document.querySelectorAll("[aria-current=date]")).toHaveLength(1)
  })

  it("en inglés y con la semana empezando el domingo", () => {
    render(<Calendar defaultMonth={d("2026-09-01")} locale="en-US" weekStartsOn={0} />)
    expect(screen.getByRole("grid", { name: "September 2026" })).toBeInTheDocument()
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("abbr", "Sunday")
  })

  it("los nombres de los botones salen del LabelsProvider, y la prop le gana", () => {
    render(
      <LabelsProvider value={{ calendar: { previousMonth: "Previous month", nextMonth: "Next month" } }}>
        <Calendar labels={{ nextMonth: "Próximo" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Próximo" })).toBeInTheDocument()
  })
})

describe("Calendar mode=range", () => {
  const Rango = ({ onValueChange }: { onValueChange: (r: DateRange) => void }) => (
    <Calendar defaultMonth={d("2026-09-01")} mode="range" onValueChange={onValueChange} />
  )

  it("el primer clic es el desde y el segundo el hasta", async () => {
    const onValueChange = vi.fn()
    render(<Rango onValueChange={onValueChange} />)
    expect(screen.getByRole("grid")).toHaveAttribute("aria-multiselectable", "true")
    await userEvent.click(dia("2026-09-10"))
    expect(onValueChange.mock.calls[0]![0]).toMatchObject({ to: null })
    await userEvent.click(dia("2026-09-14"))
    const rango = onValueChange.mock.calls[1]![0] as DateRange
    expect([toISODate(rango.from!), toISODate(rango.to!)]).toEqual(["2026-09-10", "2026-09-14"])
    expect(dia("2026-09-10").closest("td")).toHaveAttribute("data-range", "start")
    expect(dia("2026-09-12").closest("td")).toHaveAttribute("data-range", "middle")
    expect(dia("2026-09-14").closest("td")).toHaveAttribute("data-range", "end")
    expect(dia("2026-09-12").closest("td")).toHaveAttribute("aria-selected", "true")
    expect(dia("2026-09-15").closest("td")).not.toHaveAttribute("data-range")
  })

  it("un hasta anterior al desde no es un error: los da vuelta", async () => {
    const onValueChange = vi.fn()
    render(<Rango onValueChange={onValueChange} />)
    await userEvent.click(dia("2026-09-14"))
    await userEvent.click(dia("2026-09-10"))
    const rango = onValueChange.mock.calls[1]![0] as DateRange
    expect([toISODate(rango.from!), toISODate(rango.to!)]).toEqual(["2026-09-10", "2026-09-14"])
  })

  it("mientras se elige, el día bajo el puntero muestra cómo quedaría", async () => {
    render(<Rango onValueChange={() => {}} />)
    await userEvent.click(dia("2026-09-10"))
    fireEvent.pointerEnter(dia("2026-09-13"))
    expect(dia("2026-09-11").closest("td")).toHaveAttribute("data-range", "middle")
    // Todavía no está elegido: se ve la banda, pero el extremo no se pinta como marcado.
    expect(dia("2026-09-13")).not.toHaveAttribute("data-selected")
    fireEvent.pointerLeave(screen.getByRole("grid"))
    expect(dia("2026-09-11").closest("td")).not.toHaveAttribute("data-range")
  })

  it("con un rango completo, un clic más empieza uno nuevo", async () => {
    const onValueChange = vi.fn()
    render(<Rango onValueChange={onValueChange} />)
    await userEvent.click(dia("2026-09-10"))
    await userEvent.click(dia("2026-09-14"))
    await userEvent.click(dia("2026-09-20"))
    const rango = onValueChange.mock.calls[2]![0] as DateRange
    expect(toISODate(rango.from!)).toBe("2026-09-20")
    expect(rango.to).toBeNull()
  })

  describe("varios meses", () => {
    const rango: DateRange = { from: d("2026-10-02"), to: d("2026-10-14") }

    it("una grilla por mes, con los botones en las puntas", () => {
      render(<Calendar defaultMonth={d("2026-09-01")} mode="range" numberOfMonths={2} value={rango} />)
      const grillas = screen.getAllByRole("grid")
      expect(grillas.map((g) => g.getAttribute("aria-labelledby")).map((id) => document.getElementById(id!)!.textContent)).toEqual([
        "septiembre de 2026",
        "octubre de 2026",
      ])
      const [primero, segundo] = [...document.querySelectorAll<HTMLElement>("[data-slot=calendar-month]")]
      expect(within(primero!).getByRole("button", { name: "Mes anterior" })).toBeInTheDocument()
      expect(within(primero!).queryByRole("button", { name: "Mes siguiente" })).toBeNull()
      expect(within(segundo!).getByRole("button", { name: "Mes siguiente" })).toBeInTheDocument()
      expect(within(segundo!).queryByRole("button", { name: "Mes anterior" })).toBeNull()
    })

    it("cada fecha aparece una sola vez: los huecos de un mes quedan vacíos", () => {
      render(<Calendar defaultMonth={d("2026-09-01")} mode="range" numberOfMonths={2} value={rango} />)
      // El 2 de octubre cae en la última semana de la grilla de septiembre. Dibujado ahí también,
      // el rango se ve dos veces: una en cada mes.
      expect(document.querySelectorAll('[data-date="2026-10-02"]')).toHaveLength(1)
      expect(document.querySelectorAll("[data-selected]")).toHaveLength(2)
      for (const hueco of document.querySelectorAll("[data-outside]")) expect(hueco).toBeEmptyDOMElement()
      expect(document.querySelectorAll("[data-slot=calendar-day]")).toHaveLength(30 + 31)
    })

    it("la banda del rango se cierra en los bordes del mes", () => {
      render(<Calendar defaultMonth={d("2026-09-01")} mode="range" numberOfMonths={2} value={{ from: d("2026-09-28"), to: d("2026-10-03") }} />)
      expect(dia("2026-09-30").closest("td")).toHaveAttribute("data-month-end")
      expect(dia("2026-09-30").closest("td")).toHaveAttribute("data-range", "middle")
      expect(dia("2026-10-01").closest("td")).toHaveAttribute("data-month-start")
      expect(dia("2026-09-29").closest("td")).not.toHaveAttribute("data-month-end")
    })

    it("sigue siendo una sola parada de tabulación, y las flechas cruzan de un mes al otro sin mover la vista", async () => {
      const onMonthChange = vi.fn()
      render(<Calendar defaultMonth={d("2026-09-01")} defaultValue={d("2026-09-30")} numberOfMonths={2} onMonthChange={onMonthChange} />)
      expect([...document.querySelectorAll("[data-slot=calendar-day]")].filter((b) => b.getAttribute("tabindex") === "0")).toHaveLength(1)
      dia("2026-09-30").focus()
      await userEvent.keyboard("{ArrowRight}")
      expect(dia("2026-10-01")).toHaveFocus()
      expect(onMonthChange).not.toHaveBeenCalled()
    })

    it("al salir por el final, la vista avanza lo justo: el mes nuevo queda último", async () => {
      const onMonthChange = vi.fn()
      render(<Calendar defaultMonth={d("2026-09-01")} defaultValue={d("2026-10-31")} numberOfMonths={2} onMonthChange={onMonthChange} />)
      dia("2026-10-31").focus()
      await userEvent.keyboard("{ArrowRight}")
      expect(dia("2026-11-01")).toHaveFocus()
      expect(toISODate(onMonthChange.mock.calls[0]![0])).toBe("2026-10-01")
    })

    it("«siguiente» se apaga cuando el último mes a la vista ya llega a `max`", () => {
      render(<Calendar defaultMonth={d("2026-09-01")} max={d("2026-10-20")} numberOfMonths={2} />)
      expect(screen.getByRole("button", { name: "Mes siguiente" })).toBeDisabled()
    })
  })
})
