import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { LabelsProvider, defaultLabels } from "../../src/lib/labels"
import { NotificationsPopover, type NotificationItem } from "../../src/components/notifications-popover"

const items: NotificationItem[] = [
  { id: "a", title: "Factura vencida", description: "Acme S.A.", time: "hace 5 min", tone: "red" },
  { id: "b", title: "Cobro recibido", time: "ayer" },
]

describe("NotificationsPopover", () => {
  it("la campana dice el número con todas las letras", () => {
    render(<NotificationsPopover items={items} />)
    expect(screen.getByRole("button", { name: "Avisos, 2 sin leer" })).toBeInTheDocument()
  })

  it("abrir no marca nada; la lista muestra cada aviso con la etiqueta «Nueva»", async () => {
    const user = userEvent.setup()
    render(<NotificationsPopover items={items} />)
    await user.click(screen.getByRole("button", { name: "Avisos, 2 sin leer" }))
    expect(await screen.findByText("2 sin leer")).toBeInTheDocument()
    expect(screen.getAllByText("Nueva")).toHaveLength(2)
    expect(screen.getByRole("list", { name: "Avisos" })).toBeInTheDocument()
    expect(screen.getByText(/hace 5 min · Acme S\.A\./)).toBeInTheDocument()
  })

  it("marcar todas, sin controlar: baja el contador y avisa el total", async () => {
    const user = userEvent.setup()
    const onReadChange = vi.fn()
    render(<NotificationsPopover defaultRead={["a"]} items={items} onReadChange={onReadChange} />)
    await user.click(screen.getByRole("button", { name: "Avisos, 1 sin leer" }))
    await user.click(await screen.findByRole("button", { name: "Marcar todas como leídas" }))
    expect(onReadChange).toHaveBeenCalledWith(["a", "b"])
    expect(screen.getByRole("button", { name: "Avisos" })).toBeInTheDocument()
    expect(screen.getByText("Estás al día")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Marcar todas como leídas" })).toBeDisabled()
  })

  it("controlado: no cambia solo, manda la app", async () => {
    const user = userEvent.setup()
    const onReadChange = vi.fn()
    render(<NotificationsPopover items={items} onReadChange={onReadChange} read={[]} />)
    await user.click(screen.getByRole("button", { name: "Avisos, 2 sin leer" }))
    await user.click(await screen.findByRole("button", { name: "Marcar todas como leídas" }))
    expect(onReadChange).toHaveBeenCalledWith(["a", "b"])
    expect(screen.getByRole("button", { name: "Avisos, 2 sin leer" })).toBeInTheDocument()
  })

  it("sin avisos dice que no hay y deja apagado el botón", async () => {
    const user = userEvent.setup()
    render(<NotificationsPopover items={[]} />)
    await user.click(screen.getByRole("button", { name: "Avisos" }))
    expect(await screen.findByText("Todavía no hay avisos.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Marcar todas como leídas" })).toBeDisabled()
  })

  it("Escape cierra y devuelve el foco a la campana", async () => {
    const user = userEvent.setup()
    render(<NotificationsPopover items={items} />)
    const bell = screen.getByRole("button", { name: "Avisos, 2 sin leer" })
    await user.click(bell)
    await screen.findByText("2 sin leer")
    await user.keyboard("{Escape}")
    expect(screen.queryByText("2 sin leer")).not.toBeInTheDocument()
    expect(bell).toHaveFocus()
  })

  it("los textos salen del provider y la prop labels les gana", () => {
    const { rerender } = render(
      <LabelsProvider value={{ ...defaultLabels, notifications: { title: "Alerts", unreadDetail: "unread", upToDate: "", empty: "", markAllRead: "", unreadBadge: "" } }}>
        <NotificationsPopover items={items} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Alerts, 2 unread" })).toBeInTheDocument()
    rerender(
      <LabelsProvider value={{ ...defaultLabels, notifications: { title: "Alerts", unreadDetail: "unread", upToDate: "", empty: "", markAllRead: "", unreadBadge: "" } }}>
        <NotificationsPopover items={items} labels={{ title: "Inbox" }} />
      </LabelsProvider>
    )
    expect(screen.getByRole("button", { name: "Inbox, 2 unread" })).toBeInTheDocument()
  })

  it("renderiza en el servidor", () => {
    expect(renderToString(<NotificationsPopover items={items} />)).toContain("Avisos, 2 sin leer")
  })
})
