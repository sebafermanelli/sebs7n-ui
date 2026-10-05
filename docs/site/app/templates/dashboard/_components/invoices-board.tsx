"use client"

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { ArrowRightLeftIcon, BanIcon, GripVerticalIcon, PanelRightIcon } from "lucide-react"
import { useState, type ComponentType, type ReactNode } from "react"
import { Badge } from "sebs7n-ui/badge"
import { RowActions } from "sebs7n-ui/row-actions"
import { Button } from "sebs7n-ui/button"
import { Card, CardContent } from "sebs7n-ui/card"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "sebs7n-ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "sebs7n-ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "sebs7n-ui/tooltip"
import { linkVariants } from "sebs7n-ui/variants/link"
import { toast } from "sonner"

import type { Invoice } from "../_data/invoices-mock"
import { BOARD_COLUMNS, boardGroups, boardMove, movesFrom, type BoardColumn, type BoardMove } from "../_lib/board"
import { formatDayMonth, plural, wholeMoney } from "../_lib/format"
import { STATUS_BADGE } from "./invoice-status"

interface InvoicesBoardProps {
  invoices: Invoice[]
  /** Cobrar o reabrir una factura: lo decide `boardMove` y lo ejecuta la página (con su «Deshacer»). */
  onMove: (invoice: Invoice, move: BoardMove) => void
  onOpenDetail: (invoice: Invoice) => void
  onVoid: (invoice: Invoice) => void
}

const columnTitle = (id: UniqueIdentifier) => BOARD_COLUMNS.find((column) => column.id === id)?.title ?? String(id)

// Con el puntero, la columna que está bajo el cursor; con el teclado (sin cursor), la que más se pisa.
const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args)
  return within.length > 0 ? within : rectIntersection(args)
}

// El teclado salta de columna en columna con las flechas izquierda y derecha, en vez de los 25 px de
// cada paso por defecto: soltar «sobre» una columna con teclas de a 25 px sería una carrera.
const columnCoordinates: KeyboardCoordinateGetter = (event, { context: { active, collisionRect, droppableRects, droppableContainers } }) => {
  if (!active || !collisionRect) return undefined
  if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") return undefined
  event.preventDefault()
  const columns = droppableContainers
    .getEnabled()
    .map((container) => ({ id: container.id, rect: droppableRects.get(container.id) }))
    .filter((column): column is { id: UniqueIdentifier; rect: NonNullable<typeof column.rect> } => column.rect !== undefined)
    .sort((a, b) => a.rect.left - b.rect.left || a.rect.top - b.rect.top)
  const center = collisionRect.left + collisionRect.width / 2
  const current = columns.findIndex((column) => center >= column.rect.left && center <= column.rect.left + column.rect.width)
  const next = columns[Math.min(columns.length - 1, Math.max(0, (current === -1 ? 0 : current) + (event.code === "ArrowRight" ? 1 : -1)))]
  return next ? { x: next.rect.left + 12, y: next.rect.top + 12 } : undefined
}

