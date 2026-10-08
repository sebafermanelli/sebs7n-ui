"use client"

import { defined } from "./defined.js"
import { useLabels, type Labels } from "../lib/labels.js"

type Group = "documentSheet" | "textDiff"

// Un texto interno de un Server Component que respeta el `LabelsProvider`: el componente sigue
// siendo del servidor y solo esta hoja es de cliente. Los defaults llegan por prop (ver
// `auth-client`): exportados de un módulo `"use client"` serían, en el server, una referencia.
export function LabelText<G extends Group>({
  group,
  name,
  defaults,
  labels,
}: {
  group: G
  name: keyof NonNullable<Labels[G]>
  defaults: NonNullable<Labels[G]>
  labels?: Partial<NonNullable<Labels[G]>>
}) {
  const merged: Record<string, unknown> = { ...defaults, ...useLabels()[group], ...defined(labels ?? {}) }
  return <>{merged[name as string] as string}</>
}
