// @vitest-environment node
import { describe, expect, it } from "vitest"

import { cn } from "../src/lib/utils"

describe("cn", () => {
  it("una clase de la escala tipográfica convive con un color de texto", () => {
    expect(cn("text-heading-32", "text-label")).toBe("text-heading-32 text-label")
  })

  it("entre dos clases de la escala gana la última", () => {
    expect(cn("text-copy-14", "text-copy-13")).toBe("text-copy-13")
  })

  it("las sombras de Geist son un solo grupo: la última gana", () => {
    expect(cn("shadow-menu", "shadow-modal")).toBe("shadow-modal")
  })

  // Los cuatro anillos pintan el mismo `box-shadow`: con dos, gana el que Tailwind haya emitido
  // último, que no se elige. `cn()` deja el que se pasó después.
  it("focus-ring, focus-ring-inverse, focus-border y focus-border-error son un solo grupo", () => {
    expect(cn("focus-visible:focus-ring", "focus-visible:focus-border")).toBe("focus-visible:focus-border")
    expect(cn("focus-border", "focus-border-error")).toBe("focus-border-error")
    expect(cn("focus-border-error", "focus-ring-inverse")).toBe("focus-ring-inverse")
  })

  it("descarta los valores falsy", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b")
  })
})
