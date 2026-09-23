// @vitest-environment node
import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"

describe("cn", () => {
  it("una clase de la escala tipográfica convive con un color de texto", () => {
    expect(cn("text-heading-32", "text-gray-1000")).toBe("text-heading-32 text-gray-1000")
  })

  it("entre dos clases de la escala gana la última", () => {
    expect(cn("text-copy-14", "text-copy-13")).toBe("text-copy-13")
  })

  it("las sombras de Geist son un solo grupo: la última gana", () => {
    expect(cn("shadow-menu", "shadow-modal")).toBe("shadow-modal")
  })

  it("descarta los valores falsy", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b")
  })
})
