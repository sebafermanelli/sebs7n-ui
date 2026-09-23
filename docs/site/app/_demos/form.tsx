"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { validate, type StandardSchemaV1 } from "sebs7n-ui/lib/schema"

/**
 * Los valores llegan juntados por `name`
 * Sin `FormData`, sin un `useState` por campo y sin librería de formularios. Cada `Field` aporta su `name` y el submit recibe el objeto armado.
 */
export function Valores() {
  const [enviado, setEnviado] = useState<Record<string, unknown> | null>(null)

  return (
    <Form className="w-full max-w-sm" onFormSubmit={(valores) => setEnviado(valores)}>
      <Field name="nombre">
        <FieldLabel required>Nombre</FieldLabel>
        <Input required />
      </Field>
      <Field name="empresa">
        <FieldLabel>Empresa</FieldLabel>
        <Input />
      </Field>
      <Button type="submit">Enviar</Button>
      {enviado && (
        <pre className="rounded-md bg-background-200 p-3 text-copy-13-mono text-gray-900">
          {JSON.stringify(enviado, null, 2)}
        </pre>
      )}
    </Form>
  )
}

/**
 * Validar con un schema
 * `sebs7n-ui/lib/schema` traduce cualquier schema que implemente Standard Schema —Zod, Valibot, ArkType— a los errores que espera `Form`. El paquete no depende de ninguna de las tres: habla la interfaz, no la librería.
 */
export function ConSchema() {
  const [errors, setErrors] = useState({})

  // En una app esto sería `z.object({ ... })`. Acá va a mano para que el sitio
  // de documentación no tenga que instalar Zod solo para un ejemplo.
  const esquema: StandardSchemaV1<unknown, { email: string; edad: number }> = {
    "~standard": {
      version: 1,
      vendor: "demo",
      validate: (valores) => {
        const { email, edad } = valores as { email: string; edad: string }
        const issues = []
        if (!email?.includes("@")) issues.push({ message: "Revisá el email", path: ["email"] })
        if (!Number(edad)) issues.push({ message: "Poné un número", path: ["edad"] })
        else if (Number(edad) < 18) issues.push({ message: "Tenés que ser mayor de edad", path: ["edad"] })
        return issues.length > 0 ? { issues } : { value: { email, edad: Number(edad) } }
      },
    },
  }

  return (
    <Form
      className="w-full max-w-sm"
      errors={errors}
      onFormSubmit={async (valores) => {
        const resultado = await validate(esquema, valores)
        // Si pasa, `resultado.value` ya viene parseado por el schema: `edad` es
        // un número, no el string que devuelve el input.
        setErrors(resultado.ok ? {} : resultado.errors)
      }}
    >
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
        <FieldError />
      </Field>
      <Field name="edad">
        <FieldLabel>Edad</FieldLabel>
        <Input inputMode="numeric" />
        <FieldDescription>Probá con 15 para ver el error.</FieldDescription>
        <FieldError />
      </Field>
      <Button type="submit">Validar</Button>
    </Form>
  )
}
