// @vitest-environment node
import { describe, expect, it } from "vitest"

import {
  addDays,
  addMonths,
  clampDay,
  compareDays,
  fromISODate,
  isSameDay,
  isWithin,
  startOfWeek,
  toISODate,
  weeksOfMonth,
} from "../src/lib/dates"

const d = (iso: string) => fromISODate(iso)!

describe("fechas de calendario", () => {
  it("sumar días cruza meses y años", () => {
    expect(toISODate(addDays(d("2026-09-30"), 1))).toBe("2026-10-01")
    expect(toISODate(addDays(d("2026-01-01"), -1))).toBe("2025-12-31")
    expect(toISODate(addDays(d("2028-02-28"), 1))).toBe("2028-02-29")
  })

  it("sumar un día no depende de cuántas horas tenga ese día", () => {
    // En cualquier zona con horario de verano hay un día de 23 horas y uno de 25. Se recorre un
    // año entero de a un día: si en algún lado se sumaran milisegundos, un día se repetiría o
    // se saltearía.
    let fecha = d("2026-01-01")
    for (let i = 0; i < 365; i++) {
      const siguiente = addDays(fecha, 1)
      expect(compareDays(siguiente, fecha)).toBeGreaterThan(0)
      expect(siguiente.getHours()).toBe(0)
      fecha = siguiente
    }
    expect(toISODate(fecha)).toBe("2027-01-01")
  })

  it("sumar meses no se sale del mes de destino", () => {
    expect(toISODate(addMonths(d("2026-01-31"), 1))).toBe("2026-02-28")
    expect(toISODate(addMonths(d("2028-01-31"), 1))).toBe("2028-02-29")
    expect(toISODate(addMonths(d("2026-03-31"), -1))).toBe("2026-02-28")
    expect(toISODate(addMonths(d("2026-12-15"), 1))).toBe("2027-01-15")
    expect(toISODate(addMonths(d("2026-09-27"), 12))).toBe("2027-09-27")
  })

  it("compara por día, no por hora", () => {
    expect(isSameDay(new Date(2026, 8, 27, 0, 0), new Date(2026, 8, 27, 23, 59))).toBe(true)
    expect(isSameDay(d("2026-09-27"), d("2026-09-28"))).toBe(false)
    expect(isSameDay(null, d("2026-09-27"))).toBe(false)
  })

  it("la semana arranca el lunes por defecto, y el domingo si se pide", () => {
    // El 27 de septiembre de 2026 es domingo.
    expect(toISODate(startOfWeek(d("2026-09-27")))).toBe("2026-09-21")
    expect(toISODate(startOfWeek(d("2026-09-27"), 0))).toBe("2026-09-27")
    expect(toISODate(startOfWeek(d("2026-09-21")))).toBe("2026-09-21")
  })

  it("un mes son siempre seis semanas de siete días, empezando en el día pedido", () => {
    for (const mes of ["2026-09-01", "2027-02-01", "2026-05-01", "2028-02-01"]) {
      for (const inicio of [0, 1] as const) {
        const semanas = weeksOfMonth(d(mes), inicio)
        expect(semanas, mes).toHaveLength(6)
        for (const semana of semanas) {
          expect(semana, mes).toHaveLength(7)
          expect(semana[0]!.getDay(), mes).toBe(inicio)
        }
        // Consecutivos, sin repetir ni saltear.
        const dias = semanas.flat()
        dias.slice(1).forEach((dia, i) => expect(compareDays(dia, addDays(dias[i]!, 1)), mes).toBe(0))
      }
    }
    // Septiembre de 2026 empieza en martes: la grilla arranca el lunes 31 de agosto.
    expect(toISODate(weeksOfMonth(d("2026-09-01"))[0]![0]!)).toBe("2026-08-31")
  })

  it("ISO ida y vuelta, y rechaza fechas que no existen", () => {
    expect(toISODate(d("2026-09-27"))).toBe("2026-09-27")
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05")
    for (const mala of ["2026-02-30", "2026-13-01", "2026-9-27", "27/09/2026", ""]) expect(fromISODate(mala), mala).toBeNull()
  })

  it("clampDay lleva la fecha adentro de los límites", () => {
    expect(toISODate(clampDay(d("2026-09-01"), d("2026-09-10"), d("2026-09-20")))).toBe("2026-09-10")
    expect(toISODate(clampDay(d("2026-09-30"), d("2026-09-10"), d("2026-09-20")))).toBe("2026-09-20")
    expect(toISODate(clampDay(d("2026-09-15"), d("2026-09-10"), d("2026-09-20")))).toBe("2026-09-15")
    expect(toISODate(clampDay(d("2026-09-15")))).toBe("2026-09-15")
  })

  it("isWithin incluye los extremos y no le importa el orden", () => {
    expect(isWithin(d("2026-09-10"), d("2026-09-10"), d("2026-09-20"))).toBe(true)
    expect(isWithin(d("2026-09-20"), d("2026-09-10"), d("2026-09-20"))).toBe(true)
    expect(isWithin(d("2026-09-15"), d("2026-09-20"), d("2026-09-10"))).toBe(true)
    expect(isWithin(d("2026-09-21"), d("2026-09-10"), d("2026-09-20"))).toBe(false)
    expect(isWithin(d("2026-09-15"), d("2026-09-10"), null)).toBe(false)
  })
})
