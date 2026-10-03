"use client"

import { useState } from "react"
import { Field, FieldLabel } from "sebs7n-ui/field"
import { Form } from "sebs7n-ui/form"
import { Input } from "sebs7n-ui/input"
import { SaveBar } from "sebs7n-ui/save-bar"

/**
 * Cambios sin guardar
 * Fija abajo, a todo el ancho del contenido: el estado a la izquierda con ícono y texto, «Descartar» y «Guardar» a la derecha.
 */
export function Basic() {
  const [name, setName] = useState("Equipo de ejemplo")
  const [saved, setSaved] = useState("Equipo de ejemplo")
  const [pending, setPending] = useState(false)
  return (
    <Form
      className="flex w-full flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        setPending(true)
        setTimeout(() => {
          setSaved(name)
          setPending(false)
        }, 600)
      }}
    >
      <Field name="name">
        <FieldLabel>Nombre de la empresa</FieldLabel>
        <Input onChange={(event) => setName(event.target.value)} value={name} />
      </Field>
      <SaveBar dirty={name !== saved} onDiscard={() => setName(saved)} pending={pending} />
    </Form>
  )
}
