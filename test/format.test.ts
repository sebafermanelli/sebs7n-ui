// @vitest-environment node
import { describe, expect, it } from "vitest"

import { createFormat, DEFAULT_CURRENCY, DEFAULT_LOCALE } from "../src/lib/format.js"

describe("createFormat", () => {
  it("por defecto es es-AR y ARS", () => {
    const f = createFormat()
    expect(f.locale).toBe(DEFAULT_LOCALE)
    expect(f.currencyCode).toBe(DEFAULT_CURRENCY)
    expect(f.currency(1240.5)).toMatch(/^\$\s1\.240,50$/)
  })

  it("el símbolo sale de Intl, no se escribe a mano: la moneda y el idioma lo cambian", () => {
    expect(createFormat().currency(99, { currency: "USD", maximumFractionDigits: 0 })).toMatch(/US\$\s99/)
    expect(createFormat({ locale: "en-US", currency: "USD" }).currency(1240.5)).toBe("$1,240.50")
    expect(createFormat({ locale: "de-DE", currency: "EUR" }).currency(1240.5)).toMatch(/1\.240,50\s€/)
  })

  it("número, porcentaje, compacto y unidad", () => {
    const f = createFormat()
    expect(f.number(1240.5)).toBe("1.240,5")
    expect(f.number(12345.6)).toBe("12.345,6")
    expect(f.percent(0.125)).toMatch(/12,5\s?%/)
    expect(f.compact(1_200_000)).toMatch(/1,2\s?M/)
    expect(f.unit(2.5, "gigabyte")).toMatch(/2,5\s?GB/)
  })

  it("las fechas «solo día» son locales y no retroceden un día", () => {
    const f = createFormat({ timeZone: "America/Argentina/Buenos_Aires" })
    expect(f.date("2026-10-08")).toMatch(/^8 de oct\.? de 2026$/)
    expect(f.date("2026-01-01")).toMatch(/^1 de ene\.? de 2026$/)
  })

  it("hora y fecha con hora respetan la zona", () => {
    const f = createFormat({ timeZone: "UTC" })
    expect(f.time(new Date("2026-10-08T14:30:00Z"), { hour12: false })).toBe("14:30")
    expect(f.time(new Date("2026-10-08T14:30:00Z"))).toMatch(/^02:30\sp\.\sm\.$/)
    expect(f.dateTime(new Date("2026-10-08T14:30:00Z"))).toMatch(/8 (de )?oct\.? (de )?2026.*2:30/)
  })

  it("fecha relativa y «hace cuánto»", () => {
    const f = createFormat()
    expect(f.relative(-1, "day")).toBe("ayer")
    expect(f.relative(3, "hour")).toMatch(/dentro de 3 horas/)
    const now = new Date("2026-10-08T12:00:00Z")
    expect(f.since(new Date("2026-10-06T12:00:00Z"), now)).toBe("anteayer")
    expect(f.since(new Date("2026-10-08T09:00:00Z"), now)).toMatch(/hace 3 horas/)
  })

  it("listas con su conjunción, por idioma", () => {
    expect(createFormat().list(["facturas", "clientes", "equipos"])).toBe("facturas, clientes y equipos")
    expect(createFormat({ locale: "en-US" }).list(["a", "b", "c"])).toBe("a, b, and c")
  })

  it("reusa las instancias de Intl", () => {
    const f = createFormat()
    expect(f.currency(1)).toBe(f.currency(1))
  })
})
