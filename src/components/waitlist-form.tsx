"use client"

import * as React from "react"

import { defined } from "../internal/defined.js"
import { cn } from "../lib/utils.js"
import { Alert, AlertDescription, AlertTitle } from "./alert.js"
import { Button } from "./button.js"
import { Field, FieldError, FieldLabel } from "./field.js"
import { Form, type FormProps } from "./form.js"
import { Input } from "./input.js"

/**
 * Un formulario de lista de espera para una landing: email, campos opcionales, el aviso de consentimiento
 * y los estados de enviando, error y éxito. **No hace red**: el `onSubmit` es tuyo.
 *
 * ```tsx
 * <WaitlistForm
 *   consent="Al anotarte aceptás recibir un aviso cuando abramos. Podés darte de baja cuando quieras."
 *   fields={[{ name: "team", label: "Nombre del equipo" }]}
 *   onSubmit={async (values) => {
 *     const response = await fetch("/api/waitlist", { method: "POST", body: JSON.stringify(values) })
 *     if (!response.ok) throw new Error("No pudimos anotarte. Probá de nuevo en un rato.")
 *   }}
 * />
 * ```
 *
 * - **Estados**: mientras el `onSubmit` no termina, el botón queda en `loading`; si lo que devuelve
 *   se resuelve, se ve el éxito; si falla (`throw`), el `Error.message` va a un `Alert` de error y el
 *   formulario sigue editable. `status` controla el estado desde afuera (gana al interno).
 * - **Valida solo lo registrado como `Field`**: el email es `required` y `type="email"`, con sus mensajes
 *   en español (`labels`). Los campos de `fields` se registran igual.
 * - **`size="lg"`** por defecto, heredado por todos los controles (`Form size`).
 * - **`turnstile`**: un slot para el desafío anti-bot de la app (Turnstile, hCaptcha): se dibuja entre los
 *   campos y el botón. Su token lo lee la app; el paquete no lo conoce.
 * - **`honeypot`**: el nombre de un campo trampa, oculto a la vista, al lector y al teclado. Si un bot lo
 *   llena, llega en `values[honeypot]`; descartarlo es de la app.
 */
type WaitlistField = {
  /** El `name` del campo: la clave en `values`. */
  name: string
  label: string
  type?: "text" | "email" | "tel" | "url"
  required?: boolean
  placeholder?: string
  autoComplete?: string
}

type WaitlistFormLabels = {
  /** La etiqueta del email. */
  email: string
  /** El placeholder del email. */
  emailPlaceholder: string
  /** El texto del botón. */
  submit: string
  /** Falta el email. */
  emailRequired: string
  /** El email no es un email. */
  emailInvalid: string
  /** Falta un campo opcional marcado `required`. */
  required: string
  /** El título del éxito. */
  successTitle: string
  /** El detalle del éxito. */
  successDescription: string
  /** El título del error. */
  errorTitle: string
  /** El detalle del error si el `onSubmit` falla sin mensaje. */
  errorDescription: string
}

/** Los textos por defecto (el componente es solo por subpath: no están en `defaultLabels`). */
const waitlistFormLabels: WaitlistFormLabels = {
  email: "Email",
  emailPlaceholder: "tu@email.com",
  submit: "Sumarme a la lista",
  emailRequired: "Escribí tu email",
  emailInvalid: "Revisá el email: falta algo",
  required: "Completá este campo",
  successTitle: "Listo, te anotamos",
  successDescription: "Te escribimos al abrir.",
  errorTitle: "No pudimos anotarte",
  errorDescription: "Probá de nuevo en un rato.",
}

type WaitlistValues = { email: string } & Record<string, string>

type WaitlistFormProps = Omit<FormProps, "onSubmit" | "onFormSubmit" | "children" | "errors"> & {
  /** Recibe los valores ya validados. Si lanza o rechaza, se ve el error; si termina, el éxito. */
  onSubmit: (values: WaitlistValues) => void | Promise<void>
  /** Campos opcionales además del email, en orden. */
  fields?: WaitlistField[]
  /** El aviso de consentimiento, bajo el botón. */
  consent?: React.ReactNode
  /** Un slot para el desafío anti-bot (Turnstile…), entre los campos y el botón. */
  turnstile?: React.ReactNode
  /** El nombre de un campo trampa (honeypot), oculto para personas. */
  honeypot?: string
  /** Controla el estado desde afuera. Gana al interno. */
  status?: "idle" | "submitting" | "success" | "error"
  /** El mensaje del error cuando `status="error"` (o el que viene del `onSubmit`). */
  error?: string
  /** Lo que se ve en el éxito en lugar del aviso por defecto. */
  success?: React.ReactNode
  /** Cambia los textos internos. */
  labels?: Partial<WaitlistFormLabels>
}

function WaitlistForm({
  onSubmit,
  fields = [],
  consent,
  turnstile,
  honeypot,
  status: statusProp,
  error: errorProp,
  success,
  labels: labelsProp,
  size = "lg",
  className,
  ...props
}: WaitlistFormProps) {
  const labels = { ...waitlistFormLabels, ...defined(labelsProp) }
  const [state, setState] = React.useState<"idle" | "submitting" | "success" | "error">("idle")
  const [message, setMessage] = React.useState<string | undefined>()
  const status = statusProp ?? state
  const errorMessage = errorProp ?? message ?? labels.errorDescription
  const uid = React.useId()

  if (status === "success") {
    return (
      <Alert className={className} data-slot="waitlist-form" data-status="success" role="status" variant="success">
        <AlertTitle>{labels.successTitle}</AlertTitle>
        <AlertDescription>{success ?? labels.successDescription}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Form
      className={cn("relative w-full", className)}
      data-slot="waitlist-form"
      data-status={status}
      onFormSubmit={async (values) => {
        setState("submitting")
        setMessage(undefined)
        try {
          await onSubmit(values as WaitlistValues)
          setState("success")
        } catch (caught) {
          setMessage(caught instanceof Error && caught.message ? caught.message : undefined)
          setState("error")
        }
      }}
      size={size}
      {...props}
    >
      {status === "error" && (
        <Alert variant="error">
          <AlertTitle>{labels.errorTitle}</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Field name="email">
        <FieldLabel required>{labels.email}</FieldLabel>
        <Input autoComplete="email" placeholder={labels.emailPlaceholder} required type="email" />
        <FieldError match="valueMissing">{labels.emailRequired}</FieldError>
        <FieldError match="typeMismatch">{labels.emailInvalid}</FieldError>
      </Field>
      {fields.map((field) => (
        <Field key={field.name} name={field.name}>
          <FieldLabel required={field.required}>{field.label}</FieldLabel>
          <Input autoComplete={field.autoComplete} placeholder={field.placeholder} required={field.required} type={field.type ?? "text"} />
          {field.required && <FieldError match="valueMissing">{labels.required}</FieldError>}
        </Field>
      ))}
      {honeypot && (
        // Un campo trampa: fuera de pantalla, sin foco y sin lector. Una persona no lo ve ni lo llena.
        <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${uid}-hp`}>{honeypot}</label>
          <input autoComplete="off" id={`${uid}-hp`} name={honeypot} tabIndex={-1} type="text" />
        </div>
      )}
      {turnstile}
      <div className="flex flex-col gap-3">
        <Button className="w-full" loading={status === "submitting"} type="submit">
          {labels.submit}
        </Button>
        {consent != null && <p className="text-footnote text-label-secondary">{consent}</p>}
      </div>
    </Form>
  )
}

export { WaitlistForm, waitlistFormLabels, type WaitlistField, type WaitlistFormLabels, type WaitlistFormProps, type WaitlistValues }
