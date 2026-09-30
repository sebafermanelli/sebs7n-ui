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

  // Los esperados salen de los `available_formats` de AR en la metadata de libphonenumber-js 1.12.41: el
  // área (2, 3 o 4 dígitos) la decide el patrón de `leading_digits`, y parte al abonado en 4 + 4, 3 + 4
  // o 2 + 4. El internacional es el `intl_format` de la metadata («$1 $2 $3-$4», con el guion, como
  // libphonenumber de Google); `formatInternational` de libphonenumber-js cambia el guion por un espacio.
  it("Argentina con el área de la metadata de libphonenumber: 2, 3 o 4 dígitos", () => {
    for (const [value, international, national] of [
      ["+5491155552002", "+54 9 11 5555-2002", "011 15-5555-2002"], // CABA, celular
      ["+541155552002", "+54 11 5555-2002", "011 5555-2002"], // CABA, fijo
      ["+5493414567890", "+54 9 341 456-7890", "0341 15-456-7890"], // Rosario
      ["+543414567890", "+54 341 456-7890", "0341 456-7890"],
      ["+5493511234567", "+54 9 351 123-4567", "0351 15-123-4567"], // Córdoba
      ["+543511234567", "+54 351 123-4567", "0351 123-4567"],
      ["+5492234567890", "+54 9 223 456-7890", "0223 15-456-7890"], // Mar del Plata
      ["+542234567890", "+54 223 456-7890", "0223 456-7890"],
      ["+5492478409043", "+54 9 2478 40-9043", "02478 15-40-9043"], // área de 4
      ["+542478409043", "+54 2478 40-9043", "02478 40-9043"],
      ["+5492964123456", "+54 9 2964 12-3456", "02964 15-12-3456"],
      ["+542964123456", "+54 2964 12-3456", "02964 12-3456"],
      ["+5493543123456", "+54 9 3543 12-3456", "03543 15-12-3456"],
      ["+543543123456", "+54 3543 12-3456", "03543 12-3456"],
      ["+542202123456", "+54 2202 12-3456", "02202 12-3456"],
      // Áreas de 3 que empiezan como una de 4 («385», no «3856»): el error de 2.1.
      ["+5493856386236", "+54 9 385 638-6236", "0385 15-638-6236"], // Santiago del Estero
      ["+543435710161", "+54 343 571-0161", "0343 571-0161"], // Paraná
      ["+5492945968175", "+54 9 294 596-8175", "0294 15-596-8175"], // Bariloche
      ["+542646812028", "+54 264 681-2028", "0264 681-2028"], // San Juan
      ["+543584177580", "+54 358 417-7580", "0358 417-7580"], // Río Cuarto
      // Un celular de CABA cuyo número tiene «92» adentro no es un área de 4.
      ["+5491185679239", "+54 9 11 8567-9239", "011 15-8567-9239"],
      ["+5493425923590", "+54 9 342 592-3590", "0342 15-592-3590"], // Santa Fe
      // Especiales (0800, 0600): «$1-$2-$3».
      ["+548001234567", "+54 800-123-4567", "0800-123-4567"],
    ] as const) {
      expect(formatPhone(value)).toBe(international)
      expect(formatPhone(value, { country: "AR" })).toBe(national)
    }
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
