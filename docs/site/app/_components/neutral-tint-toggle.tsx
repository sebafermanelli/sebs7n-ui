"use client"

import * as React from "react"
import { Switch } from "sebs7n-ui/switch"

/**
 * Prende `data-neutral-tint` en `<html>` mientras la página está abierta, para ver los neutros inclinados hacia la
 * marca. Al salir de la página (o al apagarlo) se saca: el resto del sitio no cambia.
 */
export function NeutralTintToggle() {
  const [on, setOn] = React.useState(false)
  React.useEffect(() => {
    const root = document.documentElement
    if (on) root.setAttribute("data-neutral-tint", "")
    else root.removeAttribute("data-neutral-tint")
    return () => root.removeAttribute("data-neutral-tint")
  }, [on])
  return (
    <label className="flex w-fit cursor-pointer items-center gap-3 text-callout text-label">
      <Switch checked={on} onCheckedChange={setOn} />
      Neutros con tinte de marca
    </label>
  )
}