export default function InvoicesBoard({ invoices, onMove, onOpenDetail, onVoid }: InvoicesBoardProps) {
  const groups = boardGroups(invoices)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const active = invoices.find((invoice) => invoice.id === activeId) ?? null
  const sensors = useSensors(
    // Con una distancia mínima, un click en la tarjeta no es un arrastre.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: columnCoordinates })
  )

  const drop = (invoice: Invoice, to: BoardColumn) => {
    const move = boardMove(invoice, to)
    if (move) return onMove(invoice, move)
    if (to === "overdue") toast.info("Una factura pasa a vencida por su fecha: no se puede mover ahí a mano.")
  }

  const onDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    setActiveId(null)
    const invoice = invoices.find((item) => item.id === dragged.id)
    if (invoice && over) drop(invoice, over.id as BoardColumn)
  }

  // Los anuncios del lector de pantalla, en español: los de por defecto vienen en inglés.
  const announcements: Announcements = {
    onDragStart: ({ active: item }) => `Levantaste la factura ${item.id}.`,
    onDragOver: ({ active: item, over }) => {
      const invoice = invoices.find((candidate) => candidate.id === item.id)
      if (!over || !invoice) return `La factura ${item.id} no está sobre ninguna columna.`
      return boardMove(invoice, over.id as BoardColumn) || over.id === invoice.status ? `La factura ${item.id} está sobre ${columnTitle(over.id)}.` : `La factura ${item.id} está sobre ${columnTitle(over.id)}, donde no se puede soltar.`
    },
    onDragEnd: ({ active: item, over }) => {
      const invoice = invoices.find((candidate) => candidate.id === item.id)
      if (!over || !invoice) return `Soltaste la factura ${item.id} fuera de las columnas: no cambió.`
      const move = boardMove(invoice, over.id as BoardColumn)
      return move ? `Soltaste la factura ${item.id} en ${columnTitle(over.id)}.` : `La factura ${item.id} sigue en ${columnTitle(invoice.status)}.`
    },
    onDragCancel: ({ active: item }) => `Cancelaste el movimiento de la factura ${item.id}.`,
  }

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: "Para mover la factura, apretá Espacio. Con las flechas izquierda y derecha elegís la columna y con Espacio la soltás. Escape cancela.",
        },
      }}
      autoScroll={false}
      collisionDetection={collision}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={onDragEnd}
      onDragStart={({ active: item }) => setActiveId(item.id)}
      sensors={sensors}
    >
      <div className="grid grid-cols-1 gap-4 @3xl:grid-cols-3">
        {BOARD_COLUMNS.map((column) => (
          <BoardColumnView active={active} column={column} invoices={groups[column.id]} key={column.id}>
            {groups[column.id].map((invoice) => (
              <BoardCard invoice={invoice} key={invoice.id} onMove={onMove} onOpenDetail={onOpenDetail} onVoid={onVoid} />
            ))}
          </BoardColumnView>
        ))}
      </div>
      <DragOverlay>{active ? <BoardCardBody handle={null} invoice={active} onOpenDetail={() => {}} /> : null}</DragOverlay>
    </DndContext>
  )
}

