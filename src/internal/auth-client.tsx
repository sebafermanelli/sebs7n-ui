"use client"

import * as React from "react"

import { defined } from "./defined.js"
import { useLabels, type Labels } from "../lib/labels.js"

/**
 * Las dos piezas de `AuthLayout` que necesitan el cliente: el texto del separador (lee el
 * `LabelsProvider`, un contexto) y el foco inicial (un efecto). Viven acá, con la directiva, para
 * que `sebs7n-ui/auth-layout` se quede sin ella y la pantalla entera se pueda renderizar desde un
 * Server Component —el mismo criterio que `page-header-breadcrumb`—.
 */

type AuthLabels = NonNullable<Labels["auth"]>

// Los defaults llegan por prop y no se importan de acá: un valor exportado de un módulo
// `"use client"` es, en el server, una referencia de cliente y no el objeto.
export function AuthDividerText({ defaults, labels }: { defaults: AuthLabels; labels?: Partial<AuthLabels> }) {
  return <>{{ ...defaults, ...useLabels().auth, ...defined(labels) }.or}</>
}

// Un campo que se escribe o se elige, no un botón: el de «Continuar con Google» va antes del
// formulario y no es lo que la persona vino a completar.
const FIELD = "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [role=combobox]:not([aria-disabled=true])"

/**
 * Enfoca el primer campo del contenedor al montar. Un `<span hidden>` que busca en su padre: así
 * `AuthContent` no pasa a ser de cliente por una sola línea de efecto.
 */
export function FocusFirstField() {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    const field = ref.current?.parentElement?.querySelector<HTMLElement>(FIELD)
    field?.focus()
  }, [])
  return <span ref={ref} hidden data-slot="auth-focus-first" />
}
