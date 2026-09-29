import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Meter, StackedMeter } from "../../src/components/meter"

const track = () => document.querySelector("[data-slot=meter-track]")!
const indicator = () => document.querySelector("[data-slot=meter-indicator]") as HTMLElement

describe("Meter", () => {
  it("es un meter, no un progressbar: la medida se anuncia distinto que una tarea", () => {
    render(<Meter aria-label="Espacio usado" value={62} />)
    const meter = screen.getByRole("meter", { name: "Espacio usado" })
    expect(meter).toHaveAttribute("aria-valuenow", "62")
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "100")
    // Sin `format`, lo que se lee es la proporción, no el número crudo.
    expect(meter).toHaveAttribute("aria-valuetext", "62%")
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
  })

  it("el label visible es el nombre accesible: no hace falta aria-label", () => {
    render(<Meter label="Cupo mensual" value={30} />)
    expect(screen.getByRole("meter", { name: "Cupo mensual" })).toBeInTheDocument()
  })

  it("min y max propios: la proporción se calcula sobre el rango, no sobre 100", () => {
    render(<Meter aria-label="Legajos cargados" max={40} min={0} value={10} />)
    const meter = screen.getByRole("meter")
    expect(meter).toHaveAttribute("aria-valuenow", "10")
    expect(meter).toHaveAttribute("aria-valuemax", "40")
    expect(meter).toHaveAttribute("aria-valuetext", "25%")
    expect(indicator()).toHaveStyle({ width: "25%" })
  })

  it("un valor fuera de rango se recorta en vez de desbordar la pista", () => {
    render(<Meter aria-label="Cupo" max={100} value={140} />)
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "100")
    expect(indicator()).toHaveStyle({ width: "100%" })
  })

  it("format y locale cambian lo que se lee y lo que se ve, no el valor", () => {
    const { rerender } = render(
      <Meter
        aria-label="Consumo"
        format={{ style: "decimal" }}
        locale="es-AR"
        max={500000}
        showValue
        value={125000}
      />
    )
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "125000")
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "125.000")
    expect(screen.getByText("125.000")).toBeInTheDocument()

    rerender(
      <Meter
        aria-label="Consumo"
        format={{ style: "decimal" }}
        locale="en-US"
        max={500000}
        showValue
        value={125000}
      />
    )
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "125,000")
  })

  it("getAriaValueText reemplaza el texto que lee el lector, sin tocar lo que se ve", () => {
    render(
      <Meter
        aria-label="Espacio usado"
        getAriaValueText={(formateado) => `${formateado} de 2 TB`}
        showValue
        value={48}
      />
    )
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuetext", "48% de 2 TB")
    expect(screen.getByText("48%")).toBeInTheDocument()
  })

  it("showValue muestra el valor formateado y no se lo repite al lector", () => {
    render(<Meter label="Cupo" showValue value={40} />)
    const valor = screen.getByText("40%")
    expect(valor).toHaveAttribute("data-slot", "meter-value")
    expect(valor).toHaveAttribute("aria-hidden", "true")
  })

  it("tamaños sm (4px) y md (6px) en la pista, los mismos que Progress", () => {
    const { rerender } = render(<Meter aria-label="x" value={10} />)
    expect(screen.getByRole("meter")).toHaveAttribute("data-size", "md")
    expect(track()).toHaveClass("group-data-[size=sm]/meter:h-1", "group-data-[size=md]/meter:h-1.5")
    rerender(<Meter aria-label="x" size="sm" value={10} />)
    expect(screen.getByRole("meter")).toHaveAttribute("data-size", "sm")
  })

  it("usa los tokens del sistema y anima el ancho con transición propia", () => {
    render(<Meter aria-label="x" value={10} />)
    expect(track()).toHaveClass("bg-fill-3", "rounded-full", "overflow-hidden")
    expect(indicator()).toHaveClass("bg-brand-700", "transition-[width]", "motion-reduce:transition-none")
  })

  it("el className del llamador le gana a la clase base", () => {
    render(<Meter aria-label="x" className="w-40" trackClassName="rounded-sm" value={10} />)
    const meter = screen.getByRole("meter")
    expect(meter).toHaveClass("w-40")
    expect(meter.className).not.toMatch(/\bw-full\b/)
    expect(track()).toHaveClass("rounded-sm")
    expect(track().className).not.toMatch(/\brounded-full\b/)
  })
})

