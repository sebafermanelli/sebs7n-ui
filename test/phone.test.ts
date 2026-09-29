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
    expect(formatPhone("+34612345678")).toBe("+34 612 34 5678")
  })

  it("nacional si el teléfono es del país de quien lo lee", () => {
    expect(formatPhone("+5491155552002", { country: "AR" })).toBe("011 15-5555-2002")
    expect(formatPhone("+541145678901", { country: "ar" })).toBe("011 4567-8901")
    expect(formatPhone("+12025550143", { country: "US" })).toBe("202 555 0143")
    expect(formatPhone("+447911123456", { country: "GB" })).toBe("0791 112 3456")
    expect(formatPhone("+5491155552002", { country: "UY" })).toBe("+54 9 11 5555-2002")
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
