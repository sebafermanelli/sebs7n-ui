// El sitio corre en entorno `node` sin jsdom: `renderToString`, igual que los tests del dashboard.
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Pricing } from "../app/templates/landing/_components/pricing"
import { annualMonthly, FAQ, PLANS } from "../app/templates/landing/_data/content"
import LandingPage from "../app/templates/landing/page"

describe("precios", () => {
  it("anual = dos meses gratis, por mes y redondeado a entero", () => {
    expect(annualMonthly(12)).toBe(10)
    expect(annualMonthly(29)).toBe(24)
    expect(annualMonthly(0)).toBe(0)
  })

  it("en anual muestra el precio con descuento", () => {
    const html = renderToString(createElement(Pricing, { defaultPeriod: "annual" }))
    const paid = PLANS.find((plan) => plan.monthly > 0)!
    expect(html).toContain(`US$ ${annualMonthly(paid.monthly)}`)
  })

  it("un solo plan destacado, con el botón primario", () => {
    expect(PLANS.filter((plan) => plan.featured)).toHaveLength(1)
  })
})

describe("página", () => {
  const html = renderToString(createElement(LandingPage))

  it("tiene un h1 y las secciones con sus anclas", () => {
    expect(html.match(/<h1/g)).toHaveLength(1)
    for (const id of ["beneficios", "precios", "preguntas", "registro"]) expect(html).toContain(`id="${id}"`)
  })

  it("los links internos apuntan a anclas que existen", () => {
    const anchors = [...html.matchAll(/href="#([a-z-]+)"/g)].map(([, id]) => id)
    expect(anchors.length).toBeGreaterThan(0)
    for (const id of anchors) expect(html, id).toContain(`id="${id}"`)
  })

  it("trae los planes y las preguntas", () => {
    for (const plan of PLANS) expect(html).toContain(plan.name)
    for (const item of FAQ) expect(html).toContain(item.question)
  })
})

describe("vuelta a la galería", () => {
  it("en el sitio la barra vuelve a Templates", () => {
    expect(renderToString(createElement(LandingPage))).toContain('href="/templates"')
  })
})

