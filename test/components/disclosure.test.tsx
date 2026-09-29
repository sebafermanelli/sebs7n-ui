import { readFileSync } from "node:fs"
import { join } from "node:path"

import { act, render, screen } from "@testing-library/react"
import * as React from "react"
import userEvent from "@testing-library/user-event"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Disclosure, DisclosureContent, DisclosureGroup, DisclosureTrigger } from "../../src/components/disclosure"

function Faq() {
  return (
    <DisclosureGroup>
      <Disclosure name="faq">
        <DisclosureTrigger>¿Puedo anular una factura?</DisclosureTrigger>
        <DisclosureContent>Con una nota de crédito por el mismo importe.</DisclosureContent>
      </Disclosure>
      <Disclosure name="faq">
        <DisclosureTrigger>¿Cuándo vence el CAE?</DisclosureTrigger>
        <DisclosureContent>A los diez días de emitida.</DisclosureContent>
      </Disclosure>
    </DisclosureGroup>
  )
}

describe("Disclosure", () => {
  it("es HTML del servidor: <details>/<summary> con el contenido adentro aunque esté cerrado", () => {
    const html = renderToString(<Faq />)
    expect(html).toMatch(/<details[^>]*name="faq"/)
    expect(html).toContain("<summary")
    expect(html).toContain("Con una nota de crédito por el mismo importe.")
    expect(html).not.toMatch(/<details[^>]*open/)
  })

  it("es un Server Component: el archivo no lleva \"use client\"", () => {
    const source = readFileSync(join(import.meta.dirname, "../../src/components/disclosure.tsx"), "utf8")
    expect(source).not.toMatch(/^\s*["']use client["']/m)
  })

  it("las filas de 2.0: separador arriba de cada una y abajo del grupo, 44 de alto, 17/600 y el chevron que gira al abrir", () => {
    render(<Faq />)
    const trigger = screen.getByText("¿Puedo anular una factura?").closest("summary")!
    expect(trigger).toHaveAttribute("data-slot", "disclosure-trigger")
    expect(trigger).toHaveClass("list-none", "min-h-11", "text-headline", "focus-visible:focus-ring", "[&::-webkit-details-marker]:hidden")
    expect(trigger.closest("details")).toHaveClass("group/disclosure", "border-t", "border-separator")
    expect(document.querySelector("[data-slot=disclosure-group]")).toHaveClass("border-b", "border-separator")
    const chevron = trigger.querySelector("svg")!
    expect(chevron).toHaveAttribute("aria-hidden", "true")
    expect(chevron).toHaveClass("group-open/disclosure:rotate-90", "motion-reduce:transition-none")
  })

  it("el navegador abre y cierra: un clic en el summary (Enter y Espacio los verifica el navegador de verdad)", async () => {
    const user = userEvent.setup()
    render(<Faq />)
    const details = screen.getByText("¿Cuándo vence el CAE?").closest("details")!
    await user.click(screen.getByText("¿Cuándo vence el CAE?"))
    expect(details.open).toBe(true)
  })

  it("variant=inline: el disparador en línea, 14 y gris, sin separadores, para un filtro plegado", () => {
    render(
      <Disclosure defaultOpen variant="inline">
        <DisclosureTrigger>Etiquetas (12)</DisclosureTrigger>
        <DisclosureContent>…</DisclosureContent>
      </Disclosure>
    )
    const details = document.querySelector("details")!
    expect(details).toHaveAttribute("data-variant", "inline")
    expect(details).toHaveAttribute("open")
    expect(details).not.toHaveClass("border-t")
    // Sin contexto (es Server Component): las partes leen la variante del <details> con `group-data-*`.
    const trigger = document.querySelector("summary")!
    expect(trigger).toHaveClass(
      "group-data-[variant=inline]/disclosure:inline-flex",
      "group-data-[variant=inline]/disclosure:min-h-0",
      "group-data-[variant=inline]/disclosure:text-callout",
      "group-data-[variant=inline]/disclosure:text-label-secondary"
    )
  })

  it("chevron={false} lo saca", () => {
    render(
      <Disclosure>
        <DisclosureTrigger chevron={false}>Detalle</DisclosureTrigger>
      </Disclosure>
    )
    expect(document.querySelector("summary svg")).toBeNull()
  })
})

describe("Disclosure open controlado", () => {
  it("onOpenChange avisa al abrir y cerrar (el toggle del <details>)", async () => {
    const onOpenChange = vi.fn()
    const { container } = render(
      <Disclosure defaultOpen={false} onOpenChange={onOpenChange}>
        <DisclosureTrigger>Plazos</DisclosureTrigger>
        <DisclosureContent>30 días</DisclosureContent>
      </Disclosure>
    )
    const details = container.querySelector("details")!
    details.open = true
    details.dispatchEvent(new Event("toggle"))
    expect(onOpenChange).toHaveBeenLastCalledWith(true)
  })

  it("con open, el estado es de la app: si no lo cambia, el <details> vuelve a como dice open", () => {
    const onOpenChange = vi.fn()
    const { container } = render(
      <Disclosure onOpenChange={onOpenChange} open={false}>
        <DisclosureTrigger>Plazos</DisclosureTrigger>
        <DisclosureContent>30 días</DisclosureContent>
      </Disclosure>
    )
    const details = container.querySelector("details")!
    details.open = true
    details.dispatchEvent(new Event("toggle"))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(details.open).toBe(false)
  })

  it("controlado de verdad: la app lo abre y lo cierra con open", () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <button onClick={() => setOpen((value) => !value)} type="button">
            Alternar
          </button>
          <Disclosure onOpenChange={setOpen} open={open}>
            <DisclosureTrigger>Plazos</DisclosureTrigger>
            <DisclosureContent>30 días</DisclosureContent>
          </Disclosure>
        </>
      )
    }
    const { container, getByRole } = render(<Controlled />)
    const details = container.querySelector("details")!
    act(() => getByRole("button", { name: "Alternar" }).click())
    expect(details.open).toBe(true)
    act(() => {
      details.open = false
      details.dispatchEvent(new Event("toggle"))
    })
    expect(details.open).toBe(false)
  })
})
