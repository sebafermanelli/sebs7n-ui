"use client"

import {
  ArchiveIcon,
  FileTextIcon,
  FilterIcon,
  FlagIcon,
  FolderIcon,
  ForwardIcon,
  InboxIcon,
  PaperclipIcon,
  ReplyIcon,
  SendIcon,
  SquarePenIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"
import { Avatar, AvatarFallback } from "sebs7n-ui/avatar"
import { List, ListRow } from "sebs7n-ui/list-row"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarItem, SidebarItemBadge, SidebarSearch } from "sebs7n-ui/sidebar"
import { SplitView, SplitViewBack, SplitViewDetail, SplitViewList, SplitViewSidebar, useSplitView, type SplitViewPane } from "sebs7n-ui/split-view"
import { Toolbar, ToolbarGroup } from "sebs7n-ui/toolbar"

import { ToolButton } from "./parts"

const BUZONES = [
  { id: "entrada", nombre: "Entrada", icono: InboxIcon, sinLeer: 3 },
  { id: "destacados", nombre: "Destacados", icono: StarIcon, sinLeer: 0 },
  { id: "enviados", nombre: "Enviados", icono: SendIcon, sinLeer: 0 },
  { id: "borradores", nombre: "Borradores", icono: FileTextIcon, sinLeer: 1 },
  { id: "archivo", nombre: "Archivo", icono: ArchiveIcon, sinLeer: 0 },
  { id: "papelera", nombre: "Papelera", icono: Trash2Icon, sinLeer: 0 },
]

const CARPETAS = [
  { id: "clientes", nombre: "Clientes", sinLeer: 2 },
  { id: "proveedores", nombre: "Proveedores", sinLeer: 0 },
]

const MENSAJES = [
  {
    id: "m1",
    de: "Nube Digital",
    iniciales: "ND",
    asunto: "Comprobante de pago · Factura 0013",
    vista: "Adjuntamos el comprobante de la transferencia por el total de la factura.",
    hora: "10:24",
    sinLeer: true,
    adjunto: "Comprobante 0013.pdf",
  },
  {
    id: "m2",
    de: "Estudio Ruiz",
    iniciales: "ER",
    asunto: "Consulta por la factura 0014",
    vista: "¿Nos podrían reenviar la factura con el nuevo domicilio fiscal?",
    hora: "09:02",
    sinLeer: true,
  },
  {
    id: "m3",
    de: "Acme S.A.",
    iniciales: "AS",
    asunto: "Orden de compra de octubre",
    vista: "Les compartimos la orden de compra para el próximo período.",
    hora: "Ayer",
    sinLeer: true,
    adjunto: "Orden de compra.pdf",
  },
  {
    id: "m4",
    de: "Taller Sur",
    iniciales: "TS",
    asunto: "Alta como cliente",
    vista: "Enviamos los datos para la facturación y el contacto de pagos.",
    hora: "Lunes",
    sinLeer: false,
  },
  {
    id: "m5",
    de: "Mesa de ayuda",
    iniciales: "MA",
    asunto: "Resumen semanal de cobranzas",
    vista: "Se cobraron 18 facturas y quedan 3 por cobrar.",
    hora: "25/09",
    sinLeer: false,
  },
]

// El contador de no leídos, como los de Archivos: texto gris al final de la fila, leído con contexto.
const contador = (n: number) => (n > 0 ? <SidebarItemBadge label={`${n} sin leer`}>{n}</SidebarItemBadge> : null)

function Mensajes({ elegido, onElegir }: { elegido: string; onElegir: (id: string) => void }) {
  const { setPane } = useSplitView()
  return (
    <List aria-label="Mensajes" className="px-2.5 pb-2.5">
      {MENSAJES.map((mensaje) => (
        <ListRow
          description={mensaje.asunto}
          dot={mensaje.sinLeer ? "brand" : undefined}
          key={mensaje.id}
          onClick={() => {
            onElegir(mensaje.id)
            setPane("detail")
          }}
          selected={elegido === mensaje.id}
          title={mensaje.de}
          trailing={<span className="text-footnote text-label-secondary">{mensaje.hora}</span>}
        />
      ))}
    </List>
  )
}

