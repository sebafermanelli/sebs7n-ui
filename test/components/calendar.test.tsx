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

  // Con el dedo los días crecen de verdad (están pegados: `touch-target` no sirve). A 44, siete
  // columnas + el p-3 del DatePicker + el borde miden 334 y no entran en un teléfono de 320. A
  // 40 son 306, que entran con el margen de 5 px que deja Base UI contra el borde de la pantalla.
  it("en táctil los días miden 40: la grilla entra en 320 px", () => {
    render(<Calendar defaultValue={d("2026-09-27")} />)
    expect(dia("2026-09-27")).toHaveClass("pointer-coarse:size-10")
    expect(document.querySelector("[data-slot=calendar]")!.innerHTML).not.toMatch(/pointer-coarse:size-11/)
    expect(7 * 40 + 2 * 12 + 2).toBeLessThanOrEqual(320 - 2 * 5)
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
  const Rango = ({ onValueChange, isDateDisabled }: { onValueChange: (r: DateRange) => void; isDateDisabled?: (date: Date) => boolean }) => (
    <Calendar defaultMonth={d("2026-09-01")} isDateDisabled={isDateDisabled} mode="range" onValueChange={onValueChange} />
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
    // El fin previsto se ve como un fin de verdad (2.1): la media banda hasta su centro y el círculo del
    // acento encima, no el gris del hover cortando la banda. `data-preview` dice que todavía no se eligió.
    expect(dia("2026-09-13").closest("td")).toHaveAttribute("data-range", "end")
    expect(dia("2026-09-13")).toHaveAttribute("data-selected")
    expect(dia("2026-09-13")).toHaveAttribute("data-preview")
    expect(dia("2026-09-10")).not.toHaveAttribute("data-preview")
    fireEvent.pointerLeave(screen.getByRole("grid"))
    expect(dia("2026-09-13")).not.toHaveAttribute("data-selected")
    expect(dia("2026-09-13")).not.toHaveAttribute("data-preview")
    expect(dia("2026-09-11").closest("td")).not.toHaveAttribute("data-range")
  })

  it("hacia atrás, el día bajo el puntero es el comienzo previsto y el desde pasa a ser el fin", async () => {
    render(<Rango onValueChange={() => {}} />)
    await userEvent.click(dia("2026-09-20"))
    fireEvent.pointerEnter(dia("2026-09-17"))
    expect(dia("2026-09-17").closest("td")).toHaveAttribute("data-range", "start")
    expect(dia("2026-09-17")).toHaveAttribute("data-selected")
    expect(dia("2026-09-17")).toHaveAttribute("data-preview")
    expect(dia("2026-09-20").closest("td")).toHaveAttribute("data-range", "end")
    expect(dia("2026-09-18").closest("td")).toHaveAttribute("data-range", "middle")
  })

  it("un día apagado no se ofrece como fin previsto", async () => {
    render(<Rango isDateDisabled={(date: Date) => date.getDate() === 13} onValueChange={() => {}} />)
    await userEvent.click(dia("2026-09-10"))
    fireEvent.pointerEnter(dia("2026-09-13"))
    expect(dia("2026-09-13")).not.toHaveAttribute("data-preview")
    expect(dia("2026-09-11").closest("td")).not.toHaveAttribute("data-range")
  })

  it("con un rango ya elegido no hay vista previa", async () => {
    render(<Rango onValueChange={() => {}} />)
    await userEvent.click(dia("2026-09-10"))
    await userEvent.click(dia("2026-09-14"))
    expect(dia("2026-09-14")).toHaveAttribute("data-selected")
    expect(dia("2026-09-14")).not.toHaveAttribute("data-preview")
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

    it("la vista previa cruza el borde del mes: el fin previsto en el mes de al lado", async () => {
      render(<Calendar defaultMonth={d("2026-09-01")} mode="range" numberOfMonths={2} />)
      await userEvent.click(dia("2026-09-29"))
      fireEvent.pointerEnter(dia("2026-10-02"))
      expect(dia("2026-09-30").closest("td")).toHaveAttribute("data-range", "middle")
      expect(dia("2026-10-01").closest("td")).toHaveAttribute("data-range", "middle")
      expect(dia("2026-10-02").closest("td")).toHaveAttribute("data-range", "end")
      expect(dia("2026-10-02")).toHaveAttribute("data-preview")
    })

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

// Ir de año en año con las flechas de mes es lento: para una fecha de alta de hace veinte años
// son 240 clics. El título abre una grilla de meses, y el año de esa grilla, una de años.
describe("Calendar: elegir mes y año", () => {
  const tituloBoton = () => screen.getByRole("button", { name: /Elegir mes y año/ })
  const celdas = () => [...document.querySelectorAll<HTMLButtonElement>("[data-slot=calendar-cell]")]
  const celda = (texto: string) => celdas().find((c) => c.textContent === texto)!

  it("el título es un botón con el mes a la vista, cerrado, y se alcanza con Tab", async () => {
    render(<Calendar defaultValue={d("2026-09-27")} />)
    expect(tituloBoton()).toHaveAccessibleName("septiembre de 2026, Elegir mes y año")
    expect(tituloBoton()).toHaveAttribute("aria-expanded", "false")
    // La grilla se sigue llamando por el mes, no por lo que hace el botón.
    expect(screen.getByRole("grid", { name: "septiembre de 2026" })).toBeInTheDocument()
    await userEvent.tab()
    expect(tituloBoton()).toHaveFocus()
  })

  it("abre una grilla de doce meses con nombres cortos, el mes a la vista marcado y enfocado", async () => {
    vi.useFakeTimers({ now: new Date(2026, 8, 27, 15, 0), toFake: ["Date"] })
    render(<Calendar defaultValue={d("2026-03-10")} />)
    vi.useRealTimers()
    await userEvent.click(tituloBoton())
    const grilla = screen.getByRole("grid", { name: "2026" })
    expect(celdas().map((c) => c.textContent)).toEqual(["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"])
    expect(within(grilla).getAllByRole("row")).toHaveLength(4)
    expect(celda("mar")).toHaveAttribute("data-selected")
    expect(celda("mar")).toHaveClass("data-selected:bg-brand-700")
    expect(celda("mar")).toHaveFocus()
    expect(celda("mar").closest("[role=gridcell]")).toHaveAttribute("aria-selected", "true")
    expect(celda("mar")).toHaveAccessibleName("marzo de 2026")
    // El mes de hoy, como el día de hoy: `aria-current` y el color de marca.
    expect(celda("sept")).toHaveAttribute("aria-current", "date")
    // El título sigue en su lugar, abierto, con el chevron girado.
    const abierto = screen.getByRole("button", { name: /Elegir año/ })
    expect(abierto).toHaveAttribute("aria-expanded", "true")
    expect(abierto.querySelector("svg")).toHaveClass("rotate-90")
  })

  it("elegir un mes vuelve a los días en ese mes y avisa onMonthChange", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar defaultValue={d("2026-09-27")} onMonthChange={onMonthChange} />)
    await userEvent.click(tituloBoton())
    await userEvent.click(screen.getByRole("button", { name: "Año anterior" }))
    expect(screen.getByRole("grid", { name: "2025" })).toBeInTheDocument()
    await userEvent.click(celda("feb"))
    expect(toISODate(onMonthChange.mock.calls[0]![0])).toBe("2025-02-01")
    expect(titulo()).toHaveTextContent("febrero de 2025")
    expect(document.querySelector("[data-slot=calendar-picker]")).toBeNull()
    // El foco vuelve a los días, al mismo número en el mes nuevo.
    expect(dia("2025-02-27")).toHaveFocus()
  })

  it("teclado: flechas por la grilla, cruzan de año; Enter elige", async () => {
    render(<Calendar defaultValue={d("2026-11-05")} />)
    await userEvent.click(tituloBoton())
    expect(celda("nov")).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(celda("dic")).toHaveFocus()
    await userEvent.keyboard("{ArrowUp}")
    expect(celda("sept")).toHaveFocus()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    expect(screen.getByRole("grid", { name: "2027" })).toBeInTheDocument()
    expect(celda("mar")).toHaveFocus()
    // Una sola parada de tabulación en la grilla.
    expect(celdas().filter((c) => c.tabIndex === 0)).toHaveLength(1)
    await userEvent.keyboard("{PageDown}")
    expect(screen.getByRole("grid", { name: "2028" })).toBeInTheDocument()
    await userEvent.keyboard("{Enter}")
    expect(titulo()).toHaveTextContent("marzo de 2028")
    expect(dia("2028-03-05")).toHaveFocus()
  })

  it("Escape vuelve a los días sin cambiar nada y devuelve el foco al título", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar defaultValue={d("2026-09-27")} onMonthChange={onMonthChange} />)
    await userEvent.click(tituloBoton())
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{Escape}")
    expect(document.querySelector("[data-slot=calendar-picker]")).toBeNull()
    expect(titulo()).toHaveTextContent("septiembre de 2026")
    expect(onMonthChange).not.toHaveBeenCalled()
    expect(tituloBoton()).toHaveFocus()
  })

  it("el año abre una grilla de doce años que se pagina de a doce: una fecha de hace décadas está a pocos clics", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar defaultValue={d("2026-09-27")} onMonthChange={onMonthChange} />)
    await userEvent.click(tituloBoton())
    await userEvent.click(screen.getByRole("button", { name: /Elegir año/ }))
    expect(celdas().map((c) => c.textContent)).toEqual(Array.from({ length: 12 }, (_, i) => String(2016 + i)))
    expect(screen.getByRole("grid", { name: "2016 – 2027" })).toBeInTheDocument()
    expect(celda("2026")).toHaveFocus()
    expect(celda("2026")).toHaveAttribute("data-selected")
    await userEvent.click(screen.getByRole("button", { name: "Años anteriores" }))
    await userEvent.click(screen.getByRole("button", { name: "Años anteriores" }))
    expect(screen.getByRole("grid", { name: "1992 – 2003" })).toBeInTheDocument()
    await userEvent.click(celda("1994"))
    // Vuelve a los meses de ese año, con el mismo mes enfocado.
    expect(screen.getByRole("grid", { name: "1994" })).toBeInTheDocument()
    expect(celda("sept")).toHaveFocus()
    await userEvent.click(celda("jun"))
    expect(titulo()).toHaveTextContent("junio de 1994")
    expect(toISODate(onMonthChange.mock.calls[0]![0])).toBe("1994-06-01")
  })

  it("min y max apagan meses y años y las flechas que llevan afuera", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar defaultValue={d("2026-05-10")} max={d("2026-08-20")} min={d("2025-03-10")} onMonthChange={onMonthChange} />)
    await userEvent.click(tituloBoton())
    expect(celda("ago")).not.toHaveAttribute("aria-disabled")
    expect(celda("sept")).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("button", { name: "Año siguiente" })).toBeDisabled()
    await userEvent.click(celda("oct"))
    expect(onMonthChange).not.toHaveBeenCalled()
    // Las flechas del teclado frenan en el borde, como en los días.
    celda("may").focus()
    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    expect(celda("ago")).toHaveFocus()
    await userEvent.click(screen.getByRole("button", { name: "Año anterior" }))
    expect(celda("feb")).toHaveAttribute("aria-disabled", "true")
    expect(celda("mar")).not.toHaveAttribute("aria-disabled")
    expect(screen.getByRole("button", { name: "Año anterior" })).toBeDisabled()
    await userEvent.click(screen.getByRole("button", { name: /Elegir año/ }))
    expect(celda("2024")).toHaveAttribute("aria-disabled", "true")
    expect(celda("2025")).not.toHaveAttribute("aria-disabled")
    expect(celda("2027")).toHaveAttribute("aria-disabled", "true")
    expect(screen.getByRole("button", { name: "Años anteriores" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Años siguientes" })).toBeDisabled()
  })

  it("con varios meses, solo el título del primero abre la grilla, que tapa a todos", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar defaultMonth={d("2026-09-01")} mode="range" numberOfMonths={2} onMonthChange={onMonthChange} />)
    expect(screen.getAllByRole("button", { name: /Elegir mes y año/ })).toHaveLength(1)
    await userEvent.click(tituloBoton())
    // Los meses de días quedan en su lugar, invisibles: el tamaño no salta.
    for (const mes of document.querySelectorAll("[data-slot=calendar-month]")) {
      expect(mes).toHaveClass("invisible")
      expect(mes).toHaveAttribute("aria-hidden", "true")
    }
    await userEvent.click(celda("dic"))
    expect(toISODate(onMonthChange.mock.calls[0]![0])).toBe("2026-12-01")
    const titulos = [...document.querySelectorAll("[data-slot=calendar-title]")].map((t) => t.textContent)
    expect(titulos).toEqual(["diciembre de 2026", "enero de 2027"])
  })

  it("controlado: elegir un mes solo avisa; el mes lo pone quien controla", async () => {
    const onMonthChange = vi.fn()
    render(<Calendar month={d("2026-09-01")} onMonthChange={onMonthChange} />)
    await userEvent.click(tituloBoton())
    await userEvent.click(celda("ene"))
    expect(toISODate(onMonthChange.mock.calls[0]![0])).toBe("2026-01-01")
    expect(titulo()).toHaveTextContent("septiembre de 2026")
  })

  it("los nombres salen del LabelsProvider, y en inglés los meses también", async () => {
    render(
      <LabelsProvider value={{ calendar: { chooseMonthYear: "Choose month and year", previousYear: "Previous year" } }}>
        <Calendar defaultMonth={d("2026-09-01")} locale="en-US" />
      </LabelsProvider>
    )
    await userEvent.click(screen.getByRole("button", { name: /Choose month and year/ }))
    expect(celdas()[8]).toHaveTextContent("Sep")
    expect(screen.getByRole("button", { name: "Previous year" })).toBeInTheDocument()
  })
})