function BoardColumnView({ column, invoices, active, children }: { column: (typeof BOARD_COLUMNS)[number]; invoices: Invoice[]; active: Invoice | null; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const accepts = active ? boardMove(active, column.id) !== null : false
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const headingId = `board-${column.id}`
  return (
    <section
      aria-labelledby={headingId}
      // Sobre una columna que acepta, un tono neutro; nunca el acento (la selección es gris) ni solo color: la
      // columna que no acepta no cambia y el anuncio del lector lo dice.
      className={`flex min-w-0 flex-col gap-3 rounded-surface p-3 transition-colors ${isOver && accepts ? "bg-fill-3" : "bg-grouped"}`}
      ref={setNodeRef}
    >
      <header className="flex items-start justify-between gap-2 px-1">
        <div className="flex min-w-0 flex-col">
          <h3 className="text-headline text-label" id={headingId}>
            {column.title}
          </h3>
          <p className="text-footnote text-label-secondary">{column.hint}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className="text-callout text-label tabular-nums">{wholeMoney.format(total)}</span>
          <span className="text-footnote text-label-secondary">{plural(invoices.length, "factura", "facturas")}</span>
        </div>
      </header>
      {invoices.length === 0 ? (
        <p className="rounded-field border border-dashed border-separator px-3 py-6 text-center text-callout text-label-secondary">
          {column.id === "overdue" ? "Ninguna vencida." : "Soltá una factura acá."}
        </p>
      ) : (
        // El scroll recorta lo que sale de su caja, incluida la sombra de las cards: el padding le da lugar
        // y el margen negativo lo devuelve, así la lista no se corre.
        <ul
          aria-label={column.title}
          className="flex flex-col gap-2 @3xl:-mx-3 @3xl:-mt-1 @3xl:-mb-3 @3xl:max-h-[640px] @3xl:overflow-y-auto @3xl:px-3 @3xl:pt-1 @3xl:pb-3"
          role="list"
        >
          {children}
        </ul>
      )}
    </section>
  )
}

function BoardCard({ invoice, onMove, onOpenDetail, onVoid }: Pick<InvoicesBoardProps, "onMove" | "onOpenDetail" | "onVoid"> & { invoice: Invoice }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({ id: invoice.id, attributes: { roleDescription: "factura movible" } })
  const moves = movesFrom(invoice)
  const actions = (Item: ComponentType<{ children?: ReactNode; onClick?: () => void; variant?: "default" | "destructive" }>, Separator: ComponentType) => (
    <>
      <Item onClick={() => onOpenDetail(invoice)}>
        <PanelRightIcon />
        Ver detalle
      </Item>
      {moves.map((column) => (
        <Item key={column.id} onClick={() => onMove(invoice, boardMove(invoice, column.id)!)}>
          <ArrowRightLeftIcon />
          {`Mover a ${column.title.toLocaleLowerCase("es")}`}
        </Item>
      ))}
      {invoice.status !== "void" && (
        <>
          <Separator />
          <Item onClick={() => onVoid(invoice)} variant="destructive">
            <BanIcon />
            Anular factura
          </Item>
        </>
      )}
    </>
  )

  return (
    <li className={isDragging ? "opacity-40" : undefined} ref={setNodeRef}>
      <ContextMenu>
        <ContextMenuTrigger className="block rounded-surface">
          <BoardCardBody
            handle={
              <>
                <RowActions label={`Acciones para ${invoice.id}`}>{actions(DropdownMenuItem, DropdownMenuSeparator)}</RowActions>
                <Tooltip>
                  <TooltipTrigger
                    render={<Button aria-label={`Mover ${invoice.id}: apretá Espacio y usá las flechas`} className="touch-none" size="icon-sm" variant="plain" {...attributes} {...listeners} ref={setActivatorNodeRef} />}
                  >
                    <GripVerticalIcon />
                  </TooltipTrigger>
                  <TooltipContent>Arrastrar para mover</TooltipContent>
                </Tooltip>
              </>
            }
            invoice={invoice}
            onOpenDetail={onOpenDetail}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>{actions(ContextMenuItem, ContextMenuSeparator)}</ContextMenuContent>
      </ContextMenu>
    </li>
  )
}

// Lo que se ve de la tarjeta, sin hooks de arrastre: es lo mismo en la columna y en el `DragOverlay`.
function BoardCardBody({ invoice, handle, onOpenDetail }: { invoice: Invoice; handle: ReactNode; onOpenDetail: (invoice: Invoice) => void }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <button className={linkVariants({ variant: "row" })} onClick={() => onOpenDetail(invoice)} type="button">
            {invoice.id}
          </button>
          <div className="-my-1 -mr-1 flex items-center">{handle}</div>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body text-label">{invoice.customer}</span>
          <span className="truncate text-callout text-label-secondary">{invoice.concept}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-callout font-medium text-label tabular-nums">{wholeMoney.format(invoice.amount)}</span>
          <span className="flex items-center gap-1.5 text-callout text-label-secondary">
            {invoice.status === "overdue" && (
              <Badge color={STATUS_BADGE.overdue.color} size="sm">
                Vencida
              </Badge>
            )}
            {invoice.status === "paid" && invoice.paidAt ? `Cobrada el ${formatDayMonth(invoice.paidAt)}` : `Vence ${formatDayMonth(invoice.dueDate)}`}
          </span>
        </div>
        {(invoice.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {invoice.tags!.map((tag) => (
              <Badge color="gray" key={tag} size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