/** Mail: los buzones con sus contadores, la lista de mensajes y el mensaje abierto. */
export function MailShowcase() {
  const [buzon, setBuzon] = useState("entrada")
  const [elegido, setElegido] = useState("m1")
  // El panel lo lleva la pantalla: tocar un buzón (aunque ya sea el elegido) avanza a la lista, como
  // Mail en el teléfono. En ancho se ven los tres y el panel activo no cambia nada a la vista.
  const [pane, setPane] = useState<SplitViewPane>("list")
  const abrirBuzon = (id: string) => {
    setBuzon(id)
    setPane("list")
  }
  const mensaje = MENSAJES.find((item) => item.id === elegido)!
  const nombreBuzon = [...BUZONES, ...CARPETAS].find((item) => item.id === buzon)?.nombre

  return (
    <SplitView onPaneChange={setPane} pane={pane}>
      <SplitViewSidebar aria-label="Buzones">
        {/* El mismo `Sidebar` que Archivos: filas de 32, rótulos chicos en gris y el activo en gris.
            El panel del SplitView ya pone el ancho, el fondo y el borde. */}
        <Sidebar className="w-full border-r-0">
          <SidebarHeader>
            <SidebarSearch placeholder="Buscar en Correo" />
          </SidebarHeader>
          <SidebarContent aria-label="Buzones y carpetas">
            <SidebarGroup>
              <SidebarGroupLabel>Buzones</SidebarGroupLabel>
              {BUZONES.map(({ id, nombre, icono: Icono, sinLeer }) => (
                <SidebarItem active={buzon === id} icon={<Icono />} key={id} onClick={() => abrirBuzon(id)} render={<button type="button" />}>
                  {nombre}
                  {contador(sinLeer)}
                </SidebarItem>
              ))}
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Carpetas</SidebarGroupLabel>
              {CARPETAS.map(({ id, nombre, sinLeer }) => (
                <SidebarItem active={buzon === id} icon={<FolderIcon />} key={id} onClick={() => abrirBuzon(id)} render={<button type="button" />}>
                  {nombre}
                  {contador(sinLeer)}
                </SidebarItem>
              ))}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SplitViewSidebar>

      <SplitViewList aria-label="Mensajes">
        <Toolbar aria-label="Acciones de la lista" className="sticky top-0 z-10">
          <SplitViewBack>Buzones</SplitViewBack>
          <span className="ms-auto" />
          <ToolButton icon={FilterIcon} label="Filtrar" />
          <ToolButton icon={SquarePenIcon} label="Redactar" />
        </Toolbar>
        <header className="flex flex-col gap-0.5 px-5 pt-3 pb-2">
          <h3 className="text-title-1 text-label">{nombreBuzon}</h3>
          <p className="text-callout text-label-secondary">3 sin leer</p>
        </header>
        <Mensajes elegido={elegido} onElegir={setElegido} />
      </SplitViewList>

      <SplitViewDetail aria-label="Mensaje">
        <Toolbar aria-label="Acciones del mensaje" className="sticky top-0 z-10">
          <SplitViewBack>{nombreBuzon}</SplitViewBack>
          <ToolbarGroup aria-label="Mensaje" className="ms-auto flex items-center gap-1.5">
            <ToolButton icon={ArchiveIcon} label="Archivar" />
            <ToolButton icon={Trash2Icon} label="Eliminar" />
            <ToolButton icon={FlagIcon} label="Marcar" />
          </ToolbarGroup>
          <ToolButton icon={ReplyIcon} label="Responder" />
          <ToolButton icon={ForwardIcon} label="Reenviar" />
        </Toolbar>
        <article className="flex flex-col gap-5 px-6 py-5">
          <header className="flex items-start gap-3">
            <Avatar size="lg">
              <AvatarFallback>{mensaje.iniciales}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-headline text-label">{mensaje.de}</span>
                <span className="shrink-0 text-footnote text-label-secondary">{mensaje.hora}</span>
              </div>
              <span className="truncate text-callout text-label-secondary">Para: Cobranzas</span>
            </div>
          </header>
          <h3 className="text-title-2 text-label">{mensaje.asunto}</h3>
          <div className="flex max-w-[65ch] flex-col gap-3 text-body text-label">
            <p>Hola, ¿cómo están?</p>
            <p>{mensaje.vista}</p>
            <p>Quedamos atentos a cualquier consulta.</p>
            <p className="text-label-secondary">Saludos,<br />{mensaje.de}</p>
          </div>
          {mensaje.adjunto && (
            <div className="flex w-fit items-center gap-3 rounded-item border border-separator bg-surface-secondary px-3 py-2">
              <PaperclipIcon aria-hidden="true" className="size-4 text-label-secondary" />
              <span className="flex flex-col">
                <span className="text-callout text-label">{mensaje.adjunto}</span>
                <span className="text-footnote text-label-secondary">PDF · 84 KB</span>
              </span>
            </div>
          )}
        </article>
      </SplitViewDetail>
    </SplitView>
  )
}
