import { renderToStaticMarkup } from "react-dom/server"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Timeline, TimelineGroup, TimelineItem } from "../../src/components/timeline"

describe("Timeline", () => {
  it("es una lista ordenada con nombre, un ítem por evento", () => {
    render(
      <Timeline aria-label="Actividad de la factura A-0012">
        <TimelineItem dateTime="2026-09-29T10:12" time="10:12" title="Factura emitida" />
        <TimelineItem dateTime="2026-09-29T10:15" time="10:15" title="Enviada a Acme S.A." />
      </Timeline>
    )
    const lista = screen.getByRole("list", { name: "Actividad de la factura A-0012" })
    expect(lista.tagName).toBe("OL")
    expect(within(lista).getAllByRole("listitem")).toHaveLength(2)
  })

  it("título 17, detalle 14 gris y la hora en un <time> a la derecha", () => {
    render(
      <Timeline aria-label="Actividad">
        <TimelineItem dateTime="2026-09-29T10:12" description="Por correo a pagos@acme.example" time="10:12" title="Enviada" />
      </Timeline>
    )
    expect(screen.getByText("Enviada")).toHaveClass("text-body", "text-label")
    expect(screen.getByText("Por correo a pagos@acme.example")).toHaveClass("text-callout", "text-label-secondary")
    const hora = screen.getByText("10:12")
    expect(hora.tagName).toBe("TIME")
    expect(hora).toHaveAttribute("datetime", "2026-09-29T10:12")
    expect(hora).toHaveClass("text-callout", "text-label-secondary", "tabular-nums")
  })

  it("sin dateTime la hora va en un <span>: un <time> tiene que traer una fecha válida", () => {
    render(
      <Timeline aria-label="Actividad">
        <TimelineItem time="Ayer" title="Enviada" />
      </Timeline>
    )
    const hora = screen.getByText("Ayer")
    expect(hora.tagName).toBe("SPAN")
    expect(hora).toHaveClass("text-callout", "text-label-secondary", "tabular-nums")
  })

  it("el punto de 8 en el color de la categoría, o un ícono en su lugar; decorativos", () => {
    render(
      <Timeline aria-label="Actividad">
        <TimelineItem dot="green" title="Pagada" />
        <TimelineItem icon={<svg data-testid="icono" />} title="Recordatorio" />
      </Timeline>
    )
    const [pagada, recordatorio] = document.querySelectorAll("[data-slot=timeline-marker]")
    expect(pagada!.querySelector("[data-slot=timeline-dot]")).toHaveClass("size-2", "bg-green-700")
    expect(recordatorio).toContainElement(screen.getByTestId("icono"))
    expect(pagada).toHaveAttribute("aria-hidden", "true")
  })

  it("la línea une los puntos y no sigue después del último", () => {
    render(
      <Timeline aria-label="Actividad">
        <TimelineItem title="Uno" />
        <TimelineItem title="Dos" />
      </Timeline>
    )
    const lineas = document.querySelectorAll("[data-slot=timeline-connector]")
    expect(lineas[0]).toHaveClass("w-px", "bg-separator", "group-last/timeline-item:hidden")
  })

  it("grupos por día: cabecera 19/600 que nombra su propia lista", () => {
    render(
      <Timeline aria-label="Actividad">
        <TimelineGroup title="Hoy">
          <TimelineItem title="Pagada" />
        </TimelineGroup>
        <TimelineGroup title="Ayer">
          <TimelineItem title="Emitida" />
          <TimelineItem title="Enviada" />
        </TimelineGroup>
      </Timeline>
    )
    expect(screen.getByText("Hoy")).toHaveClass("text-title-3")
    expect(within(screen.getByRole("list", { name: "Ayer" })).getAllByRole("listitem")).toHaveLength(2)
  })

  it("acciones debajo del detalle", () => {
    render(
      <Timeline aria-label="Actividad">
        <TimelineItem actions={<button type="button">Reenviar</button>} title="Rebotó el correo" />
      </Timeline>
    )
    expect(screen.getByRole("button", { name: "Reenviar" }).closest("[data-slot=timeline-actions]")).not.toBeNull()
  })

  it("sin estado: se renderiza en el servidor", () => {
    const html = renderToStaticMarkup(
      <Timeline aria-label="Actividad">
        <TimelineItem title="Emitida" />
      </Timeline>
    )
    expect(html).toContain("Emitida")
  })
})
