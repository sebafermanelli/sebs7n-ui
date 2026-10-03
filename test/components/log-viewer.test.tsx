import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LogViewer, type LogLine } from "../../src/components/log-viewer"

const lines: LogLine[] = [
  { id: 1, time: "14:02:11", message: "Generando factura" },
  { id: 2, time: "14:02:14", level: "warn", message: "Reintento 1" },
  { id: 3, time: "14:02:19", level: "error", message: "Buzón lleno", source: "mailer" },
]

describe("LogViewer", () => {
  it("es una región log con nombre y entra en el orden de Tab", async () => {
    const user = userEvent.setup()
    render(<LogViewer aria-label="Log del despliegue" lines={lines} />)
    const log = screen.getByRole("log", { name: "Log del despliegue" })
    expect(log).toHaveAttribute("tabindex", "0")
    await user.tab()
    expect(log).toHaveFocus()
  })

  it("sin aria-label usa el nombre por defecto", () => {
    render(<LogViewer lines={lines} />)
    expect(screen.getByRole("log", { name: "Registro" })).toBeInTheDocument()
  })

  it("el nivel va en texto además del color: warn y error escritos, info solo para el lector", () => {
    render(<LogViewer lines={lines} />)
    const rows = [...document.querySelectorAll("[data-slot=log-line]")]
    expect(rows[0]).toHaveAttribute("data-level", "info")
    expect(rows[0]!.querySelector(".sr-only")).toHaveTextContent("Info")
    expect(rows[1]).toHaveTextContent("Aviso: Reintento 1")
    expect(rows[1]!.querySelector(".text-amber-ink")).not.toBeNull()
    expect(rows[2]).toHaveTextContent("Error: Buzón lleno")
    expect(rows[2]!.querySelector(".text-red-ink")).not.toBeNull()
    expect(rows[2]).toHaveTextContent("mailer")
  })

  it("estado vacío y de carga", () => {
    const { rerender } = render(<LogViewer lines={[]} />)
    expect(screen.getByRole("log")).toHaveTextContent("Todavía no hay líneas.")
    rerender(<LogViewer emptyMessage="Ninguna línea coincide." lines={[]} />)
    expect(screen.getByRole("log")).toHaveTextContent("Ninguna línea coincide.")
    rerender(<LogViewer lines={lines} loading />)
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("log")).toHaveTextContent("Cargando…")
    expect(document.querySelector("[data-slot=log-line]")).toBeNull()
  })

  // jsdom no hace layout: el alto de contenido y de la vista se fijan a mano.
  function metrics(node: HTMLElement, scrollHeight: number, clientHeight: number) {
    Object.defineProperty(node, "scrollHeight", { configurable: true, get: () => scrollHeight })
    Object.defineProperty(node, "clientHeight", { configurable: true, get: () => clientHeight })
  }

  it("follow: baja con las líneas nuevas si estaba al final", () => {
    const { rerender } = render(<LogViewer lines={lines.slice(0, 2)} />)
    const log = screen.getByRole("log")
    metrics(log, 500, 100)
    rerender(<LogViewer lines={lines} />)
    expect(log.scrollTop).toBe(500)
  })

  it("follow: si subiste a leer, no te mueve", () => {
    const { rerender } = render(<LogViewer lines={lines.slice(0, 2)} />)
    const log = screen.getByRole("log")
    metrics(log, 500, 100)
    log.scrollTop = 50
    fireEvent.scroll(log)
    rerender(<LogViewer lines={lines} />)
    expect(log.scrollTop).toBe(50)
  })

  it("follow={false} no baja nunca", () => {
    const { rerender } = render(<LogViewer follow={false} lines={lines.slice(0, 2)} />)
    const log = screen.getByRole("log")
    metrics(log, 500, 100)
    rerender(<LogViewer follow={false} lines={lines} />)
    expect(log.scrollTop).toBe(0)
  })

  it("variant terminal lo fuerza oscuro", () => {
    render(<LogViewer lines={lines} variant="terminal" />)
    expect(screen.getByRole("log")).toHaveClass("dark")
  })
})
