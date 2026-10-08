// El sitio corre en entorno `node` sin jsdom, igual que todos los tests del sitio.
// Usamos `renderToString` en lugar de `@testing-library/react` para evitar el
// problema de dos instancias de React (la del repo raíz y la del sitio).
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { DETAIL_STATUS, DashboardMetrics, metricItems } from "../app/templates/dashboard/_components/dashboard-metrics"
import { LAST_MONTH, metricSeries } from "../app/templates/dashboard/_data/derive"
import { seriesToCsv } from "../app/templates/dashboard/_lib/csv"
import { calculateMetrics, INVOICES_MOCK } from "../app/templates/dashboard/_data/invoices-mock"

describe("dashboard subcomponents", () => {
  const metrics = calculateMetrics(INVOICES_MOCK)

  it("DashboardMetrics renderiza las tarjetas con valores calculados", () => {
    const html = renderToString(createElement(DashboardMetrics, { metrics }))
    for (const label of ["Facturación total", "Pendientes de cobro", "Cobrado", "Facturas vencidas"]) {
      expect(html).toContain(label)
    }
  })

  it("cargando: los rótulos quedan, las cifras no", () => {
    const html = renderToString(createElement(DashboardMetrics, { metrics, loading: true }))
    expect(html).toContain("Facturación total")
    expect(html).toContain('data-slot="skeleton"')
    expect(html).not.toContain("US$")
  })

  it("metricItems: sin vencidas dice «Al día» y en singular no escribe «1 facturas»", () => {
    const none = metricItems({ ...metrics, overdueCount: 0, overdueAmount: 0, pendingCount: 1 })
    expect(none.find((item) => item.id === "overdue")!.badge).toMatchObject({ text: "Al día", color: "green" })
    expect(none.find((item) => item.id === "pending")!.value).toBe("1 factura")
  })

  it("con serie, los cuatro indicadores llevan su gráfico (sin ejes, con tooltip) y el menú «…»", () => {
    const series = { billed: [1, 2, 3], collected: [3, 2, 1], pending: [1, 1, 2], overdue: [0, 1, 1], labels: ["Jul 2026", "Ago 2026", "Sep 2026"] }
    const html = renderToString(createElement(DashboardMetrics, { metrics, series }))
    expect((html.match(/data-slot="metric-chart"/g) ?? []).length).toBe(4)
    // 3.0: las cards de métricas no llevan ejes por defecto (solo línea, área y tooltip).
    expect((html.match(/data-slot="metric-chart-axis"/g) ?? []).length).toBe(0)
    expect((html.match(/data-slot="stat-grid-chart"/g) ?? []).length).toBe(4)
    expect((html.match(/Opciones de /g) ?? []).length).toBe(4)
    expect(html).toContain("Sep 2026")
  })

  it("el período recalcula las series de las facturas: 6, 12 meses y lo que va del año", () => {
    const six = metricSeries(INVOICES_MOCK, LAST_MONTH, "6m")
    const twelve = metricSeries(INVOICES_MOCK, LAST_MONTH, "12m")
    const year = metricSeries(INVOICES_MOCK, LAST_MONTH, "ytd")
    expect([six.billed.length, twelve.billed.length, year.billed.length]).toEqual([6, 12, 9])
    expect(six.labels.at(-1)).toBe("Sep 2026")
    expect(year.labels[0]).toBe("Ene 2026")
    expect(twelve.billed.slice(-6)).toEqual(six.billed)
    expect(metricSeries(INVOICES_MOCK, LAST_MONTH, "6m")).toEqual(six)
  })

  it("«Ver detalle» filtra a Facturas por el estado de la métrica y exportar da un CSV de la serie", () => {
    expect(DETAIL_STATUS).toEqual({ billed: null, pending: "pending", paid: "paid", overdue: "overdue" })
    expect(seriesToCsv(["Mes", "Monto (USD)"], ["Ago 2026", "Sep 2026"], [100, 250])).toBe("Mes,Monto (USD)\nAgo 2026,100\nSep 2026,250")
  })

  it("el cambio contra el mes anterior lleva flecha y signo, y el color sale de si subir es bueno", () => {
    const [billed, , paid] = metricItems(metrics, { billed: [100, 150], collected: [200, 100], pending: [], overdue: [] })
    expect(billed!.delta).toBe("↗ 50 %")
    expect(billed!.trend).toBe("up")
    expect(paid!.delta).toBe("↘ 50 %")
    expect(paid!.trend).toBe("down")
  })
})
