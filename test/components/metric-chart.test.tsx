import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { MetricChart } from "../../src/components/metric-chart"

const DATA = [
  { label: "Ene", value: 1200 },
  { label: "Feb", value: 2400 },
  { label: "Mar", value: 1800 },
  { label: "Abr", value: 3100 },
]

const chart = () => screen.getByRole("img", { name: "Cobros" })

describe("MetricChart", () => {
  it("es una imagen con nombre, resumen y una tabla con todos los datos", () => {
    render(<MetricChart aria-label="Cobros" data={DATA} />)
    expect(chart()).toHaveAccessibleDescription(/4 puntos, de Ene a Abr\. Mínimo 1\.200, máximo 3\.100, último 3\.100\./)
    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(screen.getAllByRole("row")).toHaveLength(5)
    expect(screen.getByRole("cell", { name: "2.400" })).toBeInTheDocument()
  })

  it("dibuja el área y la línea; area={false} deja solo la línea", () => {
    const { container, rerender } = render(<MetricChart aria-label="Cobros" data={DATA} />)
    expect(container.querySelectorAll("polygon")).toHaveLength(1)
    expect(container.querySelectorAll("polyline")).toHaveLength(1)
    rerender(<MetricChart area={false} aria-label="Cobros" data={DATA} />)
    expect(container.querySelectorAll("polygon")).toHaveLength(0)
  })

  it("el eje Y va a la derecha, con guías y etiquetas compactas redondeadas a 1-2-5", () => {
    const { container } = render(<MetricChart aria-label="Cobros" data={DATA} />)
    const axis = container.querySelector("[data-slot=metric-chart-axis]")!
    expect(Array.from(axis.querySelectorAll("span")).map((n) => n.textContent)).toEqual(["0", "2K", "4K"])
    expect(container.querySelectorAll("line")).toHaveLength(3)
  })

  it("showAxis={false} saca guías y etiquetas", () => {
    const { container } = render(<MetricChart aria-label="Cobros" data={DATA} showAxis={false} />)
    expect(container.querySelector("[data-slot=metric-chart-axis]")).toBeNull()
    expect(container.querySelectorAll("line")).toHaveLength(0)
  })

  it("format admite opciones de Intl y funciones; axisFormat manda en el eje", () => {
    const { container, rerender } = render(<MetricChart aria-label="Cobros" data={DATA} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />)
    expect(screen.getByRole("cell", { name: /3\.100/ })).toHaveTextContent("US$")
    rerender(<MetricChart aria-label="Cobros" axisFormat={(v) => `${v}!`} data={DATA} format={(v) => `${v} u.`} />)
    expect(screen.getByRole("cell", { name: "3100 u." })).toBeInTheDocument()
    expect(container.querySelector("[data-slot=metric-chart-axis] span")).toHaveTextContent("0!")
  })

  it("yTicks cambia la cantidad aproximada de etiquetas", () => {
    const { container } = render(<MetricChart aria-label="Cobros" data={DATA} yTicks={2} />)
    expect(container.querySelectorAll("[data-slot=metric-chart-axis] span").length).toBeLessThan(4)
  })

  it("varias series: una línea por serie con su color token y una columna por serie", () => {
    const { container } = render(
      <MetricChart
        aria-label="Cobros"
        series={[
          { name: "Cobrado", data: DATA },
          { name: "Facturado", data: DATA.map((d) => ({ ...d, value: d.value * 1.2 })), color: "amber" },
        ]}
      />
    )
    expect(container.querySelectorAll("polyline")).toHaveLength(2)
    expect(container.querySelector("g.text-amber-900")).not.toBeNull()
    expect(screen.getByRole("columnheader", { name: "Facturado" })).toBeInTheDocument()
  })

  it("el color de la serie única sale del token", () => {
    const { container } = render(<MetricChart aria-label="Cobros" color="red" data={DATA} />)
    expect(container.querySelector("g")).toHaveClass("text-red-900")
  })

  it("con menos de dos puntos, o con valores no finitos, no dibuja nada", () => {
    const { container, rerender } = render(<MetricChart aria-label="Cobros" data={[{ label: "Ene", value: 1 }]} />)
    expect(container.firstChild).toBeNull()
    rerender(<MetricChart aria-label="Cobros" data={[{ label: "a", value: Number.NaN }, { label: "b", value: 2 }]} />)
    expect(container.firstChild).toBeNull()
    rerender(<MetricChart aria-label="Cobros" data={[{ label: "a", value: 0 }, { label: "b", value: 0 }]} />)
    expect(container.querySelector("polyline")!.getAttribute("points")).not.toContain("NaN")
  })

  it("height fija el alto; sin él llena a su contenedor", () => {
    const { container, rerender } = render(<MetricChart aria-label="Cobros" data={DATA} height={120} />)
    expect(container.querySelector<HTMLElement>("[data-slot=metric-chart]")!.style.height).toBe("120px")
    rerender(<MetricChart aria-label="Cobros" data={DATA} />)
    expect(container.querySelector("[data-slot=metric-chart]")).toHaveClass("h-full", "min-h-32")
  })

  it("labels cambia los textos internos y una clave en undefined no pisa el default", () => {
    render(<MetricChart aria-label="Cobros" data={DATA} labels={{ period: "Mes", value: undefined, table: "Data" }} />)
    expect(screen.getByRole("columnheader", { name: "Mes" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Valor" })).toBeInTheDocument()
  })
})

describe("MetricChart: interacción", () => {
  it("es enfocable y al enfocar con el teclado muestra el último punto con su tooltip", async () => {
    const user = userEvent.setup()
    render(<MetricChart aria-label="Cobros" data={DATA} name="Cobrado" />)
    await user.tab()
    expect(chart()).toHaveFocus()
    const tip = document.querySelector("[data-slot=metric-chart-tooltip]")!
    expect(tip).toHaveTextContent("Abr")
    expect(tip.querySelector("strong")).toHaveTextContent("3.100")
    expect(tip).toHaveTextContent("Cobrado")
    expect(document.querySelector("[data-slot=metric-chart-cursor]")).not.toBeNull()
    expect(document.querySelectorAll("[data-slot=metric-chart-dot]")).toHaveLength(1)
  })

  it("las flechas mueven el punto, Inicio/Fin saltan y Escape lo suelta", async () => {
    const user = userEvent.setup()
    render(<MetricChart aria-label="Cobros" data={DATA} />)
    await user.tab()
    await user.keyboard("{ArrowLeft}")
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Mar")
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}")
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Ene")
    await user.keyboard("{ArrowRight}")
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Feb")
    await user.keyboard("{End}")
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Abr")
    await user.keyboard("{Escape}")
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toBeNull()
    await user.keyboard("{ArrowRight}")
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Ene")
  })

  it("anuncia el punto activo en una región viva", async () => {
    const user = userEvent.setup()
    render(<MetricChart aria-label="Cobros" data={DATA} />)
    await user.tab()
    await user.keyboard("{ArrowLeft}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent("Mar: 1.800")
  })

  it("al sacar el foco, el tooltip se va", async () => {
    const user = userEvent.setup()
    render(<MetricChart aria-label="Cobros" data={DATA} />)
    await user.tab()
    await user.tab()
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toBeNull()
  })

  it("el puntero activa el punto más cercano y al salir se suelta", async () => {
    const user = userEvent.setup()
    render(<MetricChart aria-label="Cobros" data={DATA} />)
    const frame = chart()
    frame.getBoundingClientRect = () => ({ left: 0, top: 0, width: 244, height: 100, right: 244, bottom: 100, x: 0, y: 0, toJSON: () => ({}) })
    await user.pointer({ target: frame, coords: { clientX: 0 } })
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Ene")
    await user.pointer({ target: frame, coords: { clientX: 100 } })
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toHaveTextContent("Mar")
    await user.unhover(frame)
    expect(document.querySelector("[data-slot=metric-chart-tooltip]")).toBeNull()
  })

  it("con varias series el tooltip lista cada una con su punto de color", async () => {
    const user = userEvent.setup()
    render(
      <MetricChart
        aria-label="Cobros"
        series={[
          { name: "Cobrado", data: DATA },
          { name: "Facturado", data: DATA, color: "green" },
        ]}
      />
    )
    await user.tab()
    expect(document.querySelectorAll("[data-slot=metric-chart-tooltip] strong")).toHaveLength(2)
    expect(document.querySelectorAll("[data-slot=metric-chart-dot]")).toHaveLength(2)
  })

  it("interactive={false}: sin foco, sin tooltip, igual con nombre y tabla", async () => {
    const user = userEvent.setup()
    render(<MetricChart aria-label="Cobros" data={DATA} interactive={false} />)
    await user.tab()
    expect(chart()).not.toHaveFocus()
    expect(chart()).not.toHaveAttribute("tabindex")
    expect(screen.getByRole("table")).toBeInTheDocument()
  })
})

describe("MetricChart: servidor", () => {
  it("renderiza en el servidor con el dibujo y la tabla, y solo el marco es cliente", async () => {
    const html = renderToString(<MetricChart aria-label="Cobros" data={DATA} />)
    expect(html).toContain("polyline")
    expect(html).toContain("<table")
    const { readFileSync } = await import("node:fs")
    const read = (path: string) => readFileSync(`${import.meta.dirname}/../../src/${path}`, "utf8")
    expect(read("components/metric-chart.tsx")).not.toMatch(/^"use client"/)
    expect(read("internal/metric-chart-frame.tsx")).toMatch(/^"use client"/)
  })

  it("respeta el movimiento reducido: no anima nada propio", async () => {
    const { readFileSync } = await import("node:fs")
    const source = readFileSync(`${import.meta.dirname}/../../src/internal/metric-chart-frame.tsx`, "utf8")
    expect(source).not.toMatch(/transition|animate|duration/)
  })
})
