"use client"

import * as React from "react"

type TooltipModule = typeof import("../components/tooltip.js")

// El Tooltip de un Sidebar o un UserMenu colapsados. Solo colapsados muestran tooltips —abiertos,
// el texto está a la vista—, y el import estático metía el Tooltip de Base UI con todo su
// posicionamiento (floating-ui) en el arranque de cada página con Sidebar: ~43 KB gzip medidos en
// el sitio de docs, que nunca lo colapsa. Se pide recién cuando hace falta, una sola vez para
// todos los ítems: la promesa queda acá.
let tooltipCargado: TooltipModule | null = null
let tooltipPromesa: Promise<TooltipModule> | null = null
const cargarTooltip = () => (tooltipPromesa ??= import("../components/tooltip.js").then((mod) => (tooltipCargado = mod)))

function asignar<T>(ref: React.Ref<T> | undefined, valor: T | null) {
  if (typeof ref === "function") ref(valor)
  else if (ref) ref.current = valor
}

type TooltipLateralProps = {
  /** Si el tooltip se muestra: el contenedor está colapsado y hay algo que decir. */
  activo: boolean
  tip: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  /** El trigger. Tiene que aceptar `ref`: se usa para devolverle el foco. */
  children: React.ReactElement
}

/**
 * El trigger tal cual y, activo, con su tooltip.
 *
 * Mientras el módulo no llegó se muestra el trigger sin tooltip: se ve igual y su nombre accesible
 * no depende del tooltip. El estado arranca siempre en `null`, también si el módulo ya está en
 * memoria, porque así es el HTML del servidor y el primer render tiene que coincidir.
 *
 * Al llegar, el trigger pasa a ser el de Base UI —React lo monta de nuevo— y si tenía el foco lo
 * perdía, caído al `<body>`. Con un Sidebar colapsado guardado en una cookie eso pasaba en cada
 * carga. Por eso se mira si lo tenía antes del cambio y se le devuelve antes de pintar. Una vez
 * cargado, el árbol queda fijo: colapsar y expandir solo prende y apaga el tooltip (`disabled`),
 * sin volver a montar el trigger.
 */
function TooltipLateral({ activo, tip, side = "right", children }: TooltipLateralProps) {
  const [mod, setMod] = React.useState<TooltipModule | null>(null)
  const nodo = React.useRef<HTMLElement | null>(null)
  const teniaFoco = React.useRef(false)

  const adoptar = React.useCallback((cargado: TooltipModule) => {
    teniaFoco.current = nodo.current != null && nodo.current === document.activeElement
    setMod(cargado)
  }, [])

  // Si ya está en memoria (otro ítem lo pidió), se toma antes de pintar: el cambio de trigger no
  // llega a verse. Si no, se pide y se toma cuando llega.
  React.useLayoutEffect(() => {
    if (activo && !mod && tooltipCargado) adoptar(tooltipCargado)
  }, [activo, mod, adoptar])
  React.useEffect(() => {
    if (!activo || mod || tooltipCargado) return
    let vigente = true
    void cargarTooltip().then((cargado) => {
      if (vigente) adoptar(cargado)
    })
    return () => {
      vigente = false
    }
  }, [activo, mod, adoptar])

  React.useLayoutEffect(() => {
    if (!mod || !teniaFoco.current) return
    teniaFoco.current = false
    nodo.current?.focus({ preventScroll: true })
  }, [mod])

  // React 19: el `ref` de un elemento viaja en sus props. Se combina con el propio, no se pisa.
  const propio = (children.props as { ref?: React.Ref<HTMLElement> }).ref
  const refDelTrigger = React.useCallback(
    (valor: HTMLElement | null) => {
      nodo.current = valor
      asignar(propio, valor)
    },
    [propio]
  )
  const trigger = React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>, { ref: refDelTrigger })

  if (!mod) return trigger
  const { Tooltip, TooltipContent, TooltipTrigger } = mod
  return (
    <Tooltip disabled={!activo}>
      <TooltipTrigger render={trigger} />
      <TooltipContent side={side}>{tip}</TooltipContent>
    </Tooltip>
  )
}

export { TooltipLateral }
