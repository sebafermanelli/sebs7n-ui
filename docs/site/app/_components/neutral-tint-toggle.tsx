"use client"

import * as React from "react"
import { Switch } from "sebs7n-ui/switch"

/**
 * Compara los neutros con y sin tinte: apagado, pone `data-neutral-tint="off"` en `<html>` mientras la página está
 * abierta. Al salir (o al volver a prenderlo) se saca: el resto del sitio queda con el tinte, que es el default.
 */
export function NeutralTintToggle() {
  const [on, setOn] = React.useState(true)
  React.useEffect(() => {
    const root = document.documentElement
    if (on) root.removeAttribute("data-neutral-tint")
    else root.setAttribute("data-neutral-tint", "off")
    return () => root.removeAttribute("data-neutral-tint")
  }, [on])
  return (
    <label className="flex w-fit cursor-pointer items-center gap-3 text-callout text-label">
      <Switch checked={on} onCheckedChange={setOn} />
      Neutros con tinte de marca
    </label>
  )
}
