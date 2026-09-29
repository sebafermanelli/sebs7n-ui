"use client"

import * as React from "react"

/**
 * Llama a `onReset` cuando el formulario del campo se resetea (`form.reset()` o un
 * `<button type="reset">`). El reset nativo vuelve cada `<input>` a su valor por defecto, pero no
 * sabe del estado de React: sin esto, un campo con estado propio (la hora tipeada, el país, la barra
 * de seguridad) o un `<input type="hidden">` controlado quedaban con el valor de antes.
 *
 * Devuelve un ref para el contenedor del campo (o su `<input>`): el formulario sale del `.form` del
 * primer `<input>`, que también respeta el atributo `form="…"`, o del `<form>` que lo envuelve.
 */
export function useFormReset(onReset: () => void): (element: HTMLElement | null) => void {
  const [element, setElement] = React.useState<HTMLElement | null>(null)
  const latest = React.useRef(onReset)
  React.useEffect(() => {
    latest.current = onReset
  })
  React.useEffect(() => {
    const input = element instanceof HTMLInputElement ? element : element?.querySelector("input")
    const form = input?.form ?? element?.closest("form")
    if (!form) return
    const handle = () => latest.current()
    form.addEventListener("reset", handle)
    return () => form.removeEventListener("reset", handle)
  }, [element])
  return setElement
}
