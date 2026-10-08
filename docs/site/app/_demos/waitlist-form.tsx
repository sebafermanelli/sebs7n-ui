"use client"

import { WaitlistForm } from "sebs7n-ui/waitlist-form"

/**
 * Lista de espera
 * Email, un campo opcional y el aviso de consentimiento. El `onSubmit` es de la app: acá espera un segundo y listo; si lanza, el mensaje se ve en el alert.
 */
export function Basic() {
  return (
    <div className="w-full max-w-md">
      <WaitlistForm
        consent="Al anotarte aceptás recibir un aviso cuando abramos. Podés darte de baja cuando quieras."
        fields={[{ name: "team", label: "Nombre del equipo", autoComplete: "organization" }]}
        onSubmit={async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }}
      />
    </div>
  )
}

/**
 * Con error del servidor
 * Si el `onSubmit` lanza, el formulario sigue editable y muestra el mensaje.
 */
export function WithError() {
  return (
    <div className="w-full max-w-md">
      <WaitlistForm
        onSubmit={async () => {
          throw new Error("El servicio no responde. Probá de nuevo en un rato.")
        }}
      />
    </div>
  )
}
