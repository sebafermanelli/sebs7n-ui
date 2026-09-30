// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// 2.4: los avisos de desarrollo se caen del bundle de producción solo si el chequeo es
// `process.env.NODE_ENV` literal en el `if`. Adentro de una función con `typeof process` el
// minificador no lo plegaba y los mensajes viajaban en el barrel (≈ 0,3 kB).
const fuente = (archivo: string) => readFileSync(join(import.meta.dirname, "..", "src", archivo), "utf8")

describe("los avisos de desarrollo no llegan a producción", () => {
  it.each(["internal/dialog-name-warning.ts", "internal/page-header-breadcrumb.tsx"])("%s", (archivo) => {
    const codigo = fuente(archivo)
    expect(codigo).toContain('process.env.NODE_ENV === "production"')
    expect(codigo).not.toMatch(/typeof process !==/)
  })
})