describe("Meter · R5a", () => {
  it("lg: la barra de Storage de iCloud, 16 de alto y radio 6; el valor en 14 sin mono", () => {
    render(<Meter label="Almacenamiento" showValue size="lg" value={40} />)
    const meter = screen.getByRole("meter")
    const track = meter.querySelector("[data-slot=meter-track]")!
    expect(track).toHaveClass("group-data-[size=lg]/meter:h-4", "group-data-[size=lg]/meter:rounded-meter")
    const valor = meter.querySelector("[data-slot=meter-value]")!
    expect(valor).toHaveClass("text-callout", "tabular-nums")
    expect(valor.className).not.toMatch(/mono/)
  })
})

describe("StackedMeter (R5b): la barra de almacenamiento de iCloud", () => {
  const SEGMENTOS = [
    { label: "Facturas", value: 13.5, color: "amber" as const },
    { label: "Documentos", value: 6.1, color: "purple" as const },
  ]
  const GB = { style: "unit", unit: "gigabyte", maximumFractionDigits: 1 } as const

  it("un grupo nombrado con un meter por segmento, que dice de qué es y cuánto", () => {
    render(<StackedMeter aria-label="Espacio de la cuenta" format={GB} locale="es-AR" max={50} segments={SEGMENTOS} />)
    const grupo = screen.getByRole("group", { name: "Espacio de la cuenta" })
    const meters = within(grupo).getAllByRole("meter")
    expect(meters).toHaveLength(2)
    expect(meters[0]).toHaveAccessibleName("Facturas")
    expect(meters[0]).toHaveAttribute("aria-valuenow", "13.5")
    expect(meters[0]).toHaveAttribute("aria-valuemax", "50")
    expect(meters[0]).toHaveAttribute("aria-valuetext", "13,5 GB")
    // El ancho es la proporción sobre el total, y el color sale de la paleta de Badge.
    expect(meters[0]).toHaveStyle({ width: "27%" })
    expect(meters[0]).toHaveClass("bg-amber-700")
  })

  it("pista de 16 con radio 6, segmentos a 1 px, y el resto queda gris", () => {
    render(<StackedMeter aria-label="Espacio" max={50} segments={SEGMENTOS} />)
    const pista = document.querySelector("[data-slot=stacked-meter-track]")!
    expect(pista).toHaveClass("h-4", "rounded-meter", "gap-px", "bg-fill-3", "overflow-hidden")
  })

  it("la cabecera: Libre · Usado (21/600, libre en gris) y el chip del total", () => {
    render(<StackedMeter aria-label="Espacio" format={GB} locale="es-AR" max={50} segments={SEGMENTOS} total="50 GB" />)
    const resumen = document.querySelector("[data-slot=stacked-meter-summary]")!
    expect(resumen).toHaveClass("text-title-2")
    expect(resumen).toHaveTextContent("Libre 30,4 GB · Usado 19,6 GB")
    expect(screen.getByText(/Libre/)).toHaveClass("text-label-secondary")
    const chip = screen.getByText("50 GB")
    expect(chip).toHaveClass("rounded-item", "bg-white", "text-title-1", "font-bold")
  })

  it("labels traduce Libre y Usado; legend muestra el desglose con puntos", () => {
    render(
      <StackedMeter aria-label="Storage" labels={{ free: "Free", used: "Used" }} legend max={50} segments={SEGMENTOS} />
    )
    expect(document.querySelector("[data-slot=stacked-meter-summary]")).toHaveTextContent("Free 30.4 · Used 19.6")
    const leyenda = screen.getByRole("list")
    expect(within(leyenda).getAllByRole("listitem")).toHaveLength(2)
    expect(within(leyenda).getByText("Facturas")).toBeInTheDocument()
  })
})

describe("StackedMeter · valores fuera de rango", () => {
  it("si lo usado pasa el máximo, la barra se escala a lo usado y los meters no pasan su máximo", async () => {
    render(
      <StackedMeter
        aria-label="Espacio"
        max={10}
        segments={[
          { label: "Fotos", value: 9, color: "amber" },
          { label: "Documentos", value: 6, color: "blue" },
        ]}
      />
    )
    const [fotos, documentos] = screen.getAllByRole("meter")
    expect(fotos).toHaveStyle({ width: "60%" })
    expect(documentos).toHaveStyle({ width: "40%" })
    for (const meter of [fotos!, documentos!]) expect(Number(meter.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(Number(meter.getAttribute("aria-valuemax")))
    expect(screen.getByText(/Libre/)).toHaveTextContent("Libre 0")
  })

  it("max 0 o valores negativos no dan NaN", async () => {
    render(<StackedMeter aria-label="Espacio" max={0} segments={[{ label: "Fotos", value: -2, color: "amber" }]} />)
    const meter = screen.getByRole("meter")
    expect(meter.style.width).toBe("0%")
    expect(meter).toHaveAttribute("aria-valuenow", "0")
  })
})
