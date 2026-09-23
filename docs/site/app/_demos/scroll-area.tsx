"use client"

import { ScrollArea } from "sebs7n-ui/scroll-area"
import { Separator } from "sebs7n-ui/separator"

const MOVIMIENTOS = [
  { fecha: "01/09", detalle: "Factura 0012 · Acme S.A.", monto: "+ $ 128.400" },
  { fecha: "01/09", detalle: "Hosting · Vercel", monto: "− $ 18.400" },
  { fecha: "29/08", detalle: "Factura 0011 · Bruma SRL", monto: "+ $ 96.000" },
  { fecha: "27/08", detalle: "Honorarios contables", monto: "− $ 45.000" },
  { fecha: "24/08", detalle: "Factura 0010 · Cortina SA", monto: "+ $ 212.000" },
  { fecha: "21/08", detalle: "Dominio · anual", monto: "− $ 22.800" },
  { fecha: "18/08", detalle: "Factura 0009 · Delta", monto: "+ $ 74.500" },
  { fecha: "15/08", detalle: "Impuesto al cheque", monto: "− $ 3.120" },
  { fecha: "12/08", detalle: "Factura 0008 · Acme S.A.", monto: "+ $ 128.400" },
  { fecha: "09/08", detalle: "Sueldos", monto: "− $ 640.000" },
]

/**
 * Una lista larga dentro de un panel
 * La caja necesita un alto propio: sin límite no hay desborde y no hay nada que scrollear. El padding va en `contentClassName`, no en el viewport, para que el contenido no se corte contra la barra.
 */
export function Basico() {
  return (
    <ScrollArea className="h-56 w-full max-w-sm rounded-xl border border-gray-400 bg-background-100" contentClassName="p-3">
      <div className="flex flex-col">
        {MOVIMIENTOS.map((movimiento, indice) => (
          <div key={movimiento.detalle + movimiento.fecha}>
            {indice > 0 && <Separator className="my-2" />}
            <div className="flex items-baseline justify-between gap-4">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-copy-14 text-gray-1000">{movimiento.detalle}</span>
                <span className="text-copy-13 text-gray-900">{movimiento.fecha}</span>
              </div>
              <span className="shrink-0 text-copy-13-mono text-gray-900">{movimiento.monto}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

/**
 * Los dos ejes
 * `orientation="both"` agrega la barra de abajo y la esquina entre las dos. Se pone solo cuando de verdad desborda en los dos ejes; si no, sobra una barra.
 */
export function DosEjes() {
  const columnas = ["Cliente", "CUIT", "Condición IVA", "Provincia", "Último pago", "Saldo"]
  const filas = [
    ["Acme S.A.", "30-71234567-8", "Responsable Inscripto", "Santa Fe", "01/09/2026", "$ 0"],
    ["Bruma SRL", "30-71987654-3", "Monotributo", "Buenos Aires", "29/08/2026", "$ 96.000"],
    ["Cortina SA", "30-70111222-9", "Responsable Inscripto", "Córdoba", "24/08/2026", "$ 0"],
    ["Delta", "27-33444555-1", "Exento", "Mendoza", "18/08/2026", "$ 74.500"],
    ["Everest SRL", "30-71555444-2", "Monotributo", "Santa Fe", "11/08/2026", "$ 33.900"],
    ["Fénix SA", "30-70999888-7", "Responsable Inscripto", "Neuquén", "04/08/2026", "$ 128.000"],
  ]
  return (
    <ScrollArea
      className="h-48 w-full max-w-sm rounded-xl border border-gray-400 bg-background-100"
      contentClassName="p-3"
      orientation="both"
    >
      <table className="w-max border-separate border-spacing-x-6 border-spacing-y-1 text-left">
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th className="text-label-12 whitespace-nowrap text-gray-900" key={columna} scope="col">
                {columna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila[0]}>
              {fila.map((celda) => (
                <td className="text-copy-14 whitespace-nowrap text-gray-1000" key={celda}>
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}

/**
 * Solo horizontal
 * Una fila de tarjetas que se corre de costado. Con `orientation="horizontal"` no se dibuja la barra vertical, que acá no tendría nada que hacer.
 */
export function Horizontal() {
  const meses = ["Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre"]
  return (
    <ScrollArea className="w-full max-w-sm" contentClassName="pb-3" orientation="horizontal">
      <div className="flex w-max gap-3">
        {meses.map((mes, indice) => (
          <div className="flex w-40 flex-col gap-1 rounded-xl border border-gray-400 bg-background-100 p-4" key={mes}>
            <span className="text-label-12 text-gray-900">{mes}</span>
            <span className="text-heading-20 text-gray-1000">$ {(420 + indice * 37).toLocaleString("es-AR")}k</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
