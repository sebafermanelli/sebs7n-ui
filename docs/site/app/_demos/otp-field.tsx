"use client"

import { useState } from "react"
import { Button } from "sebs7n-ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { OTPField } from "sebs7n-ui/otp-field"

/**
 * Verificar un mail
 * `onValueComplete` avisa cuando entra el último dígito: en un código de seis
 * cifras el botón "Continuar" sobra, porque no hay nada más que decidir.
 */
export function VerificarMail() {
  const [codigo, setCodigo] = useState("")
  const verificado = codigo === "482913"
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field name="codigo">
        <FieldLabel>Código de verificación</FieldLabel>
        <OTPField onValueComplete={setCodigo} />
        <FieldDescription>Te lo mandamos a hola@acme.com. Probá con 482913.</FieldDescription>
      </Field>
      {codigo.length === 6 && (
        <p className={verificado ? "text-copy-13 text-blue-900" : "text-copy-13 text-red-900"}>
          {verificado ? "Mail verificado." : "Ese código no es el que mandamos."}
        </p>
      )}
    </div>
  )
}

/**
 * 2FA al entrar
 * El código viaja como un solo valor bajo el `name` del campo. Si está
 * incompleto, el formulario no sale: lo valida el input escondido que tiene el
 * código entero, no cada casilla por separado.
 */
export function DosFactores() {
  const [enviado, setEnviado] = useState("")
  return (
    <Form className="flex w-full max-w-sm flex-col gap-4" onFormSubmit={(valores) => setEnviado(String(valores.codigo))}>
      <Field name="codigo" validate={(valor) => (String(valor).length === 6 ? null : "Faltan dígitos: el código tiene seis.")}>
        <FieldLabel required>Código de tu app de autenticación</FieldLabel>
        <OTPField />
        <FieldError />
      </Field>
      <Button type="submit">Entrar</Button>
      {enviado && <p className="text-copy-13 text-gray-900">Se envió {enviado}.</p>}
    </Form>
  )
}

/**
 * Otros largos y tamaños
 * `length` cambia la cantidad de casillas; `size` usa las mismas alturas que
 * `Input`, para que un OTP en medio de un formulario no desentone.
 */
export function LargosYTamanos() {
  return (
    <div className="flex flex-col gap-4">
      <OTPField aria-label="Código de cuatro dígitos" length={4} size="sm" />
      <OTPField aria-label="Código de seis dígitos" />
      <OTPField aria-label="Código de ocho dígitos" length={8} size="lg" />
    </div>
  )
}
