// @vitest-environment node
import { describe, expect, it } from "vitest"

import { formatPhone } from "../src/lib/phone"

describe("formatPhone", () => {
  it("internacional legible por defecto", () => {
    expect(formatPhone("+5491155552002")).toBe("+54 9 11 5555-2002")
    expect(formatPhone("+541145678901")).toBe("+54 11 4567-8901")
    expect(formatPhone("+543514567890")).toBe("+54 351 456-7890")
    expect(formatPhone("+542214567890")).toBe("+54 221 456-7890")
    expect(formatPhone("+12025550143")).toBe("+1 202 555 0143")
    expect(formatPhone("+34612345678")).toBe("+34 61 234 5678")
  })

  it("nacional si el teléfono es del país de quien lo lee", () => {
    expect(formatPhone("+5491155552002", { country: "AR" })).toBe("011 15-5555-2002")
    expect(formatPhone("+541145678901", { country: "ar" })).toBe("011 4567-8901")
    expect(formatPhone("+5491155552002", { country: "UY" })).toBe("+54 9 11 5555-2002")
  })

  it("nacional solo donde hay un formato definido (AR); el resto, siempre internacional", () => {
    expect(formatPhone("+12025550143", { country: "US" })).toBe("+1 202 555 0143")
    expect(formatPhone("+447911123456", { country: "GB" })).toBe("+44 791 112 3456")
  })

  it("agrupa desde la derecha sin grupos de un dígito", () => {
    const groups = (text: string) => text.split(" ").slice(1)
    for (const [value, expected] of [
      ["+525512345678", "+52 551 234 5678"], // MX
      ["+59899123456", "+598 9912 3456"], // UY celular
      ["+5511912345678", "+55 1191 234 5678"], // BR celular
      ["+33612345678", "+33 61 234 5678"], // FR
      ["+393123456789", "+39 312 345 6789"], // IT celular
      ["+39061234567", "+39 06 123 4567"], // IT fijo con su 0
    ] as const) {
      expect(formatPhone(value)).toBe(expected)
      for (const group of groups(formatPhone(value))) expect(group.replace(/\D/g, "").length).toBeGreaterThan(1)
    }
  })

  it("un número incompleto o inválido vuelve tal cual", () => {
    expect(formatPhone("+54911")).toBe("+54911")
    expect(formatPhone("+5411555")).toBe("+5411555")
    expect(formatPhone("+5401145678901")).toBe("+5401145678901")
    expect(formatPhone("+5491155552002", { country: "AR" })).toBe("011 15-5555-2002")
  })

  it("acepta espacios y guiones en el E.164", () => {
    expect(formatPhone("+54 9 11 5555-2002")).toBe("+54 9 11 5555-2002")
  })

  it("lo que no es E.164 de la tabla vuelve tal cual (datos viejos)", () => {
    expect(formatPhone("11 5555-2002")).toBe("11 5555-2002")
    expect(formatPhone("+999123")).toBe("+999123")
    expect(formatPhone("")).toBe("")
  })
})
