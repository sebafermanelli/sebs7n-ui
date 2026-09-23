import { describe, expect, it } from "vitest"

import { fieldValidator, validate, type StandardSchemaV1 } from "../src/lib/schema.js"

/**
 * Los schemas de prueba se escriben a mano contra la interfaz de Standard
 * Schema en vez de instalar Zod: lo que se prueba acá es que el puente hable
 * bien la interfaz, no que Zod funcione. Y así el test no queda atado a la
 * versión de una librería que el paquete ni siquiera depende.
 */
type Resultado<Output> = { value: Output } | { issues: Array<{ message: string; path?: Array<PropertyKey | { key: PropertyKey }> }> }

function schema<Output>(
  validador: (value: unknown) => Resultado<Output> | Promise<Resultado<Output>>
): StandardSchemaV1<unknown, Output> {
  return { "~standard": { version: 1, vendor: "test", validate: validador } }
}

describe("validate", () => {
  it("devuelve el valor parseado por el schema, no el original", async () => {
    // Un schema que recorta espacios: lo que sirve mandar al servidor es la
    // salida del schema, no lo que se tipeó.
    const recorta = schema((value) => ({ value: { email: String((value as any).email).trim() } }))

    const resultado = await validate(recorta, { email: "  hola@acme.com  " })

    expect(resultado).toEqual({ ok: true, value: { email: "hola@acme.com" } })
  })

  it("agrupa los errores por nombre de campo", async () => {
    const roto = schema(() => ({
      issues: [
        { message: "Revisá el email", path: ["email"] },
        { message: "Mínimo 8 caracteres", path: ["password"] },
        { message: "Usá una mayúscula", path: ["password"] },
      ],
    }))

    const resultado = await validate(roto, {})

    expect(resultado).toEqual({
      ok: false,
      errors: { email: ["Revisá el email"], password: ["Mínimo 8 caracteres", "Usá una mayúscula"] },
    })
  })

  it("une los caminos anidados con puntos, como el name del Field", async () => {
    const roto = schema(() => ({
      issues: [
        { message: "Falta la calle", path: ["domicilio", "calle"] },
        { message: "La cantidad va de a uno", path: ["items", 0, "cantidad"] },
      ],
    }))

    const resultado = await validate(roto, {})

    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(Object.keys(resultado.errors)).toEqual(["domicilio.calle", "items.0.cantidad"])
  })

  it("acepta los segmentos con forma de objeto que usa la especificación", async () => {
    // Standard Schema permite reportar cada segmento como `{ key }` con
    // metadatos al lado; Valibot lo hace así.
    const roto = schema(() => ({ issues: [{ message: "Falta", path: [{ key: "domicilio" }, { key: "calle" }] }] }))

    const resultado = await validate(roto, {})

    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errors).toEqual({ "domicilio.calle": ["Falta"] })
  })

  it("deja bajo la clave vacía el error que no es de ningún campo", async () => {
    // Una regla que cruza dos campos —"las fechas están al revés"— no tiene un
    // input culpable: va arriba del formulario, no pegada a uno.
    const roto = schema(() => ({ issues: [{ message: "La devolución va después del retiro" }] }))

    const resultado = await validate(roto, {})

    expect(resultado.ok).toBe(false)
    if (resultado.ok) return
    expect(resultado.errors).toEqual({ "": ["La devolución va después del retiro"] })
  })

  it("espera a los schemas asíncronos", async () => {
    const tarda = schema(async (value) => {
      await new Promise((r) => setTimeout(r, 1))
      return (value as any).email === "tomado@acme.com"
        ? { issues: [{ message: "Ese email ya está usado", path: ["email"] }] }
        : { value: value as { email: string } }
    }) as StandardSchemaV1<unknown, { email: string }>

    await expect(validate(tarda, { email: "tomado@acme.com" })).resolves.toEqual({
      ok: false,
      errors: { email: ["Ese email ya está usado"] },
    })
    await expect(validate(tarda, { email: "libre@acme.com" })).resolves.toEqual({
      ok: true,
      value: { email: "libre@acme.com" },
    })
  })
})

describe("fieldValidator", () => {
  it("devuelve null cuando el valor es válido", async () => {
    const validador = fieldValidator(schema((value) => ({ value })))

    await expect(validador("hola@acme.com")).resolves.toBeNull()
  })

  it("devuelve los mensajes en el orden en que los reportó el schema", async () => {
    const validador = fieldValidator(
      schema(() => ({ issues: [{ message: "Muy corta" }, { message: "Le falta un número" }] }))
    )

    await expect(validador("abc")).resolves.toEqual(["Muy corta", "Le falta un número"])
  })
})
