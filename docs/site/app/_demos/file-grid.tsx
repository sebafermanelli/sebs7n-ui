"use client"

import { useState } from "react"
import { ContextMenuItem, ContextMenuSeparator } from "sebs7n-ui/context-menu"
import { FileGrid, type FileGridItem } from "sebs7n-ui/file-grid"

// Miniaturas generadas acá mismo (sin imágenes externas): una hoja con líneas, como un PDF chico.
const hoja = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="80"><rect width="60" height="80" fill="#fff"/><rect x="8" y="10" width="30" height="6" fill="${color}"/><g fill="#c7c7cc"><rect x="8" y="26" width="44" height="3"/><rect x="8" y="34" width="44" height="3"/><rect x="8" y="42" width="36" height="3"/><rect x="8" y="58" width="20" height="3"/></g></svg>`
  )}`

const ARCHIVOS: FileGridItem[] = [
  { id: "facturas", name: "Facturas", kind: "24 ítems", folder: true },
  { id: "recibos", name: "Recibos", kind: "8 ítems", folder: true },
  { id: "f-0012", name: "Factura 0012.pdf", kind: "128 KB", thumbnail: <img alt="" src={hoja("#0071e3")} /> },
  { id: "f-0013", name: "Factura 0013.pdf", kind: "96 KB", thumbnail: <img alt="" src={hoja("#0071e3")} /> },
  { id: "nc-0003", name: "Nota de crédito 0003.pdf", kind: "54 KB", thumbnail: <img alt="" src={hoja("#ff9f0a")} /> },
  { id: "resumen", name: "Resumen anual.xlsx", kind: "44 KB" },
]

/** El mismo juego de ítems para el «…», el click derecho y Shift+F10; `selected` dice sobre cuáles actúa. */
function acciones(item: FileGridItem, selected: FileGridItem[]) {
  const cuantos = selected.length > 1 ? ` ${selected.length} elementos` : ""
  return (
    <>
      {selected.length === 1 && <ContextMenuItem>Abrir «{item.name}»</ContextMenuItem>}
      <ContextMenuItem>{`Descargar${cuantos}`}</ContextMenuItem>
      <ContextMenuItem>{`Compartir${cuantos}…`}</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive">{`Eliminar${cuantos}`}</ContextMenuItem>
    </>
  )
}

/**
 * La vista de íconos
 * Miniaturas con el filo de 1 px de Drive, nombre y tipo abajo, una caja gris con el puntero y la misma caja con un borde del acento en la elegida. Flechas en dos dimensiones y Enter abre. `menu` da las acciones: las abre el «…» (en el ítem con el puntero o con el foco), el click derecho y, con teclado, Shift+F10 o la tecla de menú.
 */
export function Basico() {
  return <FileGrid aria-label="Archivos" defaultSelected="f-0012" items={ARCHIVOS} menu={acciones} />
}

/**
 * Varios elegidos
 * `selectionMode="multiple"`: ⌘ (o Ctrl) + click suma o saca, ⇧ + click elige el rango y ⌘A todos. Con el teclado, las flechas mueven sin elegir, Espacio suma o saca y ⇧ + flechas extiende en el orden de la grilla. El menú sobre un elegido actúa sobre toda la selección («Descargar 3 elementos»); sobre otro, lo elige solo.
 */
export function Varios() {
  const [selected, setSelected] = useState<string[]>(["f-0012", "f-0013", "nc-0003"])
  return (
    <div className="flex w-full flex-col gap-3">
      <FileGrid aria-label="Archivos" items={ARCHIVOS} menu={acciones} onSelectedChange={(ids) => setSelected(ids)} selected={selected} selectionMode="multiple" />
      <p className="text-callout text-label-secondary" role="status">
        {selected.length === 1 ? "1 elegido" : `${selected.length} elegidos`}
      </p>
    </div>
  )
}
