"use client"

import { ArchiveIcon, FileTextIcon, InboxIcon, SendIcon } from "lucide-react"
import { useState } from "react"
import { List, ListRow } from "sebs7n-ui/list-row"
import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, SplitViewSidebar, useSplitView } from "sebs7n-ui/split-view"

const CARPETAS = [
  { id: "emitidas", nombre: "Emitidas", icono: SendIcon, total: 3 },
  { id: "recibidas", nombre: "Recibidas", icono: InboxIcon, total: 2 },
  { id: "archivo", nombre: "Archivo", icono: ArchiveIcon, total: 0 },
]

const FACTURAS = [
  { id: "0012", cliente: "Acme S.A.", fecha: "30/09", importe: "$ 128.400", detalle: "Servicios de septiembre" },
  { id: "0013", cliente: "Nube Digital", fecha: "28/09", importe: "$ 96.000", detalle: "Licencias anuales" },
  { id: "0014", cliente: "Estudio Ruiz", fecha: "21/09", importe: "$ 41.200", detalle: "Honorarios de agosto" },
]

function Facturas({ elegida, onElegir }: { elegida: string; onElegir: (id: string) => void }) {
  const { setPane } = useSplitView()
  return (
    <List aria-label="Facturas emitidas" className="p-2.5">
      {FACTURAS.map((factura) => (
        <ListRow
          description={factura.detalle}
          key={factura.id}
          onClick={() => {
            onElegir(factura.id)
            setPane("detail")
          }}
          selected={elegida === factura.id}
          title={factura.cliente}
          trailing={factura.fecha}
        />
      ))}
    </List>
  )
}

/**
 * Sidebar, lista y detalle
 * El master-detail de Mail: se acomoda al ancho que le toca. Ancho, los tres paneles; mediano, lista y detalle; angosto (el teléfono), un panel por vez y «‹ Atrás» vuelve al anterior. Achicá la ventana para verlo.
 */
export function Basico() {
  const [carpeta, setCarpeta] = useState("emitidas")
  const [elegida, setElegida] = useState("0012")
  const factura = FACTURAS.find((item) => item.id === elegida)!
  return (
    <div className="h-[440px] w-full overflow-hidden rounded-surface border border-separator-strong">
      <SplitView>
        <SplitViewSidebar aria-label="Carpetas">
          <List aria-label="Carpetas" className="p-2.5">
            {CARPETAS.map(({ id, nombre, icono: Icono, total }) => (
              <ListRow icon={<Icono />} key={id} onClick={() => setCarpeta(id)} selected={carpeta === id} title={nombre} trailing={total || undefined} />
            ))}
          </List>
        </SplitViewSidebar>
        <SplitViewList aria-label="Facturas">
          <header className="flex flex-col gap-0.5 px-5 pt-3 pb-1">
            <SplitViewBack>Carpetas</SplitViewBack>
            <h3 className="text-title-2">Emitidas</h3>
            <p className="text-callout text-label-secondary">3 facturas, 1 sin cobrar</p>
          </header>
          <Facturas elegida={elegida} onElegir={setElegida} />
        </SplitViewList>
        <SplitViewDetail aria-label="Factura">
          <div className="flex flex-col gap-4 p-5">
            <SplitViewBack>Facturas</SplitViewBack>
            <div className="flex items-center gap-3">
              <FileTextIcon aria-hidden="true" className="size-8 text-brand-900" />
              <div>
                <h3 className="text-title-1">Factura {factura.id}</h3>
                <p className="text-callout text-label-secondary">
                  {factura.cliente} · {factura.fecha}
                </p>
              </div>
            </div>
            <p className="text-body">{factura.detalle}</p>
            <p className="text-title-3 tabular-nums">{factura.importe}</p>
          </div>
        </SplitViewDetail>
      </SplitView>
    </div>
  )
}
