// @vitest-environment node
import { describe, expect, it } from "vitest"

import { diffWords } from "../src/lib/text-diff"

describe("diffWords", () => {
  it("marca lo quitado y lo agregado por palabra, y junta lo contiguo", () => {
    expect(diffWords("Pago a 30 días", "Pago a 60 días")).toEqual([
      { type: "equal", value: "Pago a " },
      { type: "delete", value: "30" },
      { type: "insert", value: "60" },
      { type: "equal", value: " días" },
    ])
  })

  it("textos iguales: una sola parte igual; vacío contra algo: todo insertado", () => {
    expect(diffWords("Factura emitida", "Factura emitida")).toEqual([{ type: "equal", value: "Factura emitida" }])
    expect(diffWords("", "Nota de crédito")).toEqual([{ type: "insert", value: "Nota de crédito" }])
    expect(diffWords("Nota", "")).toEqual([{ type: "delete", value: "Nota" }])
  })

  it("reconstruye los dos textos", () => {
    const from = "El cliente paga el total en dos cuotas sin interés"
    const to = "El cliente abona el total en tres cuotas"
    const parts = diffWords(from, to)
    expect(parts.filter((p) => p.type !== "insert").map((p) => p.value).join("")).toBe(from)
    expect(parts.filter((p) => p.type !== "delete").map((p) => p.value).join("")).toBe(to)
  })
})
